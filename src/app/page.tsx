'use client';

import { useState } from 'react';
import { useMultiExchangeWebSocket } from '@/hooks/useMultiExchangeWebSocket';
import StatsCards from '@/components/StatsCards';
import LiquidationFeed from '@/components/LiquidationFeed';
import LiquidationChart from '@/components/LiquidationChart';
import ConnectionStatus from '@/components/ConnectionStatus';
import { Trash2, Settings, RefreshCw, Zap } from 'lucide-react';

export default function Dashboard() {
  const [threshold, setThreshold] = useState(10000);
  const [showSettings, setShowSettings] = useState(false);

  const { liquidations, connections, clearLiquidations, reconnectAll } =
    useMultiExchangeWebSocket(threshold);

  const connectedCount = connections.filter((c) => c.isConnected).length;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-xl" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  BTC Liquidations
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectedCount > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${connectedCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <p className="text-xs text-zinc-500">
                    {connectedCount} exchanges live
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <ConnectionStatus connections={connections} />

              <div className="h-6 w-px bg-zinc-800 mx-2" />

              <button
                onClick={reconnectAll}
                className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all duration-200 hover:scale-105"
                title="Reconnect all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${
                  showSettings
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={clearLiquidations}
                className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-105"
                title="Clear feed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-zinc-400">Min value:</label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="bg-zinc-800/80 border border-zinc-700/50 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                  >
                    <option value={1000}>$1,000</option>
                    <option value={5000}>$5,000</option>
                    <option value={10000}>$10,000</option>
                    <option value={25000}>$25,000</option>
                    <option value={50000}>$50,000</option>
                    <option value={100000}>$100,000</option>
                  </select>
                </div>

                {/* Exchange Status Pills */}
                <div className="flex items-center gap-2 ml-auto">
                  {connections.map((conn) => (
                    <div
                      key={conn.exchange}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        conn.isConnected
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
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
      <footer className="relative border-t border-zinc-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-zinc-400">BTC Liquidations</span>
            </div>
            <p className="text-xs text-zinc-600">
              Real-time data from Binance, Bybit, OKX, Hyperliquid & Aevo. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
