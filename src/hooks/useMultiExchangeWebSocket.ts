'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Liquidation, Exchange, ExchangeConnection } from '@/types';

const MAX_LIQUIDATIONS = 200;
const RECONNECT_DELAY = 3000;

interface WebSocketConfig {
  exchange: Exchange;
  url: string;
  subscribe?: object;
  parse: (data: unknown, threshold: number) => Liquidation | null;
}

const EXCHANGES: WebSocketConfig[] = [
  // Binance Futures
  {
    exchange: 'Binance',
    url: 'wss://fstream.binance.com/ws/btcusdt@forceOrder',
    parse: (data: unknown, threshold: number) => {
      const msg = data as { o?: { s: string; S: string; q: string; p: string; T: number } };
      const order = msg.o;
      if (!order) return null;

      const quantity = parseFloat(order.q);
      const price = parseFloat(order.p);
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return null;

      return {
        id: `binance-${order.T}-${Math.random().toString(36).substr(2, 9)}`,
        exchange: 'Binance',
        symbol: order.s,
        side: order.S === 'SELL' ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(order.T),
      };
    },
  },
  // Bybit
  {
    exchange: 'Bybit',
    url: 'wss://stream.bybit.com/v5/public/linear',
    subscribe: { op: 'subscribe', args: ['liquidation.BTCUSDT'] },
    parse: (data: unknown, threshold: number) => {
      const msg = data as {
        topic?: string;
        data?: {
          symbol: string;
          side: string;
          size: string;
          price: string;
          updatedTime: number;
        };
      };

      if (!msg.topic?.includes('liquidation') || !msg.data) return null;

      const liq = msg.data;
      if (!liq.symbol?.startsWith('BTC')) return null;

      const quantity = parseFloat(liq.size);
      const price = parseFloat(liq.price);
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return null;

      return {
        id: `bybit-${liq.updatedTime}-${Math.random().toString(36).substr(2, 9)}`,
        exchange: 'Bybit',
        symbol: liq.symbol,
        side: liq.side === 'Sell' ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(liq.updatedTime),
      };
    },
  },
  // OKX
  {
    exchange: 'OKX',
    url: 'wss://ws.okx.com:8443/ws/v5/public',
    subscribe: { op: 'subscribe', args: [{ channel: 'liquidation-orders', instType: 'SWAP' }] },
    parse: (data: unknown, threshold: number) => {
      const msg = data as {
        arg?: { channel: string };
        data?: Array<{
          instId: string;
          side: string;
          sz: string;
          bkPx: string;
          ts: string;
        }>;
      };

      if (msg.arg?.channel !== 'liquidation-orders' || !msg.data?.[0]) return null;

      const liq = msg.data[0];
      if (!liq.instId?.includes('BTC')) return null;

      const quantity = parseFloat(liq.sz);
      const price = parseFloat(liq.bkPx);
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return null;

      return {
        id: `okx-${liq.ts}-${Math.random().toString(36).substr(2, 9)}`,
        exchange: 'OKX',
        symbol: liq.instId,
        side: liq.side === 'sell' ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(parseInt(liq.ts)),
      };
    },
  },
  // Hyperliquid - Subscribe to all trades and filter for liquidations
  {
    exchange: 'Hyperliquid',
    url: 'wss://api.hyperliquid.xyz/ws',
    subscribe: {
      method: 'subscribe',
      subscription: { type: 'allMids' }, // We'll also subscribe to trades
    },
    parse: (data: unknown, threshold: number) => {
      const msg = data as {
        channel?: string;
        data?: {
          coin?: string;
          side?: string;
          px?: string;
          sz?: string;
          time?: number;
          liquidation?: boolean;
          startPosition?: boolean;
          dir?: string;
          closedPnl?: string;
        };
      };

      // Check if it's a fill with liquidation
      if (!msg.data || !msg.data.liquidation) return null;
      if (!msg.data.coin?.toUpperCase().includes('BTC')) return null;

      const quantity = parseFloat(msg.data.sz || '0');
      const price = parseFloat(msg.data.px || '0');
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return null;

      // Determine side based on direction
      const isLong = msg.data.side === 'A' || msg.data.dir?.includes('Long');

      return {
        id: `hl-${msg.data.time}-${Math.random().toString(36).substr(2, 9)}`,
        exchange: 'Hyperliquid',
        symbol: msg.data.coin || 'BTC',
        side: isLong ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(msg.data.time || Date.now()),
      };
    },
  },
  // Aevo - Subscribe to trades and filter liquidations
  {
    exchange: 'Aevo',
    url: 'wss://ws.aevo.xyz',
    subscribe: {
      op: 'subscribe',
      data: ['orderbook:BTC-PERP'],
    },
    parse: (data: unknown, threshold: number) => {
      const msg = data as {
        channel?: string;
        data?: {
          instrument_name?: string;
          trades?: Array<{
            side: string;
            price: string;
            amount: string;
            timestamp: number;
            is_liquidation?: boolean;
            trade_id: string;
          }>;
        };
      };

      // Check for trade updates with liquidation flag
      if (!msg.data?.trades) return null;

      for (const trade of msg.data.trades) {
        if (!trade.is_liquidation) continue;

        const quantity = parseFloat(trade.amount);
        const price = parseFloat(trade.price);
        const valueUsd = quantity * price;

        if (valueUsd < threshold) continue;

        return {
          id: `aevo-${trade.trade_id}-${Math.random().toString(36).substr(2, 9)}`,
          exchange: 'Aevo',
          symbol: msg.data.instrument_name || 'BTC-PERP',
          side: trade.side === 'sell' ? 'Long' : 'Short',
          quantity,
          price,
          valueUsd,
          timestamp: new Date(trade.timestamp),
        };
      }

      return null;
    },
  },
];

