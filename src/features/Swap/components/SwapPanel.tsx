import { Box, Grid, GridItem, HStack, VStack, useClipboard, Button, Flex, Text, SimpleGrid, CircularProgress } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallow } from 'zustand/shallow'
import Decimal from 'decimal.js'

import ConnectedButton from '@/components/ConnectedButton'
import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useHover } from '@/hooks/useHover'
import { useTokenAccountStore, useTokenStore } from '@/store'
import { useAppStore } from '@/store/mockAppStore'
import { colors } from '@/theme/cssVariables'
import { urlToMint, mintToUrl, isSolWSol, getMintPriority } from '@/utils/token'
import { useRouteQuery, setUrlQuery } from '@/utils/routeTools'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { debounce } from '@/utils/functionMethods'
import useTokenInfo from '@/hooks/token/useTokenInfo'

import SwapButtonTwoTurnIcon from '@/icons/misc/SwapButtonTwoTurnIcon'
import SwapButtonOneTurnIcon from '@/icons/misc/SwapButtonOneTurnIcon'
import CircleInfo from '@/icons/misc/CircleInfo'
import WarningIcon from '@/icons/misc/WarningIcon'

import { useActiveAccount, TransactionButton } from "thirdweb/react"

import { getSwapPairCache, setSwapPairCache } from '../util'
import { getPrice, trySwap } from '@/utils/0x/swapUtils'

