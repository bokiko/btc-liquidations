'use client';

import { useMemo } from 'react';
import { Liquidation } from '@/types';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 h-[300px] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Chart will appear when data arrives</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Volume by Minute
        </h2>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatValue}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(value: number, name: string) => [
                formatValue(value),
                name === 'longs' ? 'Longs Rekt' : 'Shorts Rekt',
              ]}
            />
            <Bar dataKey="longs" stackId="a" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`longs-${index}`} fill="#ef4444" />
              ))}
            </Bar>
            <Bar dataKey="shorts" stackId="a" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`shorts-${index}`} fill="#22c55e" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-zinc-500">Longs Liquidated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-zinc-500">Shorts Liquidated</span>
        </div>
      </div>
    </div>
  );
}
