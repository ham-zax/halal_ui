import { create } from 'zustand'
import { TOKENS } from '../features/Swap/tokens'
import { useAppStore } from './mockAppStore'

export interface TokenPrice {
  value: number
}

export interface Token {
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  chainId?: number;
  extensions?: Record<string, unknown>;
  userAdded?: boolean;
  type?: string;
  tags?: string[];
  programId?: string;
}

interface TokenStore {
  tokenList: Token[];
  displayTokenList: Token[];
  tokenMap: Map<string, Token>;
  tokenPriceRecord: Map<string, { fetchTime: number; data?: TokenPrice }>;
  whiteListMap: Set<string>;

  loadTokens: () => void;
  setDisplayTokenList: () => void;
  getTokenByAddress: (address: string) => Token | undefined;
  updateTokenPrice: (address: string, price: TokenPrice) => void;
  setExtraTokenListAct: (props: { token: Token; addToStorage?: boolean; update?: boolean }) => void;
}

const EXTRA_TOKEN_KEY = '_r_cus_t_'

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokenList: TOKENS,
  displayTokenList: [],
  tokenMap: new Map(TOKENS.map(token => [token.address, token])),
  tokenPriceRecord: new Map(),
  whiteListMap: new Set<string>(),

  loadTokens: () => {
    // In a real-world scenario, you might fetch tokens from an API here
    set({
      tokenList: TOKENS,
      tokenMap: new Map(TOKENS.map(token => [token.address, token]))
    })
    get().setDisplayTokenList()
  },

  setDisplayTokenList: () => {
    const { displayTokenSettings } = useAppStore.getState()
    set(state => ({
      displayTokenList: state.tokenList.filter(token => {
        // Implement your display logic here based on displayTokenSettings
        // For now, we'll just return all tokens
        return true
      })
    }))
  },

  getTokenByAddress: (address: string) => {
    return get().tokenMap.get(address)
  },

  updateTokenPrice: (address: string, price: TokenPrice) => {
    set(state => ({
      tokenPriceRecord: new Map(state.tokenPriceRecord).set(address, {
        fetchTime: Date.now(),
        data: price
      })
    }))
  },

  setExtraTokenListAct: ({ token, addToStorage = true, update = false }) => {
    set(state => {
      const newTokenList = update
        ? state.tokenList.map(t => t.address === token.address ? token : t)
        : [...state.tokenList, token];
      const newTokenMap = new Map(state.tokenMap);
      newTokenMap.set(token.address, token);

      if (addToStorage) {
        setTokenToStorage(token);
      }

      return {
        tokenList: newTokenList,
        tokenMap: newTokenMap
      };
    });
    get().setDisplayTokenList();
  }
}))

// Utility functions for token storage
export const setTokenToStorage = (token: Token) => {
  const storageTokenList: (Token & { time?: number })[] = JSON.parse(localStorage.getItem(EXTRA_TOKEN_KEY) || '[]')
  if (storageTokenList.some((t) => t.address === token.address)) return
  try {
    localStorage.setItem(
      EXTRA_TOKEN_KEY,
      JSON.stringify(
        storageTokenList.concat([
          {
            ...token,
            time: Date.now()
          }
        ])
      )
    )
  } catch {
    console.warn('local storage exceed')
  }
}

export const getStorageToken = (mint: string): Token | undefined => {
  const storageTokenList: (Token & { time?: number })[] = JSON.parse(localStorage.getItem(EXTRA_TOKEN_KEY) || '[]')
  return storageTokenList.find((t) => t.address === mint)
}