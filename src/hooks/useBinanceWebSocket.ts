'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Liquidation } from '@/types';

const BINANCE_WS_URL = 'wss://fstream.binance.com/ws/btcusdt@forceOrder';
const DEFAULT_THRESHOLD = 10000;
const MAX_LIQUIDATIONS = 100;
const RECONNECT_DELAY = 3000;

export function useBinanceWebSocket(threshold: number = DEFAULT_THRESHOLD) {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(BINANCE_WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('Connected to Binance liquidation stream');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const order = data.o;

          if (order) {
            const quantity = parseFloat(order.q);
            const price = parseFloat(order.p);
            const valueUsd = quantity * price;

            if (valueUsd >= threshold) {
              const liquidation: Liquidation = {
                id: `${order.T}-${Math.random().toString(36).substr(2, 9)}`,
                symbol: order.s,
                side: order.S === 'SELL' ? 'Long' : 'Short',
                quantity,
                price,
                valueUsd,
                timestamp: new Date(order.T),
              };

              setLiquidations((prev) => {
                const updated = [liquidation, ...prev];
                return updated.slice(0, MAX_LIQUIDATIONS);
              });
            }
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      ws.onerror = () => {
        setError('WebSocket error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from Binance');

        // Auto-reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...');
          connect();
        }, RECONNECT_DELAY);
      };

      wsRef.current = ws;
    } catch (e) {
      setError('Failed to connect');
      console.error('Connection error:', e);
    }
  }, [threshold]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const clearLiquidations = useCallback(() => {
    setLiquidations([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    liquidations,
    isConnected,
    error,
    clearLiquidations,
    reconnect: connect,
  };
}
