<div align="center">

# BTC Liquidations

<h3>Watch leveraged positions get liquidated in real-time.</h3>

<p>
  <a href="https://btc-liquidations.vercel.app">
    <img src="https://img.shields.io/badge/Live-btc--liquidations.vercel.app-orange?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

<p>
  <a href="https://btc-liquidations.vercel.app">
    <img src="https://img.shields.io/badge/demo-live-success" alt="Live Demo" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8" alt="Tailwind CSS" />
  </a>
</p>

</div>

---

## What is BTC Liquidations?

**BTC Liquidations** is a real-time dashboard that monitors Bitcoin futures liquidations across 5 major exchanges - both centralized and decentralized. Watch as leveraged positions get wiped out with detailed statistics and visualizations.

**No account needed. No ads. Just data.**

---

## Who is this for?

| If you're a... | BTC Liquidations helps you... |
|----------------|-------------------------------|
| **Trader** | Spot large liquidation events that may signal price reversals |
| **Whale Watcher** | Track big positions getting liquidated in real-time |
| **Risk Manager** | Monitor market stress and leverage buildup |
| **Researcher** | Analyze liquidation patterns across exchanges |
| **Developer** | Connect to the same WebSocket feeds for your own tools |

---

## Features

### Multi-Exchange Support
- **CEX**: Binance, Bybit, OKX
- **DEX**: Hyperliquid, Aevo

### Real-Time Data
- **WebSocket Feeds** - Direct browser connections, no backend required
- **Live Statistics** - Total liquidations, longs vs shorts, largest positions
- **Interactive Charts** - Visualize liquidation volume over time
- **Exchange Breakdown** - See which exchanges have the most activity

### Customization
- **Adjustable Threshold** - Filter by minimum liquidation value ($1K - $100K)
- **Auto-Reconnect** - Automatic reconnection on connection drops
- **Responsive Design** - Works on desktop and mobile

---

## Supported Exchanges

| Exchange | Type | WebSocket Endpoint | Data |
|----------|------|-------------------|------|
| **Binance** | CEX | `wss://fstream.binance.com/ws/btcusdt@forceOrder` | Force orders |
| **Bybit** | CEX | `wss://stream.bybit.com/v5/public/linear` | Liquidations |
| **OKX** | CEX | `wss://ws.okx.com:8443/ws/v5/public` | Liquidation orders |
| **Hyperliquid** | DEX | `wss://api.hyperliquid.xyz/ws` | Trades with liquidation flag |
| **Aevo** | DEX | `wss://ws.aevo.xyz` | Trades with liquidation flag |

---

## Quick Links

- **Live Dashboard**: [btc-liquidations.vercel.app](https://btc-liquidations.vercel.app)
- **Report Issues**: [GitHub Issues](https://github.com/bokiko/btc-liquidations/issues)

---

# Technical Documentation

<details>
<summary><strong>Click to expand developer documentation</strong></summary>

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bokiko/btc-liquidations.git
cd btc-liquidations

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Dates** | date-fns |
| **Deployment** | Vercel |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles
├── components/
│   ├── ConnectionStatus.tsx # Exchange connection indicators
│   ├── LiquidationChart.tsx # Volume chart component
│   ├── LiquidationFeed.tsx  # Live feed list
│   └── StatsCards.tsx       # Statistics cards
├── hooks/
│   └── useMultiExchangeWebSocket.ts  # WebSocket connection hook
└── types/
    └── index.ts             # TypeScript type definitions
```

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bokiko/btc-liquidations)

Or deploy manually:

```bash
npm install -g vercel
vercel --prod
```

</details>

---

## Contributing

Contributions welcome! Feel free to:
- Add support for more exchanges
- Improve UI/UX
- Build new features
- Fix bugs

---

## Team

Built by [@bokiko](https://github.com/bokiko)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Disclaimer

This tool is for informational purposes only. Not financial advice. Trade at your own risk.

---

<div align="center">
  <strong>Built for traders, by traders.</strong>
  <br><br>
  <a href="https://btc-liquidations.vercel.app">btc-liquidations.vercel.app</a>
</div>
