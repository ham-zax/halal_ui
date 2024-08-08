import { useEffect } from 'react'
import { useAppStore } from '@/store/mockAppStore'

export function useInitConnection() {
  const { 
    setWallets, 
    setConnected, 
    setConnecting, 
    setSelectedWallet, 
    setPublicKey 
  } = useAppStore()

  useEffect(() => {
    // Mock wallet initialization
    const mockWallets = [
      { adapter: { name: 'Phantom', icon: '/path/to/phantom-icon.png' } },
      { adapter: { name: 'Solflare', icon: '/path/to/solflare-icon.png' } },
    ]
    setWallets(mockWallets)

    // Simulate auto-connection (if needed)
    const autoConnect = async () => {
      setConnecting(true)
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConnected(true)
      setSelectedWallet(mockWallets[0])
      setPublicKey('mock-public-key')
      setConnecting(false)
    }

    autoConnect()
  }, [setWallets, setConnected, setConnecting, setSelectedWallet, setPublicKey])
}