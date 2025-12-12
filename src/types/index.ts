export type Exchange = 'Binance' | 'Bybit' | 'OKX';

export interface Liquidation {
  id: string;
  exchange: Exchange;
  symbol: string;
  side: 'Long' | 'Short';
  quantity: number;
  price: number;
  valueUsd: number;
  timestamp: Date;
}

export interface ExchangeStats {
  exchange: Exchange;
  longCount: number;
  shortCount: number;
  longValue: number;
  shortValue: number;
  isConnected: boolean;
}

export interface ChartDataPoint {
  time: string;
  longs: number;
  shorts: number;
}

export const EXCHANGE_COLORS: Record<Exchange, string> = {
  Binance: '#F0B90B',
  Bybit: '#F7A600',
  OKX: '#000000',
};
