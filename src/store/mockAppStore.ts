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
interface Wallet {
  adapter: {
    name: string;
    icon: string;
  };
}
interface MockAppState {
  isMobile: boolean
  isLaptop: boolean
  aprMode: 'M' | 'D'
  connected: boolean
  explorerUrl: string
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  connecting: boolean;
  visible: boolean;
  publicKey: string | null;
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
 
  setConnected: (isConnected: boolean) => void
  setWallets: (wallets: Wallet[]) => void;
  setSelectedWallet: (wallet: Wallet | null) => void;
  setConnecting: (connecting: boolean) => void;
  setVisible: (visible: boolean) => void;
  setPublicKey: (publicKey: string | null) => void;

  select: (walletName: string) => void;
  connect: () => void;
  disconnect: () => void;
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
  setAprMode: () => { },
  setDisplayTokenSettings: () => { },
  setPriorityLevel: () => { },
  setPriorityMode: () => { },
  setTransactionFee: () => { },
  wallets: [],
  selectedWallet: null,
  connecting: false,
  visible: false,
  publicKey: null,
  setConnected: function (isConnected: boolean): void {
    throw new Error('Function not implemented.');
  },
  setWallets: function (wallets: Wallet[]): void {
    throw new Error('Function not implemented.');
  },
  setSelectedWallet: function (wallet: Wallet | null): void {
    throw new Error('Function not implemented.');
  },
  setConnecting: function (connecting: boolean): void {
    throw new Error('Function not implemented.');
  },
  setVisible: function (visible: boolean): void {
    throw new Error('Function not implemented.');
  },
  setPublicKey: function (publicKey: string | null): void {
    throw new Error('Function not implemented.');
  },
  select: function (walletName: string): void {
    throw new Error('Function not implemented.');
  },
  connect: function (): void {
    throw new Error('Function not implemented.');
  },
  disconnect: function (): void {
    throw new Error('Function not implemented.');
  }
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

  setWallets: (wallets) => set({ wallets }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setConnected: (connected) => set({ connected }),
  setConnecting: (connecting) => set({ connecting }),
  setVisible: (visible) => set({ visible }),
  setPublicKey: (publicKey) => set({ publicKey }),
  setDisplayTokenSettings: (settings) => set((state) => ({
    displayTokenSettings: { ...state.displayTokenSettings, ...settings }
  })),

  select: (walletName) => {
    const { wallets } = get();
    const wallet = wallets.find(w => w.adapter.name === walletName);
    if (wallet) {
      set({ selectedWallet: wallet });
    }
  },

  connect: () => {
    set({ connecting: true });
    setTimeout(() => {
      set({ 
        connected: true, 
        connecting: false, 
        publicKey: 'mock-public-key'
      });
    }, 1000);
  },

  disconnect: () => {
    set({ 
      connected: false, 
      selectedWallet: null, 
      publicKey: null 
    });
  },
  setPriorityLevel: (level) => set({ priorityLevel: level }),

  setPriorityMode: (mode) => set({ priorityMode: mode }),

  setTransactionFee: (fee) => set({ transactionFee: fee }),
}))

// Export the mock store as useAppStore to maintain compatibility with existing code
export const useAppStore = useMockAppStore