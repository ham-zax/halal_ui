import { Box, Grid, GridItem, HStack, VStack, useClipboard } from '@chakra-ui/react'
import { RAYMint, SOLMint } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import PanelCard from '@/components/PanelCard'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import SwapChatEmptyIcon from '@/icons/misc/SwapChatEmptyIcon'
import SwapChatIcon from '@/icons/misc/SwapChatIcon'
import SwapExchangeIcon from '@/icons/misc/SwapExchangeIcon'
import LinkIcon from '@/icons/misc/LinkIcon'
import DollarIcon from '@/icons/misc/DollarIcon'
import { useTokenStore } from '@/store'

import { useAppStore } from '@/store/mockAppStore'
import { colors } from '@/theme/cssVariables'
import { getVHExpression } from '../../theme/cssValue/getViewportExpression'
import { getSwapPairCache, setSwapPairCache } from './util'
import { SwapKlinePanel } from './components/SwapKlinePanel'
import { SwapKlinePanelMobileDrawer } from './components/SwapKlinePanelMobileDrawer'
import { SwapKlinePanelMobileThumbnail } from './components/SwapKlinePanelMobileThumbnail'
import { SwapPanel } from './components/SwapPanel'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { getMintPriority } from '@/utils/token'
import Tooltip from '@/components/Tooltip'
// import { MoonpayBuy } from '@/components/Moonpay'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { TOKENS } from './tokens'
import { TransactionButton, useActiveAccount } from 'thirdweb/react'
import { trySwap } from '@/utils/0x/swapUtils'

function qs(obj: any) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

