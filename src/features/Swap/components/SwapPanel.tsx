import { Box, Flex, HStack, Text, SimpleGrid, Collapse } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'

import ConnectedButton from '@/components/ConnectedButton'
import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useHover } from '@/hooks/useHover'
import { Token, useTokenAccountStore, useTokenStore } from '@/store'
import { useAppStore } from '@/store/mockAppStore'
import { colors } from '@/theme/cssVariables'
import { urlToMint, mintToUrl, getMintPriority } from '@/utils/token'
import { useRouteQuery, setUrlQuery } from '@/utils/routeTools'
import useTokenInfo from '@/hooks/token/useTokenInfo'

import SwapButtonTwoTurnIcon from '@/icons/misc/SwapButtonTwoTurnIcon'
import SwapButtonOneTurnIcon from '@/icons/misc/SwapButtonOneTurnIcon'

import { useActiveAccount, TransactionButton, useWalletBalance, useActiveWalletChain } from "thirdweb/react"

import { getSwapPairCache, setSwapPairCache } from '../util'
import { getPrice, trySwap } from '@/utils/0x/swapUtils'
import { client } from '@/utils/thirdweb/client'
import { SwapInfoBoard } from './SwapInfoBoard'

export function SwapPanel({
  onInputMintChange,
  onOutputMintChange,
  onDirectionNeedReverse
}: {
  onInputMintChange?: (mint: string) => void
  onOutputMintChange?: (mint: string) => void
  onDirectionNeedReverse?(): void
}) {
  const { t } = useTranslation()
  const query = useRouteQuery<{ inputMint: string; outputMint: string }>()
  const [urlInputMint, urlOutputMint] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
  const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [defaultInput, defaultOutput] = [urlInputMint || cacheInput, urlOutputMint || cacheOutput]

  const { swap: swapDisabled = false } = useAppStore().featureDisabled
  const tokenMap = useTokenStore((s) => s.tokenMap)

  const [inputMint, setInputMint] = useState<string>('');
  const [outputMint, setOutputMint] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<Token | undefined>(undefined);
  const [tokenOutput, setTokenOutput] = useState<Token | undefined>(undefined);
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionResp, setTransactionResp] = useState<any>(undefined);
  const [hasValidAmountOut, setHasValidAmountOut] = useState(false)

  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();

  const { data: inputTokenBalance } = useWalletBalance({
    address: activeAccount?.address,
    client: client,
    chain: activeChain,
    tokenAddress: inputMint
  });

  const isTokenLoaded = tokenMap.size > 0
  const { tokenInfo: unknownTokenA } = useTokenInfo({
    mint: isTokenLoaded && !tokenInput && inputMint ? inputMint : undefined
  })
  const { tokenInfo: unknownTokenB } = useTokenInfo({
    mint: isTokenLoaded && !tokenOutput && outputMint ? outputMint : undefined
  })

  const [swapDetails, setSwapDetails] = useState({
    price: '',
    estimatedGas: '',
    priceImpact: '',
    route: '',
    minimumReceived: '',
    otherAmountThreshold: ''
  });

  useEffect(() => {
    if (defaultInput) setInputMint(defaultInput)
    if (defaultOutput && defaultOutput !== defaultInput) setOutputMint(defaultOutput)
  }, [defaultInput, defaultOutput])

  useEffect(() => {
    setTokenInput(tokenMap.get(inputMint));
    setTokenOutput(tokenMap.get(outputMint));
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
      const sellAmount = new Decimal(amountIn).mul(10 ** (tokenInput.decimals || 0)).toFixed(0);
      const priceData = await getPrice(tokenInput, tokenOutput, Number(sellAmount));

      const buyAmount = new Decimal(priceData.buyAmount).div(10 ** (tokenOutput.decimals || 0));
      const price = new Decimal(priceData.price);
      const estimatedGas = priceData.estimatedGas;
      const priceImpact = new Decimal(priceData.estimatedPriceImpact);

      setAmountOut(buyAmount.toString());
      setSwapDetails({
        price: price.toFixed(6),
        estimatedGas,
        priceImpact: priceImpact.mul(100).toFixed(2),
        route: priceData.sources.filter((source: { proportion: string }) => source.proportion !== "0")
          .map((source: { name: any; proportion: Decimal.Value }) => `${source.name} (${new Decimal(source.proportion).mul(100).toFixed(0)}%)`)
          .join(', '),
        minimumReceived: new Decimal(priceData.buyAmount).mul(0.99).div(10 ** (tokenOutput.decimals || 0)).toFixed(tokenOutput.decimals),
        otherAmountThreshold: priceData.buyAmount
      });

      setHasValidAmountOut(true);
    } catch (err) {
      console.error('Price fetch error:', err);
      setError('Failed to fetch price');
      setHasValidAmountOut(false);
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

  const handleSelectToken = useCallback((token: Token, side: 'input' | 'output') => {
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

  const handleSwap = useCallback(async () => {
    if (!activeAccount?.address || !tokenInput || !tokenOutput || !amountIn || !activeChain) return;

    const amount = BigInt(new Decimal(amountIn).mul(10 ** (tokenInput.decimals || 0)).toFixed(0));
    try {
      const resp = await trySwap(
        activeAccount.address,
        tokenInput.address,
        tokenOutput.address,
        amount,
        activeChain
      );
      setTransactionResp(resp);
    } catch (err) {
      console.error(err);
      setError('Swap failed');
    }
  }, [activeAccount, tokenInput, tokenOutput, amountIn, activeChain]);

  const balanceAmount = inputTokenBalance?.displayValue || '0';
  const balanceNotEnough = new Decimal(balanceAmount).lt(amountIn || 0) ? t('error.balance_not_enough') : undefined;
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

      <Collapse in={hasValidAmountOut} animateOpacity>
        <Box mb={[4, 5]}>
          <SwapInfoBoard
            amountIn={amountIn}
            tokenInput={tokenInput}
            tokenOutput={tokenOutput}
            isComputing={isComputing}
            computedSwapResult={swapDetails}
            onRefresh={fetchPrice}
          />
        </Box>
      </Collapse>

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