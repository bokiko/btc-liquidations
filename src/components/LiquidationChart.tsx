'use client';

import { useMemo } from 'react';
import { Liquidation } from '@/types';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LiquidationChartProps {
  liquidations: Liquidation[];
}

export default function LiquidationChart({ liquidations }: LiquidationChartProps) {
  const chartData = useMemo(() => {
    // Group by minute
    const grouped = liquidations.reduce((acc, liq) => {
      const minute = format(liq.timestamp, 'HH:mm');
      if (!acc[minute]) {
        acc[minute] = { time: minute, longs: 0, shorts: 0 };
      }
      if (liq.side === 'Long') {
        acc[minute].longs += liq.valueUsd;
      } else {
        acc[minute].shorts += liq.valueUsd;
      }
      return acc;
    }, {} as Record<string, { time: string; longs: number; shorts: number }>);

    return Object.values(grouped).slice(-20).reverse();
  }, [liquidations]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 h-[380px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">No data yet</p>
          <p className="text-zinc-600 text-sm">
            Chart appears when liquidations arrive
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800/80 rounded-lg">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Volume by Minute
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-zinc-500">Longs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500">Shorts</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="longsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shortsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: '#52525b', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#52525b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatValue}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                fontSize: '12px',
                padding: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
              formatter={(value: number, name: string) => [
                formatValue(value),
                name === 'longs' ? 'Longs Rekt' : 'Shorts Rekt',
              ]}
              itemStyle={{ padding: '2px 0' }}
            />
            <Area
              type="monotone"
              dataKey="longs"
              stackId="1"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#longsGradient)"
            />
            <Area
              type="monotone"
              dataKey="shorts"
              stackId="1"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#shortsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
