'use client';

import { Exchange, EXCHANGE_COLORS } from '@/types';
import { Wifi, WifiOff } from 'lucide-react';

interface ExchangeConnection {
  exchange: Exchange;
  isConnected: boolean;
  error: string | null;
}

interface ConnectionStatusProps {
  connections: ExchangeConnection[];
}

export default function ConnectionStatus({ connections }: ConnectionStatusProps) {
  const connectedCount = connections.filter((c) => c.isConnected).length;
  const totalCount = connections.length;
  const allConnected = connectedCount === totalCount;

  return (
    <div className="flex items-center gap-3">
      {/* Overall Status */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${
          allConnected
            ? 'bg-green-500/10 border-green-500/20'
            : connectedCount > 0
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}
      >
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full ${
              allConnected
                ? 'bg-green-500'
                : connectedCount > 0
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          {(allConnected || connectedCount > 0) && (
            <div
              className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${
                allConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
          )}
        </div>
        <span
          className={`text-xs font-semibold ${
            allConnected
              ? 'text-green-400'
              : connectedCount > 0
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {connectedCount}/{totalCount}
        </span>
        {allConnected ? (
          <Wifi className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </div>

      {/* Individual Exchange Indicators */}
      <div className="hidden sm:flex items-center gap-1">
        {connections.map((conn) => (
          <div
            key={conn.exchange}
            className={`w-2 h-2 rounded-full transition-colors ${
              conn.isConnected ? 'bg-green-500' : 'bg-red-500/50'
            }`}
            style={{
              backgroundColor: conn.isConnected ? EXCHANGE_COLORS[conn.exchange] : undefined,
              opacity: conn.isConnected ? 1 : 0.3,
            }}
            title={`${conn.exchange}: ${conn.isConnected ? 'Connected' : conn.error || 'Disconnected'}`}
          />
        ))}
      </div>
    </div>
  );
}
