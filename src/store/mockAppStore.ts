import { PublicKey, Connection, Transaction, VersionedTransaction, EpochInfo } from '@solana/web3.js'
import { Raydium } from '@raydium-io/raydium-sdk-v2'
import { Wallet } from '@solana/wallet-adapter-react'
import create from 'zustand'

// You may need to define or import these types
import { PriorityLevel, PriorityMode, Commitment, JupTokenType, AvailabilityCheckAPI3, TxVersion, API_URL_CONFIG, ProgramIdConfig } from './types'

interface MockAppState {
  raydium?: Raydium
  connection?: Connection
  signAllTransactions?: (<T extends Transaction | VersionedTransaction>(transaction: T[]) => Promise<T[]>) | undefined
  publicKey?: PublicKey
  explorerUrl: string
  isMobile: boolean
  isLaptop: boolean
  aprMode: 'M' | 'D'
  wallet?: Wallet
  initialing: boolean
  connected: boolean
  chainTimeOffset: number
  blockSlotCountForSecond: number
  commitment: Commitment

  rpcNodeUrl?: string
  wsNodeUrl?: string
  rpcs: { url: string; ws?: string; weight: number; batch: boolean; name: string }[]
  urlConfigs: typeof API_URL_CONFIG
  programIdConfig: typeof ProgramIdConfig

  jupTokenType: JupTokenType
  displayTokenSettings: {
    official: boolean
    jup: boolean
    userAdded: boolean
  }

  featureDisabled: Partial<AvailabilityCheckAPI3>

  epochInfo?: EpochInfo
  txVersion: TxVersion
  tokenAccLoaded: boolean

  appVersion: string
  needRefresh: boolean

  priorityLevel: PriorityLevel
  priorityMode: PriorityMode
  transactionFee?: string
  feeConfig: Partial<Record<PriorityLevel, number>>

  getPriorityFee: () => string | undefined
  getEpochInfo: () => Promise<EpochInfo | undefined>
  initRaydiumAct: (payload: any) => Promise<void>
  fetchChainTimeAct: () => void
  fetchRpcsAct: () => Promise<void>
  fetchBlockSlotCountAct: () => Promise<void>
  setUrlConfigAct: (urls: API_URL_CONFIG) => void
  setProgramIdConfigAct: (urls: ProgramIdConfig) => void
  setRpcUrlAct: (url: string, skipToast?: boolean, skipError?: boolean) => Promise<boolean>
  setAprModeAct: (mode: 'M' | 'D') => void
  checkAppVersionAct: () => Promise<void>
  fetchPriorityFeeAct: () => Promise<void>
}

const initialState: MockAppState = {
  explorerUrl: 'https://explorer.solana.com',
  isMobile: false,
  isLaptop: false,
  aprMode: 'M',
  initialing: false,
  connected: false,
  chainTimeOffset: 0,
  blockSlotCountForSecond: 0,
  commitment: 'confirmed',
  rpcs: [],
  urlConfigs: {} as typeof API_URL_CONFIG,
  programIdConfig: {} as typeof ProgramIdConfig,
  jupTokenType: JupTokenType.Strict,
  displayTokenSettings: {
    official: true,
    jup: true,
    userAdded: true,
  },
  featureDisabled: {},
  txVersion: TxVersion.V0,
  tokenAccLoaded: false,
  appVersion: 'V3.0.2',
  needRefresh: false,
  priorityLevel: PriorityLevel.Turbo,
  priorityMode: PriorityMode.MaxCap,
  feeConfig: {},
  transactionFee: '0.0003',

  getPriorityFee: () => '0.0003',
  getEpochInfo: async () => undefined,
  initRaydiumAct: async () => {},
  fetchChainTimeAct: () => {},
  fetchRpcsAct: async () => {},
  fetchBlockSlotCountAct: async () => {},
  setUrlConfigAct: () => {},
  setProgramIdConfigAct: () => {},
  setRpcUrlAct: async () => true,
  setAprModeAct: () => {},
  checkAppVersionAct: async () => {},
  fetchPriorityFeeAct: async () => {},
}

export const useMockAppStore = create<MockAppState>((set, get) => ({
  ...initialState,

  getPriorityFee: () => {
    const { priorityMode, priorityLevel, transactionFee, feeConfig } = get()
    if (priorityMode === PriorityMode.Exact) return transactionFee
    if (feeConfig[priorityLevel] === undefined || transactionFee === undefined) return String(feeConfig[PriorityLevel.Turbo] ?? 0)
    return String(Math.min(Number(transactionFee), feeConfig[priorityLevel]!))
  },

  getEpochInfo: async () => {
    // Implement mock logic if needed
    return undefined
  },

  initRaydiumAct: async (payload) => {
    set({ initialing: true })
    // Implement mock initialization logic
    set({ initialing: false, connected: true })
  },

  fetchChainTimeAct: () => {
    // Implement mock chain time fetching logic
  },

  fetchRpcsAct: async () => {
    // Implement mock RPC fetching logic
  },

  fetchBlockSlotCountAct: async () => {
    // Implement mock block slot count fetching logic
  },

  setUrlConfigAct: (urls) => {
    set({ urlConfigs: { ...get().urlConfigs, ...urls } })
  },

  setProgramIdConfigAct: (urls) => {
    set({ programIdConfig: { ...get().programIdConfig, ...urls } })
  },

  setRpcUrlAct: async (url, skipToast, skipError) => {
    // Implement mock RPC URL setting logic
    return true
  },

  setAprModeAct: (mode) => {
    set({ aprMode: mode })
  },

  checkAppVersionAct: async () => {
    // Implement mock app version checking logic
  },

  fetchPriorityFeeAct: async () => {
    // Implement mock priority fee fetching logic
  },
}))

export const useAppStore = useMockAppStore