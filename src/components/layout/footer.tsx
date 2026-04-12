import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
        <span className="font-mono font-medium text-foreground">Arc Terminal</span>
        <Link
          href="https://arc.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Built on Arc
        </Link>
        <span>&copy; 2025</span>
      </div>
    </footer>
  );
}
