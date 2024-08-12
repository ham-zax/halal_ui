import * as React from "react";
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { skipRetryStatus } from '@/api/axios';
import MockWalletProvider from './WalletProvider';
import ThemeProvider from './ThemeProvider';
import GlobalColorProvider from './GlobalColorProvider';
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
if (!projectId) {
  console.error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set in .env file");
  throw new Error("WalletConnect ProjectId is required. Please check your .env file.");
}
const config = getDefaultConfig({
  appName: "0x Token Swap dApp",
  projectId,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [mainnet],
  ssr: false,
});

const queryClient = new QueryClient();

const timeoutId: Record<string, number> = {};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        onErrorRetry: (error, key, config, revalidate, { retryCount: apiRetryCount }) => {
          if (skipRetryStatus.has(error.response?.status) || error.code === 'ERR_NETWORK') return;
          const is429 = error.message?.indexOf('429') !== -1;
          if (apiRetryCount >= 10) return;

          timeoutId[key] && clearTimeout(timeoutId[key]);
          timeoutId[key] = window.setTimeout(() => revalidate({ retryCount: apiRetryCount }), is429 ? apiRetryCount * 1000 : 5000);
        }
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ThemeProvider>
              <GlobalColorProvider>
                <MockWalletProvider>
                  {children}
                </MockWalletProvider>
              </GlobalColorProvider>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SWRConfig>
  );
}

export { MockWalletProvider, ThemeProvider, GlobalColorProvider };