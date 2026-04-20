"use client";

import React, { Component, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/quiz", label: "Quiz" },
] as const;

function ConnectedWalletButton() {
  const { authenticated, login, ready } = usePrivy();

  if (!ready) {
    return null;
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          Lv1
        </span>
        <span className="rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-foreground">
          Connected
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-foreground transition-colors hover:bg-muted"
    >
      Connect Wallet
    </button>
  );
}

class WalletBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <span className="rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          Wallet unavailable
        </span>
      );
    }
    return this.props.children;
  }
}

function WalletButton() {
  return (
    <WalletBoundary>
      <ConnectedWalletButton />
    </WalletBoundary>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          <img
            src="/logo.png"
            alt="Arc Terminal logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-mono">Arc Terminal</span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletButton />
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background/95 backdrop-blur-md transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0 border-t-0",
        )}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 px-3 pb-1">
            <WalletButton />
          </li>
        </ul>
      </div>
    </header>
  );
}
