import { Navbar } from "./Navbar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  );
}