export default function Swap() {
  // const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [inputMint, setInputMint] = useState<string>(PublicKey.default.toBase58())
  const [outputMint, setOutputMint] = useState<string>(RAYMint.toBase58())
  const [isPCChartShown, setIsPCChartShown] = useState<boolean>(true)
  const [isMobileChartShown, setIsMobileChartShown] = useState<boolean>(false)
  const [isChartLeft, setIsChartLeft] = useState<boolean>(true)
  const isMobile = useAppStore((s) => s.isMobile)
  // const publicKey = useAppStore((s) => s.publicKey)
  const connected = useAppStore((s) => s.connected)
  const [directionReverse, setDirectionReverse] = useState<boolean>(false)
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType>('15m')
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const untilDate = useRef(Math.floor(Date.now() / 1000))
  const swapPanelRef = useRef<HTMLDivElement>(null)
  const klineRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { onCopy, setValue } = useClipboard('')
  const [isBlinkReferralActive, setIsBlinkReferralActive] = useState(false)
  const solMintAddress = SOLMint.toBase58()

  const baseMint = directionReverse ? outputMint : inputMint
  const quoteMint = directionReverse ? inputMint : outputMint
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const baseToken = useMemo(() => tokenMap.get(baseMint), [tokenMap, baseMint])
  const quoteToken = useMemo(() => tokenMap.get(quoteMint), [tokenMap, quoteMint])
  const [isDirectionNeedReverse, setIsDirectionNeedReverse] = useState<boolean>(false)

  useEffect(() => {
    const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
    if (cacheInput) setInputMint(cacheInput)
    if (cacheOutput && cacheOutput !== cacheInput) setOutputMint(cacheOutput)
    setCacheLoaded(true)
  }, [])
  useEffect(() => {
    // preserve swap chart default direction on page refresh by mint priority
    if (cacheLoaded) {
      if (getMintPriority(baseMint) > getMintPriority(quoteMint)) {
        setDirectionReverse(true)
      }
    }
  }, [cacheLoaded])
  // reset directionReverse when inputMint or outputMint changed
  useIsomorphicLayoutEffect(() => {
    if (!cacheLoaded) return
    if (isDirectionNeedReverse) {
      setDirectionReverse(true)
      setIsDirectionNeedReverse(false)
    } else {
      setDirectionReverse(false)
    }

    setSwapPairCache({
      inputMint,
      outputMint
    })
  }, [inputMint, outputMint, cacheLoaded])

  useIsomorphicLayoutEffect(() => {
    if (klineRef.current) {
      const swapPanelHeight = swapPanelRef.current?.getBoundingClientRect().height
      const height = Number(swapPanelHeight) > 500 ? `${swapPanelHeight}px` : '522px'
      klineRef.current.style.height = height
    }
  }, [])
  const activeAccount = useActiveAccount();

  const [transactionResp, setTransactionResp] = useState<any>(undefined);
  const [fromToken, setFromToken] = useState(TOKENS[0].address);
  const [toToken, setToToken] = useState(TOKENS[1].address);
  const [fromAmount, setFromAmount] = useState("");
  const [toValue, setToValue] = useState(0);
  const [gas, setGas] = useState<string | null>(null);

  const selectToken = TOKENS.map(token =>
    <option key={token.address} value={token.address}>{token.symbol}</option>
  )

  const getPrice = async (fromTokenObj: any, toTokenObj: any, amount: string) => {
    const params = {
      sellToken: fromTokenObj.address,
      buyToken: toTokenObj.address,
      sellAmount: amount,
    };
    const headers = { '0x-api-key': '615cde0f-2cc2-4ffd-8c6e-d376603e0a1b' };
    const response = await fetch(`https://sepolia.api.0x.org/swap/v1/price?${qs(params)}`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const calculateToValue = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || !activeAccount?.address) {
      console.log('Missing required data for calculateToValue');
      return;
    }
    const fromTokenObj = TOKENS.find((item) => item.address === fromToken);
    const toTokenObj = TOKENS.find((item) => item.address === toToken);

    if (!fromTokenObj || !toTokenObj) {
      console.log('Invalid token objects');
      return;
    }

    try {
      console.log('Calculating swap values');
      let amount = BigInt(Math.floor(parseFloat(fromAmount) * 10 ** fromTokenObj.decimals));
      console.log('Calculated amount:', amount.toString());
      let swapPriceJSON = await getPrice(fromTokenObj, toTokenObj, amount.toString());

      setToValue(Number(swapPriceJSON.buyAmount) / (10 ** toTokenObj.decimals));
      setGas(swapPriceJSON.estimatedGas);

      const resp = await trySwap(
        activeAccount.address,
        fromTokenObj.address,
        toTokenObj.address,
        amount
      );
      console.log('Swap response:', resp);
      setTransactionResp(resp);
    } catch (error) {
      console.error('Error calculating swap:', error);
      // Handle error (e.g., show error message to user)
    }
  }, [fromToken, toToken, fromAmount, activeAccount]);

  useEffect(() => {
    console.log('useEffect triggered, calling calculateToValue');
    calculateToValue();
  }, [calculateToValue]);

  useEffect(() => {
    // inputMint === solMintAddress || outputMint === solMintAddress ? setIsBlinkReferralActive(true) : setIsBlinkReferralActive(false)
    setIsBlinkReferralActive(true)
    const def = PublicKey.default.toString()
    const _inputMint = inputMint === def ? 'sol' : inputMint
    const _outputMint = outputMint === def ? 'sol' : outputMint
    const href = `https://raydium.io/swap/?inputMint=${_inputMint}&outputMint=${_outputMint}`
    const walletAddress = 'no address'
    const copyUrl = connected ? href + `&referrer=${walletAddress}` : href
    setValue(copyUrl)
  }, [inputMint, outputMint, connected])

  return (
    <VStack
      mx={['unset', 'auto']}
      mt={[0, getVHExpression([0, 800], [32, 1300])]}
      width={!isMobile && isPCChartShown ? 'min(100%, 1300px)' : undefined}
    >
      <HStack alignSelf="flex-end" my={[1, 0]}>
        <SlippageAdjuster />
        <Tooltip
          label={t('swap.blink_referral_desc', {
            symbol: outputMint === solMintAddress ? tokenMap.get(inputMint)?.symbol : tokenMap.get(outputMint)?.symbol
          })}
        >
          <Box
            cursor="pointer"
            opacity={isBlinkReferralActive ? 1 : 0.6}
            onClick={() => {
              if (isBlinkReferralActive) {
                onCopy()
                toastSubject.next({
                  status: 'success',
                  title: t('common.copy_success')
                })
              }
            }}
          >
            <LinkIcon />
          </Box>
        </Tooltip>
        MoonpayBuy was gere
        {/* <MoonpayBuy>
          <DollarIcon />
        </MoonpayBuy> */}

        {!isMobile && isPCChartShown && (
          <Box
            cursor="pointer"
            onClick={() => {
              setIsChartLeft((b) => !b)
            }}
          >
            <SwapExchangeIcon />
          </Box>
        )}
        <Box
          cursor="pointer"
          onClick={() => {
            if (!isMobile) {
              setIsPCChartShown((b) => !b)
            } else {
              setIsMobileChartShown(true)
            }
          }}
        >
          {isMobile || isPCChartShown ? (
            <SwapChatIcon />
          ) : (
            <Box color={colors.textSecondary}>
              <SwapChatEmptyIcon />
            </Box>
          )}
        </Box>
      </HStack>
      <Grid
        width="full"
        gridTemplate={[
          `
            "panel" auto
            "kline" auto / auto
          `,
          isPCChartShown ? (isChartLeft ? `"kline  panel" auto / 1.5fr 1fr` : `"panel kline" auto / 1fr 1.5fr`) : `"panel" auto / auto`
        ]}
        gap={[3, isPCChartShown ? 4 : 0]}
      >
        <GridItem ref={swapPanelRef} gridArea="panel">
          <div className="swapHolder">
            <h4>Swap</h4>
            <div>
              <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
                {selectToken}
              </select>
              <input
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="amount"
              />
            </div>
            <div>
              <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
                {selectToken}
              </select>
              <input value={toValue} readOnly placeholder="amount" />
            </div>
            <div>
              <span>Estimated Gas: </span>
              <span>{gas}</span>
            </div>
            {transactionResp && (
              <TransactionButton
                transaction={transactionResp}
              >
                Swap
              </TransactionButton>
            )}
          </div>
          <PanelCard p={[3, 6]} flexGrow={['1', 'unset']}>
            <SwapPanel
              onInputMintChange={setInputMint}
              onOutputMintChange={setOutputMint}
              onDirectionNeedReverse={() => setIsDirectionNeedReverse((b) => !b)}
            />
          </PanelCard>
        </GridItem>

        <GridItem gridArea="kline" {...(isMobile ? { mb: 3 } : {})}>
          <PanelCard ref={klineRef} p={[3, 3]} gap={4} height="100%" {...(isMobile || !isPCChartShown ? { display: 'none' } : {})}>
            <SwapKlinePanel
              untilDate={untilDate.current}
              baseToken={baseToken}
              quoteToken={quoteToken}
              timeType={selectedTimeType}
              onDirectionToggle={() => setDirectionReverse((b) => !b)}
              onTimeTypeChange={setSelectedTimeType}
            />
          </PanelCard>
          {isMobile && (
            <PanelCard
              p={[3, 6]}
              gap={0}
              onClick={() => {
                setIsMobileChartShown(true)
              }}
              height="100%"
            >
              <SwapKlinePanelMobileThumbnail
                untilDate={untilDate.current}
                baseToken={baseToken}
                quoteToken={quoteToken}
              // onDirectionToggle={() => setDirectionReverse((b) => !b)}
              // onTimeTypeChange={setSelectedTimeType}
              />
              <SwapKlinePanelMobileDrawer
                untilDate={untilDate.current}
                isOpen={isMobileChartShown}
                onClose={() => setIsMobileChartShown(false)}
                baseToken={baseToken}
                quoteToken={quoteToken}
                timeType={selectedTimeType}
                onDirectionToggle={() => setDirectionReverse((b) => !b)}
                onTimeTypeChange={setSelectedTimeType}
              />
            </PanelCard>
          )}
        </GridItem>
      </Grid>
    </VStack>
  )
}
