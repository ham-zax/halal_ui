import { Box, HStack, Text, Collapse, Flex, Skeleton, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'react-feather'
import { colors } from '@/theme/cssVariables'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { Token } from '@/store'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import IntervalCircle from '@/components/IntervalCircle'
import CircleCheckBreaker from '@/icons/misc/CircleCheckBreaker'
import HorizontalSwitchIcon from '@/icons/misc/HorizontalSwitchIcon'
import WarningIcon from '@/icons/misc/WarningIcon'

export function SwapInfoBoard({
  amountIn,
  tokenInput,
  tokenOutput,
  isComputing,
  computedSwapResult,
  onRefresh
}: {
  amountIn: string
  tokenInput?: Token
  tokenOutput?: Token
  isComputing: boolean
  computedSwapResult?: any
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const [showMoreSwapInfo, setShowMoreSwapInfo] = useState(false)
  const priceImpact = computedSwapResult?.priceImpact ? parseFloat(computedSwapResult.priceImpact) : 0
  const isHighRiskPrice = priceImpact > 5

  return (
    <Box
      position="relative"
      boxShadow={isHighRiskPrice ? `0px 0px 12px 6px rgba(255, 78, 163, 0.15)` : 'none'}
      bg={isHighRiskPrice ? 'rgba(255, 78, 163,0.1)' : colors.backgroundTransparent07}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={isHighRiskPrice ? colors.semanticError : colors.backgroundTransparent12}
      rounded="md"
      px={4}
      pt={1.5}
      pb={2}
    >
      <HStack gap={4} py={2} justifyContent="space-between">
        <PriceDetector
          computedSwapResult={computedSwapResult}
          isComputing={isComputing}
          tokenInput={tokenInput}
          tokenOutput={tokenOutput}
        />
        <IntervalCircle
          duration={60 * 1000}
          svgWidth={18}
          strokeWidth={2}
          trackStrokeColor={colors.secondary}
          trackStrokeOpacity={0.5}
          filledTrackStrokeColor={colors.secondary}
          onClick={onRefresh}
          onEnd={onRefresh}
        />
      </HStack>

      <HStack gap={4} py={1} justifyContent="space-between">
        <ItemLabel
          name={t('swap.info_minimum_received')}
          tooltip={t('swap.info_minimum_received_tooltip')}
        />
        <MinimumReceiveValue tokenOutput={tokenOutput} amount={computedSwapResult?.minimumReceived || ''} />
      </HStack>

      <HStack gap={4} py={1} justifyContent="space-between">
        <ItemLabel name={t('swap.info_price_impact')} tooltip={t('swap.info_price_impact_tooltip')} />
        <Text
          fontSize="xs"
          color={isHighRiskPrice ? colors.semanticError : priceImpact > 1 ? colors.semanticWarning : colors.textSecondary}
          fontWeight={500}
        >
          {computedSwapResult ? `${formatToRawLocaleStr(toPercentString(priceImpact, { notShowZero: true }))}` : '-'}
        </Text>
      </HStack>

      <Collapse in={showMoreSwapInfo} animateOpacity>
        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel name={t('swap.info_order_routing')} tooltip={t('swap.info_order_routing_tooltip')} />
          <Text fontSize="xs" color={colors.textSecondary}>
            {computedSwapResult?.route || '-'}
          </Text>
        </HStack>

        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel name={t('swap.info_estimated_fees')} tooltip={t('swap.info_estimated_fees_tooltip')} />
          <Text fontSize="xs" color={colors.textPrimary}>
            {computedSwapResult?.estimatedGas || '-'}
          </Text>
        </HStack>
      </Collapse>

      <HStack
        color={colors.textSecondary}
        fontSize="xs"
        fontWeight={500}
        spacing={0.5}
        justify="center"
        onClick={() => setShowMoreSwapInfo((b) => !b)}
      >
        <Text align="center" cursor="pointer">
          {showMoreSwapInfo ? t('common.less_info') : t('common.more_info')}
        </Text>
        <Box transform={`rotate(${showMoreSwapInfo ? `${180}deg` : 0})`} transition="300ms">
          <ChevronDown size={12} />
        </Box>
      </HStack>
    </Box>
  )
}

function PriceDetector({
  isComputing,
  tokenInput,
  tokenOutput,
  computedSwapResult
}: {
  isComputing: boolean
  tokenInput?: Token
  tokenOutput?: Token
  computedSwapResult?: any
}) {
  const [reverse, setReverse] = useState(false)
  const { t } = useTranslation()

  const priceImpact = computedSwapResult
    ? parseFloat(computedSwapResult.priceImpact) > 5
      ? 'high'
      : parseFloat(computedSwapResult.priceImpact) > 1
        ? 'warning'
        : 'low'
    : undefined

  let price = computedSwapResult?.price || ''
  if (reverse && price !== '') {
    price = (1 / parseFloat(price)).toFixed(6)
  }

  return (
    <HStack>
      <Text as="div" color={colors.textPrimary} fontWeight={500}>
        <Flex gap="1" alignItems="center" flexWrap="wrap" maxW={['80%', 'none']}>
          <Text as="div">1</Text>
          <Text as="div">{reverse ? tokenOutput?.symbol : tokenInput?.symbol}</Text>≈
          {!isComputing ? (
            <Text as="div">
              {price}
            </Text>
          ) : (
            <Skeleton width={`${12 * ((reverse ? tokenInput?.decimals : tokenOutput?.decimals) || 1)}px`} height="24px" />
          )}
          <Text as="div">{reverse ? tokenInput?.symbol : tokenOutput?.symbol}</Text>
        </Flex>
      </Text>
      <Tooltip label={t(`swap.price_impact_${priceImpact}_tooltip`)}>
        {priceImpact === 'low' ? (
          <CircleCheckBreaker />
        ) : priceImpact === 'warning' ? (
          <WarningIcon />
        ) : priceImpact === 'high' ? (
          <WarningIcon stroke={colors.semanticError} />
        ) : null}
      </Tooltip>
      <Box onClick={() => setReverse((b) => !b)} color={colors.textSecondary} cursor="pointer">
        <HorizontalSwitchIcon />
      </Box>
    </HStack>
  )
}

function ItemLabel({ name, tooltip }: { name: string; tooltip?: string | null }) {
  return (
    <HStack fontSize="xs" color={colors.textSecondary}>
      <Text>{name}</Text>
      {tooltip && <QuestionToolTip label={tooltip} iconProps={{ color: colors.textTertiary }} />}
    </HStack>
  )
}

function MinimumReceiveValue({ tokenOutput, amount }: { tokenOutput?: Token; amount: string }) {
  return (
    <HStack fontSize="xs" fontWeight={500}>
      <Text color={colors.textPrimary}>
        {amount ? formatToRawLocaleStr(amount, { decimalPlaces: tokenOutput?.decimals }) : '-'}
      </Text>
      <Text color={colors.textSecondary}>{tokenOutput?.symbol}</Text>
    </HStack>
  )
}