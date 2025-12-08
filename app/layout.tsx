import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fight Club | DeFi Battle Royale",
  description: "Configure AI agents and battle in a simulated market on Base."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="cyber-grid">
        <Providers>
          <main className="min-h-screen px-6 py-10 text-cyber-neon">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

