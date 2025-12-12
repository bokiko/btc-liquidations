<p align="center">
  <img src="https://img.icons8.com/fluency/96/lightning-bolt.png" alt="BTC Liquidations" width="80" height="80">
</p>

<h1 align="center">BTC Liquidations</h1>

<p align="center">
  <strong>Real-time Bitcoin liquidation monitor across major exchanges</strong>
</p>

<p align="center">
  <a href="https://btc-liquidations.vercel.app">
    <img src="https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/typescript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind">
</p>

<p align="center">
  <a href="https://btc-liquidations.vercel.app">View Demo</a>
  ·
  <a href="https://github.com/bokiko/btc-liquidations/issues">Report Bug</a>
  ·
  <a href="https://github.com/bokiko/btc-liquidations/issues">Request Feature</a>
</p>

---

## Overview

BTC Liquidations is a real-time dashboard that monitors Bitcoin futures liquidations across multiple centralized and decentralized exchanges. Watch as leveraged positions get liquidated in real-time with detailed statistics and visualizations.

## Features

- **Multi-Exchange Support** - Connects to 5 exchanges simultaneously
  - CEX: Binance, Bybit, OKX
  - DEX: Hyperliquid, Aevo
- **Real-Time WebSocket Feeds** - Direct browser connections, no backend required
- **Live Statistics** - Total liquidations, longs vs shorts, largest positions
- **Interactive Charts** - Visualize liquidation volume over time
- **Exchange Breakdown** - See which exchanges have the most activity
- **Customizable Threshold** - Filter by minimum liquidation value ($1K - $100K)
- **Auto-Reconnect** - Automatic reconnection on connection drops
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/bokiko/btc-liquidations.git
   cd btc-liquidations
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles
├── components/
│   ├── ConnectionStatus.tsx   # Exchange connection indicators
│   ├── LiquidationChart.tsx   # Volume chart component
│   ├── LiquidationFeed.tsx    # Live feed list
│   └── StatsCards.tsx         # Statistics cards
├── hooks/
│   └── useMultiExchangeWebSocket.ts  # WebSocket connection hook
└── types/
    └── index.ts        # TypeScript type definitions
```

## WebSocket Endpoints

| Exchange | Endpoint | Data |
|----------|----------|------|
| Binance | `wss://fstream.binance.com/ws/btcusdt@forceOrder` | Force orders |
| Bybit | `wss://stream.bybit.com/v5/public/linear` | Liquidations |
| OKX | `wss://ws.okx.com:8443/ws/v5/public` | Liquidation orders |
| Hyperliquid | `wss://api.hyperliquid.xyz/ws` | Trades with liquidation flag |
| Aevo | `wss://ws.aevo.xyz` | Trades with liquidation flag |

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bokiko/btc-liquidations)

Or deploy manually:

```bash
npm install -g vercel
vercel --prod
```

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This tool is for informational purposes only. Not financial advice. Trade at your own risk.

---

<p align="center">
  Built with mass liquidations
</p>
