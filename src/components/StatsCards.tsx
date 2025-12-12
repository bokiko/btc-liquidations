'use client';

import { Liquidation, Exchange } from '@/types';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

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

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidations */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-semibold text-white">{totalCount}</p>
          <p className="text-sm text-zinc-500">{formatValue(totalValue)}</p>
        </div>

        {/* Longs Liquidated */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Longs Rekt</span>
          </div>
          <p className="text-2xl font-semibold text-red-400">{stats.longCount}</p>
          <p className="text-sm text-zinc-500">{formatValue(stats.longValue)}</p>
        </div>

        {/* Shorts Liquidated */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Shorts Rekt</span>
          </div>
          <p className="text-2xl font-semibold text-green-400">{stats.shortCount}</p>
          <p className="text-sm text-zinc-500">{formatValue(stats.shortValue)}</p>
        </div>

        {/* Largest Liquidation */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Largest</span>
          </div>
          <p className="text-2xl font-semibold text-amber-400">
            {liquidations.length > 0
              ? formatValue(Math.max(...liquidations.map((l) => l.valueUsd)))
              : '$0'}
          </p>
          <p className="text-sm text-zinc-500">
            {liquidations.length > 0
              ? liquidations.reduce((max, l) => (l.valueUsd > max.valueUsd ? l : max)).exchange
              : '-'}
          </p>
        </div>
      </div>

      {/* Exchange Breakdown */}
      {Object.keys(byExchange).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byExchange).map(([exchange, data]) => (
            <div
              key={exchange}
              className="flex items-center gap-3 px-3 py-2 bg-zinc-900/30 border border-zinc-800/50 rounded-lg"
            >
              <ExchangeBadge exchange={exchange as Exchange} />
              <div className="text-sm">
                <span className="text-zinc-400">{data.count}</span>
                <span className="text-zinc-600 mx-1">·</span>
                <span className="text-zinc-500">{formatValue(data.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExchangeBadge({ exchange }: { exchange: Exchange }) {
  const colors: Record<Exchange, string> = {
    Binance: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Bybit: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    OKX: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[exchange]}`}>
      {exchange}
    </span>
  );
}
