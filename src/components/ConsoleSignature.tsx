'use client';

import { useEffect } from 'react';

export default function ConsoleSignature() {
  useEffect(() => {
    const styles = {
      title: 'color: #f97316; font-size: 20px; font-weight: bold;',
      subtitle: 'color: #a1a1aa; font-size: 12px;',
      link: 'color: #22c55e; font-size: 12px;',
      warning: 'color: #facc15; font-size: 11px;',
    };

    console.log(
      `%c⚡ BTC Liquidations`,
      styles.title
    );
    console.log(
      `%cReal-time liquidation monitor across 5 exchanges`,
      styles.subtitle
    );
    console.log(
      `%c🔗 Built by bokiko → https://github.com/bokiko`,
      styles.link
    );
    console.log(
      `%c📦 Source: https://github.com/bokiko/btc-liquidations`,
      styles.link
    );
    console.log(
      `%c⚠️ This is not financial advice. Trade responsibly.`,
      styles.warning
    );
  }, []);

  return null;
}
