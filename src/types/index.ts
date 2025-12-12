export interface Liquidation {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  quantity: number;
  price: number;
  valueUsd: number;
  timestamp: Date;
}

export interface LiquidationStats {
  totalLongs: number;
  totalShorts: number;
  longValue: number;
  shortValue: number;
  lastHourLongs: number;
  lastHourShorts: number;
}

export interface ChartDataPoint {
  time: string;
  longs: number;
  shorts: number;
}