export function SwapPanel({
  onInputMintChange,
  onOutputMintChange,
  onDirectionNeedReverse
}: {
  onInputMintChange?: (mint: string) => void
  onOutputMintChange?: (mint: string) => void
  onDirectionNeedReverse?(): void
}) {
  const { t, i18n } = useTranslation()
  const query = useRouteQuery<{ inputMint: string; outputMint: string }>()
  const [urlInputMint, urlOutputMint] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
  const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [defaultInput, defaultOutput] = [urlInputMint || cacheInput, urlOutputMint || cacheOutput]

  const { swap: swapDisabled = false } = useAppStore().featureDisabled
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [getTokenBalanceUiAmount, fetchTokenAccountAct, refreshTokenAccTime] = useTokenAccountStore(
    (s) => [s.getTokenBalanceUiAmount, s.fetchTokenAccountAct, s.refreshTokenAccTime],
    shallow
  )

  const [inputMint, setInputMint] = useState<string>('');
  const [outputMint, setOutputMint] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<TokenInfo | ApiV3Token | null>(null);
  const [tokenOutput, setTokenOutput] = useState<TokenInfo | ApiV3Token | null>(null);
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionResp, setTransactionResp] = useState<any>(undefined);

  const activeAccount = useActiveAccount();

  const isTokenLoaded = tokenMap.size > 0
  const { tokenInfo: unknownTokenA } = useTokenInfo({
    mint: isTokenLoaded && !tokenInput && inputMint ? inputMint : undefined
  })
  const { tokenInfo: unknownTokenB } = useTokenInfo({
    mint: isTokenLoaded && !tokenOutput && outputMint ? outputMint : undefined
  })

  useEffect(() => {
    if (defaultInput) setInputMint(defaultInput)
    if (defaultOutput && defaultOutput !== defaultInput) setOutputMint(defaultOutput)
  }, [defaultInput, defaultOutput])

  useEffect(() => {
    setTokenInput(tokenMap.get(inputMint) as ApiV3Token | TokenInfo || null);
    setTokenOutput(tokenMap.get(outputMint) as ApiV3Token | TokenInfo || null);
  }, [inputMint, outputMint, tokenMap]);

  useEffect(() => {
    onInputMintChange?.(inputMint);
    onOutputMintChange?.(outputMint);
    setUrlQuery({ inputMint: mintToUrl(inputMint), outputMint: mintToUrl(outputMint) });
    setSwapPairCache({ inputMint, outputMint });
  }, [inputMint, outputMint, onInputMintChange, onOutputMintChange]);

  const fetchPrice = useCallback(async () => {
    if (!tokenInput || !tokenOutput || !amountIn) return;
    setIsComputing(true);
    setError(null);
    try {
      const amount = new Decimal(amountIn).mul(10 ** (tokenInput.decimals || 0)).toFixed(0);
      const priceData = await getPrice(tokenInput, tokenOutput, amount);
      setAmountOut(new Decimal(priceData.buyAmount).div(10 ** (tokenOutput.decimals || 0)).toString());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch price');
    } finally {
      setIsComputing(false);
    }
  }, [tokenInput, tokenOutput, amountIn]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const handleInputChange = useCallback((val: string) => {
    setAmountIn(val)
  }, [])

  const handleSelectToken = useCallback((token: TokenInfo | ApiV3Token, side: 'input' | 'output') => {
    if (side === 'input') {
      if (token.address === outputMint) {
        setInputMint(token.address);
        setOutputMint(inputMint);
      } else {
        setInputMint(token.address);
      }
    } else if (side === 'output') {
      if (token.address === inputMint) {
        setOutputMint(token.address);
        setInputMint(outputMint);
      } else {
        setOutputMint(token.address);
      }
    }

    if (side === 'input' && getMintPriority(token.address) > getMintPriority(outputMint)) {
      onDirectionNeedReverse?.();
    } else if (side === 'output' && getMintPriority(inputMint) > getMintPriority(token.address)) {
      onDirectionNeedReverse?.();
    }
  }, [inputMint, outputMint, onDirectionNeedReverse]);

  const handleChangeSide = useCallback(() => {
    setInputMint(outputMint);
    setOutputMint(inputMint);
    setSwapPairCache({
      inputMint: outputMint,
      outputMint: inputMint
    });
  }, [inputMint, outputMint]);

  const handleSwap = async () => {
    if (!activeAccount?.address) return;
    const amount = BigInt(new Decimal(amountIn).mul(10 ** (tokenInput?.decimals || 0)).toFixed(0));
    try {
      const resp = await trySwap(
        activeAccount.address,
        tokenInput?.address || "",
        tokenOutput?.address || "",
        amount  // Pass the BigInt amount here
      );
      setTransactionResp(resp);
    } catch (err) {
      console.error(err);
      setError('Swap failed');
    }
  };

  const balanceAmount = getTokenBalanceUiAmount({ mint: inputMint, decimals: tokenInput?.decimals }).amount
  const balanceNotEnough = balanceAmount.lt(amountIn || 0) ? t('error.balance_not_enough') : undefined
  const swapError = error || balanceNotEnough

  return (
    <>
      <Flex mb={[4, 5]} direction="column">
        <TokenInput
          name="swap"
          key={`input-${inputMint}`}
          topLeftLabel={t('swap.from_label')}
          token={tokenInput || inputMint}
          value={amountIn}
          readonly={swapDisabled}
          disableClickBalance={swapDisabled}
          onChange={(v) => handleInputChange(v)}
          onTokenChange={(token) => handleSelectToken(token, 'input')}
          defaultUnknownToken={unknownTokenA}
        />
        <SwapIcon onClick={handleChangeSide} />
        <TokenInput
          name="swap"
          key={`output-${outputMint}`}
          topLeftLabel={t('swap.to_label')}
          token={tokenOutput || outputMint}
          value={amountOut}
          readonly={true}
          onTokenChange={(token) => handleSelectToken(token, 'output')}
          defaultUnknownToken={unknownTokenB}
        />
      </Flex>

      {swapError && (
        <Text color={colors.semanticError} mb={3}>
          {swapError}
        </Text>
      )}

      {transactionResp ? (
        <TransactionButton
          transaction={() => transactionResp}
          onTransactionConfirmed={() => {
            setAmountIn('')
            setAmountOut('')
            setTransactionResp(undefined)
          }}
          onError={(error) => {
            console.error('Transaction failed:', error)
            setError('Transaction failed. Please try again.')
          }}
        >
          Swap
        </TransactionButton>
      ) : (
        <ConnectedButton
          isDisabled={!amountIn || !!swapError || swapDisabled}
          isLoading={isComputing}
          loadingText={<div>{isComputing ? t('swap.computing') : ''}</div>}
          onClick={handleSwap}
        >
          <Text>
            {swapDisabled ? t('common.disabled') : swapError || t('swap.title')}
          </Text>
        </ConnectedButton>
      )}
    </>
  )
}

function SwapIcon(props: { onClick?: () => void }) {
  const targetElement = useRef<HTMLDivElement | null>(null)
  const isHover = useHover(targetElement)
  return (
    <SimpleGrid
      ref={targetElement}
      bg={isHover ? colors.semanticFocus : undefined}
      width="42px"
      height="42px"
      placeContent="center"
      rounded="full"
      cursor="pointer"
      my={-3}
      mx="auto"
      zIndex={2}
      onClick={props.onClick}
    >
      {isHover ? <SwapButtonTwoTurnIcon /> : <SwapButtonOneTurnIcon />}
    </SimpleGrid>
  )
}