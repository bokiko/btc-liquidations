export type Exchange = 'Binance' | 'Bybit' | 'OKX' | 'Hyperliquid' | 'Aevo';

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

export interface ExchangeConnection {
  exchange: Exchange;
  isConnected: boolean;
  error: string | null;
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
  OKX: '#FFFFFF',
  Hyperliquid: '#00D395',
  Aevo: '#7B3FE4',
};

export const EXCHANGE_STYLES: Record<Exchange, string> = {
  Binance: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Bybit: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  OKX: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  Hyperliquid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Aevo: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};
