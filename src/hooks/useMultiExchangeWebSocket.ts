'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Liquidation, Exchange, ExchangeConnection } from '@/types';

const MAX_LIQUIDATIONS = 200;
const RECONNECT_BASE_DELAY = 3000;
const RECONNECT_MAX_DELAY = 60000;
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB guard against oversized payloads
// Close codes that indicate we should not reconnect
const NO_RECONNECT_CODES = new Set([1008, 1011, 4000, 4001, 4003]);
const PING_INTERVAL = 30000; // 30s keepalive for exchanges that need it

interface WebSocketConfig {
  exchange: Exchange;
  url: string;
  subscribe?: object;
  ping?: object; // Keepalive message to send periodically
  parse: (data: unknown, threshold: number) => Liquidation[];
}

const EXCHANGES: WebSocketConfig[] = [
  // Binance Futures
  {
    exchange: 'Binance',
    url: 'wss://fstream.binance.com/ws/btcusdt@forceOrder',
    parse: (data: unknown, threshold: number) => {
      const msg = data as { o?: { s: string; S: string; q: string; p: string; T: number } };
      const order = msg.o;
      if (!order) return [];

      const quantity = parseFloat(order.q);
      const price = parseFloat(order.p);
      if (!isFinite(quantity) || !isFinite(price)) return [];
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return [];

      return [{
        id: `binance-${order.T}-${order.S}`,
        exchange: 'Binance',
        symbol: order.s,
        side: order.S === 'SELL' ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(order.T),
      }];
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

      if (!msg.topic?.includes('liquidation') || !msg.data) return [];

      const liq = msg.data;
      if (!liq.symbol?.startsWith('BTC')) return [];

      const quantity = parseFloat(liq.size);
      const price = parseFloat(liq.price);
      if (!isFinite(quantity) || !isFinite(price)) return [];
      const valueUsd = quantity * price;

      if (valueUsd < threshold) return [];

      return [{
        id: `bybit-${liq.updatedTime}-${liq.side}`,
        exchange: 'Bybit',
        symbol: liq.symbol,
        side: liq.side === 'Sell' ? 'Long' : 'Short',
        quantity,
        price,
        valueUsd,
        timestamp: new Date(liq.updatedTime),
      }];
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

      if (msg.arg?.channel !== 'liquidation-orders' || !msg.data?.length) return [];

      const results: Liquidation[] = [];
      for (const liq of msg.data) {
        if (!liq.instId?.includes('BTC')) continue;

        const quantity = parseFloat(liq.sz);
        const price = parseFloat(liq.bkPx);
        if (!isFinite(quantity) || !isFinite(price)) continue;
        const valueUsd = quantity * price;

        if (valueUsd < threshold) continue;

        const ts = parseInt(liq.ts);
        if (!isFinite(ts)) continue;

        results.push({
          id: `okx-${liq.ts}-${liq.side}`,
          exchange: 'OKX',
          symbol: liq.instId,
          side: liq.side === 'sell' ? 'Long' : 'Short',
          quantity,
          price,
          valueUsd,
          timestamp: new Date(ts),
        });
      }
      return results;
    },
  },
  // Hyperliquid - Subscribe to trades and filter for liquidations
  {
    exchange: 'Hyperliquid',
    url: 'wss://api.hyperliquid.xyz/ws',
    subscribe: {
      method: 'subscribe',
      subscription: { type: 'trades', coin: 'BTC' },
    },
    ping: { method: 'ping' },
    parse: (data: unknown, threshold: number) => {
      const msg = data as {
        channel?: string;
        data?: Array<{
          coin?: string;
          side?: string;
          px?: string;
          sz?: string;
          time?: number;
          tid?: number;
          liquidation?: boolean;
          startPosition?: boolean;
          dir?: string;
          closedPnl?: string;
        }>;
      };

      // Hyperliquid trades channel sends data as an array
      if (!Array.isArray(msg.data)) return [];

      const results: Liquidation[] = [];
      for (const trade of msg.data) {
        if (!trade.liquidation) continue;
        if (!trade.coin?.toUpperCase().includes('BTC')) continue;

        const quantity = parseFloat(trade.sz || '0');
        const price = parseFloat(trade.px || '0');
        if (!isFinite(quantity) || !isFinite(price)) continue;
        const valueUsd = quantity * price;

        if (valueUsd < threshold) continue;

        const isLong = trade.side === 'A' || trade.dir?.includes('Long');

        results.push({
          id: `hl-${trade.tid ?? trade.time}-${trade.side}-${Math.random().toString(36).slice(2, 6)}`,
          exchange: 'Hyperliquid',
          symbol: trade.coin || 'BTC',
          side: isLong ? 'Long' : 'Short',
          quantity,
          price,
          valueUsd,
          timestamp: new Date(trade.time || Date.now()),
        });
      }
      return results;
    },
  },
  // Aevo - Subscribe to trades and filter liquidations
  {
    exchange: 'Aevo',
    url: 'wss://ws.aevo.xyz',
    subscribe: {
      op: 'subscribe',
      data: ['trades:BTC-PERP'],
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
      if (!msg.data?.trades) return [];

      const results: Liquidation[] = [];
      for (const trade of msg.data.trades) {
        if (!trade.is_liquidation) continue;

        const quantity = parseFloat(trade.amount);
        const price = parseFloat(trade.price);
        if (!isFinite(quantity) || !isFinite(price)) continue;
        const valueUsd = quantity * price;

        if (valueUsd < threshold) continue;

        results.push({
          id: `aevo-${trade.trade_id}`,
          exchange: 'Aevo',
          symbol: msg.data.instrument_name || 'BTC-PERP',
          side: trade.side === 'sell' ? 'Long' : 'Short',
          quantity,
          price,
          valueUsd,
          timestamp: new Date(trade.timestamp),
        });
      }
      return results;
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
  const reconnectAttempts = useRef<Map<Exchange, number>>(new Map());
  const pingIntervals = useRef<Map<Exchange, NodeJS.Timeout>>(new Map());
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
      if (existing?.readyState === WebSocket.OPEN || existing?.readyState === WebSocket.CONNECTING) return;

      try {
        const ws = new WebSocket(config.url);

        ws.onopen = () => {
          console.log(`Connected to ${config.exchange}`);
          reconnectAttempts.current.set(config.exchange, 0);
          updateConnection(config.exchange, { isConnected: true, error: null });

          if (config.subscribe) {
            ws.send(JSON.stringify(config.subscribe));
          }

          // Start keepalive ping if configured
          if (config.ping) {
            const existingPing = pingIntervals.current.get(config.exchange);
            if (existingPing) clearInterval(existingPing);

            const interval = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(config.ping));
              }
            }, PING_INTERVAL);
            pingIntervals.current.set(config.exchange, interval);
          }
        };

        ws.onmessage = (event) => {
          try {
            if (typeof event.data === 'string' && event.data.length > MAX_MESSAGE_SIZE) return;
            const data = JSON.parse(event.data);
            const incoming = config.parse(data, thresholdRef.current);

            if (incoming.length > 0) {
              setLiquidations((prev) => {
                const existingIds = new Set(prev.map(l => l.id));
                const deduped = incoming.filter(l => !existingIds.has(l.id));
                if (deduped.length === 0) return prev;
                return [...deduped, ...prev].slice(0, MAX_LIQUIDATIONS);
              });
            }
          } catch (e) {
            console.debug(`[${config.exchange}] parse error:`, e);
          }
        };

        ws.onerror = () => {
          updateConnection(config.exchange, { error: 'Connection error' });
        };

        ws.onclose = (event) => {
          updateConnection(config.exchange, { isConnected: false });

          // Clear ping interval on close
          const pingInterval = pingIntervals.current.get(config.exchange);
          if (pingInterval) {
            clearInterval(pingInterval);
            pingIntervals.current.delete(config.exchange);
          }

          if (NO_RECONNECT_CODES.has(event.code)) {
            console.log(`${config.exchange} closed with code ${event.code}, not reconnecting`);
            updateConnection(config.exchange, { error: `Rejected (code ${event.code})` });
            return;
          }

          const attempts = reconnectAttempts.current.get(config.exchange) || 0;
          const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, attempts), RECONNECT_MAX_DELAY);
          reconnectAttempts.current.set(config.exchange, attempts + 1);

          console.log(`Disconnected from ${config.exchange}, reconnecting in ${delay}ms...`);

          const existingTimeout = reconnectTimeouts.current.get(config.exchange);
          if (existingTimeout) clearTimeout(existingTimeout);

          const timeout = setTimeout(() => {
            connectExchange(config);
          }, delay);

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
    reconnectAttempts.current.clear();

    pingIntervals.current.forEach((interval) => clearInterval(interval));
    pingIntervals.current.clear();

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
