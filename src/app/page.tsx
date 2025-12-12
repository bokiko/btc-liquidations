'use client';

import { useState } from 'react';
import { useMultiExchangeWebSocket } from '@/hooks/useMultiExchangeWebSocket';
import StatsCards from '@/components/StatsCards';
import LiquidationFeed from '@/components/LiquidationFeed';
import LiquidationChart from '@/components/LiquidationChart';
import ConnectionStatus from '@/components/ConnectionStatus';
import { Trash2, Bitcoin, Settings, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [threshold, setThreshold] = useState(10000);
  const [showSettings, setShowSettings] = useState(false);

  const { liquidations, connections, clearLiquidations, reconnectAll } =
    useMultiExchangeWebSocket(threshold);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">BTC Liquidations</h1>
                <p className="text-xs text-zinc-500">Binance · Bybit · OKX</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConnectionStatus connections={connections} />

              <button
                onClick={reconnectAll}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Reconnect all"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={clearLiquidations}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Clear feed"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Min threshold:</label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={1000}>$1,000</option>
                    <option value={5000}>$5,000</option>
                    <option value={10000}>$10,000</option>
                    <option value={25000}>$25,000</option>
                    <option value={50000}>$50,000</option>
                    <option value={100000}>$100,000</option>
                  </select>
                </div>

                {/* Exchange Status */}
                <div className="flex items-center gap-3 ml-auto">
                  {connections.map((conn) => (
                    <div
                      key={conn.exchange}
                      className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                        conn.isConnected
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          conn.isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      {conn.exchange}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {/* Stats */}
          <StatsCards liquidations={liquidations} />

          {/* Chart and Feed */}
          <div className="grid lg:grid-cols-2 gap-6">
            <LiquidationChart liquidations={liquidations} />
            <LiquidationFeed liquidations={liquidations} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-xs text-zinc-600">
            Real-time data from Binance, Bybit & OKX Futures. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
