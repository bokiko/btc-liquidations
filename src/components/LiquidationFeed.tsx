'use client';

import { Liquidation, Exchange, EXCHANGE_STYLES } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

interface LiquidationFeedProps {
  liquidations: Liquidation[];
}

function ExchangeBadge({ exchange }: { exchange: Exchange }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${EXCHANGE_STYLES[exchange]}`}>
      {exchange}
    </span>
  );
}

export default function LiquidationFeed({ liquidations }: LiquidationFeedProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (liquidations.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 h-[380px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <div className="relative">
              <Radio className="w-6 h-6 text-green-500" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
          <p className="text-zinc-400 font-medium mb-1">Listening for liquidations</p>
          <p className="text-zinc-600 text-sm">
            Connected to 5 exchanges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800/80 rounded-lg">
              <Radio className="w-4 h-4 text-zinc-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Live Feed
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-zinc-500">{liquidations.length} events</span>
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {liquidations.map((liq, index) => (
          <div
            key={liq.id}
            className={`flex items-center gap-4 p-4 border-b border-zinc-800/30 last:border-0 transition-colors hover:bg-zinc-800/20
              ${index === 0 ? 'bg-zinc-800/30' : ''}`}
          >
            {/* Side Indicator */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105
                ${liq.side === 'Long' ? 'bg-red-500/10' : 'bg-green-500/10'}`}
            >
              {liq.side === 'Long' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ExchangeBadge exchange={liq.exchange} />
                <span
                  className={`text-xs font-semibold ${
                    liq.side === 'Long' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {liq.side}
                </span>
                <span className="text-[10px] text-zinc-600 font-medium">
                  {format(liq.timestamp, 'HH:mm:ss')}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {liq.quantity.toFixed(4)} BTC @ ${liq.price.toLocaleString()}
              </p>
            </div>

            {/* Value */}
            <div className="text-right flex-shrink-0">
              <p
                className={`text-lg font-bold ${
                  liq.side === 'Long' ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {formatValue(liq.valueUsd)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
