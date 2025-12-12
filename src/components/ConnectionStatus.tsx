'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
}

export default function ConnectionStatus({
  isConnected,
  error,
  onReconnect,
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
          <Wifi className="w-3 h-3 text-green-500" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-red-400 font-medium">
              {error || 'Disconnected'}
            </span>
            <WifiOff className="w-3 h-3 text-red-500" />
          </div>
          <button
            onClick={onReconnect}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Reconnect"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
