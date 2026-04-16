"use client";

import React, { Component, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";

/**
 * WalletSideEffect — calls useWallets() and surfaces the primary wallet
 * address to a parent via callback. Renders nothing.
 *
 * Must be mounted inside a WalletBoundary so Privy errors on public pages
 * (missing NEXT_PUBLIC_PRIVY_APP_ID) degrade gracefully instead of crashing.
 */
function WalletSideEffect({
  onWalletAddress,
}: {
  onWalletAddress: (addr: string | null) => void;
}) {
  const { wallets } = useWallets();
  const addr = wallets[0]?.address?.toLowerCase() ?? null;

  useEffect(() => {
    onWalletAddress(addr);
  }, [addr, onWalletAddress]);

  return null;
}

/**
 * WalletBoundary — error boundary that wraps WalletSideEffect.
 * If Privy is not configured or throws, the boundary silently renders null
 * so the host page continues to work without wallet context.
 */
export class WalletBoundary extends Component<
  { onWalletAddress: (addr: string | null) => void },
  { hasError: boolean }
> {
  constructor(props: { onWalletAddress: (addr: string | null) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      // Privy unavailable — host page runs without wallet context
      return null;
    }
    return <WalletSideEffect onWalletAddress={this.props.onWalletAddress} />;
  }
}
