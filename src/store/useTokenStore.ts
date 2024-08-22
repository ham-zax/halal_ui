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
  priority: number;
  userAdded?: boolean;
  type?: string;
  tags?: string[];
  chainId: number;
  programId: string;
  extensions: Record<string, unknown>;
}

interface TokenStore {
  tokenList: Token[];
  displayTokenList: Token[];
  tokenMap: Map<string, Token>;
  tokenPriceRecord: Map<string, { fetchTime: number; data?: TokenPrice }>;

  loadTokens: () => void;
  setDisplayTokenList: () => void;
  getTokenByAddress: (address: string) => Token | undefined;
  updateTokenPrice: (address: string, price: TokenPrice) => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokenList: TOKENS,
  displayTokenList: [],
  tokenMap: new Map(TOKENS.map(token => [token.address, token])),
  tokenPriceRecord: new Map(),

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
  }
}))