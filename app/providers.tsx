/* eslint-disable @next/next/no-page-custom-font */
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { ReactNode } from "react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#00ff7f",
          accentColorForeground: "#050505",
          borderRadius: "medium"
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

