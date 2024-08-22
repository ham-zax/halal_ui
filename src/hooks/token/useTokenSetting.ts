import { useTokenStore } from '@/store'
import { useAppStore } from '@/store/mockAppStore'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

export default function useTokenSetting() {
  const displayTokenSettings = useAppStore((s) => s.displayTokenSettings)
  const [setDisplayTokenList, loadTokens] = useTokenStore(
    (s) => [s.setDisplayTokenList, s.loadTokens],
    shallow
  )

  useEffect(() => {
    setDisplayTokenList()
  }, [displayTokenSettings, setDisplayTokenList])

  useEffect(() => {
    // Initial load
    loadTokens()

    const intervalId = window.setInterval(() => {
      loadTokens()
    }, 60 * 1000 * 5) // Every 5 minutes

    return () => clearInterval(intervalId)
  }, [loadTokens])
}