export function useMultiExchangeWebSocket(threshold: number = 10000) {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [connections, setConnections] = useState<ExchangeConnection[]>(
    EXCHANGES.map((e) => ({ exchange: e.exchange, isConnected: false, error: null }))
  );

  const wsRefs = useRef<Map<Exchange, WebSocket>>(new Map());
  const reconnectTimeouts = useRef<Map<Exchange, NodeJS.Timeout>>(new Map());
  const thresholdRef = useRef(threshold);

  // Keep threshold ref updated
  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const updateConnection = useCallback((exchange: Exchange, updates: Partial<ExchangeConnection>) => {
    setConnections((prev) =>
      prev.map((c) => (c.exchange === exchange ? { ...c, ...updates } : c))
    );
  }, []);

  const connectExchange = useCallback(
    (config: WebSocketConfig) => {
      const existing = wsRefs.current.get(config.exchange);
      if (existing?.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(config.url);

        ws.onopen = () => {
          console.log(`Connected to ${config.exchange}`);
          updateConnection(config.exchange, { isConnected: true, error: null });

          if (config.subscribe) {
            ws.send(JSON.stringify(config.subscribe));
          }

          // Special handling for Hyperliquid - need multiple subscriptions
          if (config.exchange === 'Hyperliquid') {
            // Subscribe to user fills (global) - this catches liquidations
            ws.send(JSON.stringify({
              method: 'subscribe',
              subscription: { type: 'trades', coin: 'BTC' },
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const liquidation = config.parse(data, thresholdRef.current);

            if (liquidation) {
              setLiquidations((prev) => {
                // Dedupe by checking recent IDs
                if (prev.some(l => l.id === liquidation.id)) return prev;
                const updated = [liquidation, ...prev];
                return updated.slice(0, MAX_LIQUIDATIONS);
              });
            }
          } catch {
            // Silent parse errors
          }
        };

        ws.onerror = () => {
          updateConnection(config.exchange, { error: 'Connection error' });
        };

        ws.onclose = () => {
          updateConnection(config.exchange, { isConnected: false });
          console.log(`Disconnected from ${config.exchange}, reconnecting...`);

          const timeout = setTimeout(() => {
            connectExchange(config);
          }, RECONNECT_DELAY);

          reconnectTimeouts.current.set(config.exchange, timeout);
        };

        wsRefs.current.set(config.exchange, ws);
      } catch (e) {
        console.error(`Failed to connect to ${config.exchange}:`, e);
        updateConnection(config.exchange, { error: 'Failed to connect', isConnected: false });
      }
    },
    [updateConnection]
  );

  const disconnectAll = useCallback(() => {
    reconnectTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    reconnectTimeouts.current.clear();

    wsRefs.current.forEach((ws) => ws.close());
    wsRefs.current.clear();
  }, []);

  const reconnectAll = useCallback(() => {
    disconnectAll();
    setTimeout(() => {
      EXCHANGES.forEach((config) => connectExchange(config));
    }, 100);
  }, [connectExchange, disconnectAll]);

  const clearLiquidations = useCallback(() => {
    setLiquidations([]);
  }, []);

  useEffect(() => {
    EXCHANGES.forEach((config) => connectExchange(config));
    return () => disconnectAll();
  }, [connectExchange, disconnectAll]);

  return {
    liquidations,
    connections,
    clearLiquidations,
    reconnectAll,
  };
}
