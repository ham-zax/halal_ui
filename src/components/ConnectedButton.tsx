import { useAppStore } from '@/store/mockAppStore'
import { Button, ButtonProps } from '@chakra-ui/react'
import { LegacyRef, PropsWithChildren, forwardRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type Props = PropsWithChildren<ButtonProps>

export default forwardRef(function ConnectedButton({ children, onClick, isDisabled, ...props }: Props, ref: LegacyRef<HTMLButtonElement>) {
  const { t } = useTranslation()
  const connected = useAppStore((s) => s.connected)
  const setConnected = useAppStore((s) => s.setConnected)

  const handleConnect = useCallback(() => {
    // Simulate connection process
    setTimeout(() => {
      setConnected(true)
    }, 1000)
  }, [setConnected])

  return (
    <Button
      ref={connected ? ref : undefined}
      {...props}
      isDisabled={connected ? isDisabled : false}
      onClick={connected ? onClick : handleConnect}
    >
      {connected ? children : t('button.connect_wallet')}
    </Button>
  )
})