'use client';

import { Liquidation, Exchange, EXCHANGE_STYLES } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface LiquidationFeedProps {
  liquidations: Liquidation[];
}

function ExchangeBadge({ exchange }: { exchange: Exchange }) {
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${EXCHANGE_STYLES[exchange]}`}>
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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-zinc-400 mb-1">Waiting for liquidations...</p>
          <p className="text-zinc-600 text-sm">
            Monitoring 5 exchanges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Live Feed
        </h2>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {liquidations.map((liq, index) => (
          <div
            key={liq.id}
            className={`flex items-center gap-3 p-3 border-b border-zinc-800/50 last:border-0
              ${index === 0 ? 'bg-zinc-800/30 animate-pulse-once' : ''}`}
          >
            {/* Side Indicator */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                ${liq.side === 'Long' ? 'bg-red-500/10' : 'bg-green-500/10'}`}
            >
              {liq.side === 'Long' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <ExchangeBadge exchange={liq.exchange} />
                <span
                  className={`text-xs font-medium ${
                    liq.side === 'Long' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {liq.side}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {format(liq.timestamp, 'HH:mm:ss')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">
                {liq.quantity.toFixed(4)} BTC @ ${liq.price.toLocaleString()}
              </p>
            </div>

            {/* Value */}
            <div className="text-right flex-shrink-0">
              <p
                className={`text-base font-semibold ${
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
