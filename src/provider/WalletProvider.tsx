import React, { FC, PropsWithChildren, useEffect } from 'react'
import { useAppStore } from '../store/mockAppStore'

const MockWalletProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { setWallets } = useAppStore()

  useEffect(() => {
    // Set mock wallets
    const mockWallets = [
      { adapter: { name: 'Phantom', icon: '/path/to/phantom-icon.png' } },
      { adapter: { name: 'Solflare', icon: '/path/to/solflare-icon.png' } },
      // Add more mock wallets as needed
    ]
    setWallets(mockWallets)
  }, [setWallets])

  return <>{children}</>
}

export default MockWalletProvider