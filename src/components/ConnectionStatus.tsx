'use client';

import { Exchange } from '@/types';
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
    <div className="flex items-center gap-2">
      {/* Overall Status */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          allConnected
            ? 'bg-green-500/10 border-green-500/20'
            : connectedCount > 0
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            allConnected
              ? 'bg-green-500 animate-pulse'
              : connectedCount > 0
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span
          className={`text-xs font-medium ${
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
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-zinc-500" />
        )}
      </div>

      {/* Individual Exchange Status (hover tooltip could be added) */}
      <div className="hidden sm:flex items-center gap-1">
        {connections.map((conn) => (
          <div
            key={conn.exchange}
            className={`w-2 h-2 rounded-full ${
              conn.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={`${conn.exchange}: ${conn.isConnected ? 'Connected' : conn.error || 'Disconnected'}`}
          />
        ))}
      </div>
    </div>
  );
}
