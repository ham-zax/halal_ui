import create from 'zustand'

// Simplified types
export enum PriorityLevel {
  Fast,
  Turbo,
  Ultra
}

export enum PriorityMode {
  MaxCap,
  Exact
}

export enum TxVersion {
  V0,
  Legacy
}

interface MockAppState {
  isMobile: boolean
  isLaptop: boolean
  aprMode: 'M' | 'D'
  connected: boolean
  explorerUrl: string

  displayTokenSettings: {
    official: boolean
    jup: boolean
    userAdded: boolean
  }

  txVersion: TxVersion
  appVersion: string
  needRefresh: boolean

  priorityLevel: PriorityLevel
  priorityMode: PriorityMode
  transactionFee?: string
  feeConfig: Partial<Record<PriorityLevel, number>>

  getPriorityFee: () => string | undefined
  setAprMode: (mode: 'M' | 'D') => void
  setDisplayTokenSettings: (settings: Partial<MockAppState['displayTokenSettings']>) => void
  setPriorityLevel: (level: PriorityLevel) => void
  setPriorityMode: (mode: PriorityMode) => void
  setTransactionFee: (fee: string) => void
}

const initialState: MockAppState = {
  isMobile: false,
  isLaptop: false,
  aprMode: 'M',
  connected: false,
  explorerUrl: 'https://explorer.solana.com',

  displayTokenSettings: {
    official: true,
    jup: true,
    userAdded: true,
  },

  txVersion: TxVersion.V0,
  appVersion: 'V3.0.2',
  needRefresh: false,

  priorityLevel: PriorityLevel.Turbo,
  priorityMode: PriorityMode.MaxCap,
  feeConfig: {
    [PriorityLevel.Fast]: 0.000001,
    [PriorityLevel.Turbo]: 0.000002,
    [PriorityLevel.Ultra]: 0.000003,
  },
  transactionFee: '0.0003',

  getPriorityFee: () => '0.0003',
  setAprMode: () => {},
  setDisplayTokenSettings: () => {},
  setPriorityLevel: () => {},
  setPriorityMode: () => {},
  setTransactionFee: () => {},
}

export const useMockAppStore = create<MockAppState>((set, get) => ({
  ...initialState,

  getPriorityFee: () => {
    const { priorityMode, priorityLevel, transactionFee, feeConfig } = get()
    if (priorityMode === PriorityMode.Exact) return transactionFee
    if (feeConfig[priorityLevel] === undefined || transactionFee === undefined) return String(feeConfig[PriorityLevel.Turbo] ?? 0)
    return String(Math.min(Number(transactionFee), feeConfig[priorityLevel]!))
  },

  setAprMode: (mode) => set({ aprMode: mode }),

  setDisplayTokenSettings: (settings) => set((state) => ({
    displayTokenSettings: { ...state.displayTokenSettings, ...settings }
  })),

  setPriorityLevel: (level) => set({ priorityLevel: level }),

  setPriorityMode: (mode) => set({ priorityMode: mode }),

  setTransactionFee: (fee) => set({ transactionFee: fee }),
}))

// Export the mock store as useAppStore to maintain compatibility with existing code
export const useAppStore = useMockAppStore