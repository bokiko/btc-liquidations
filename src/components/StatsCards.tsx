'use client';

import { Liquidation, Exchange, EXCHANGE_STYLES } from '@/types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Flame } from 'lucide-react';

interface StatsCardsProps {
  liquidations: Liquidation[];
}

export default function StatsCards({ liquidations }: StatsCardsProps) {
  const stats = liquidations.reduce(
    (acc, liq) => {
      if (liq.side === 'Long') {
        acc.longCount++;
        acc.longValue += liq.valueUsd;
      } else {
        acc.shortCount++;
        acc.shortValue += liq.valueUsd;
      }
      return acc;
    },
    { longCount: 0, shortCount: 0, longValue: 0, shortValue: 0 }
  );

  // Stats by exchange
  const byExchange = liquidations.reduce((acc, liq) => {
    if (!acc[liq.exchange]) {
      acc[liq.exchange] = { count: 0, value: 0 };
    }
    acc[liq.exchange].count++;
    acc[liq.exchange].value += liq.valueUsd;
    return acc;
  }, {} as Record<Exchange, { count: number; value: number }>);

  const totalValue = stats.longValue + stats.shortValue;
  const totalCount = stats.longCount + stats.shortCount;
  const largestLiq = liquidations.length > 0
    ? liquidations.reduce((max, l) => (l.valueUsd > max.valueUsd ? l : max))
    : null;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidations */}
        <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 text-zinc-500 mb-3">
              <div className="p-2 bg-zinc-800/80 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalCount}</p>
            <p className="text-sm text-zinc-500 mt-1">{formatValue(totalValue)}</p>
          </div>
        </div>

        {/* Longs Liquidated */}
        <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">Longs Rekt</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.longCount}</p>
            <p className="text-sm text-zinc-500 mt-1">{formatValue(stats.longValue)}</p>
          </div>
        </div>

        {/* Shorts Liquidated */}
        <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 text-green-500 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">Shorts Rekt</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.shortCount}</p>
            <p className="text-sm text-zinc-500 mt-1">{formatValue(stats.shortValue)}</p>
          </div>
        </div>

        {/* Largest Liquidation */}
        <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">Largest</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {largestLiq ? formatValue(largestLiq.valueUsd) : '$0'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {largestLiq ? largestLiq.exchange : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Exchange Breakdown */}
      {Object.keys(byExchange).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byExchange)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([exchange, data]) => (
            <div
              key={exchange}
              className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/30 border border-zinc-800/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
            >
              <span className={`px-2 py-1 text-[10px] font-semibold rounded-md border ${EXCHANGE_STYLES[exchange as Exchange]}`}>
                {exchange}
              </span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-300 font-medium">{data.count}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">{formatValue(data.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
