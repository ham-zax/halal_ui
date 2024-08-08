import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

export default function CircleCheck(props: SvgIcon) {
  const { width = 14, height = 14, color = colors.semanticSuccess } = props

  return (
    <svg width={width} height={height} viewBox="0 0 14 14" color={color} className="chakra-icon" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM10.815 5.18184C11.0617 4.91148 11.0617 4.47313 10.815 4.20277C10.5684 3.93241 10.1685 3.93241 9.92183 4.20277L6.15789 8.32862L4.07817 6.04893C3.83153 5.77856 3.43163 5.77856 3.18499 6.04893C2.93834 6.31929 2.93834 6.75763 3.18499 7.028L5.7113 9.79723C5.95795 10.0676 6.35784 10.0676 6.60449 9.79723L10.815 5.18184Z"
      />
    </svg>
  )
}

export function CircleCheckForStep(props: SvgIcon) {
  const { width = 40, height = 40 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 40 40" fill={'none'} strokeWidth={0} className="chakra-icon" {...props}>
      <mask id="path-1-inside-1_15566_18407" fill="white" strokeWidth={0}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM30.7681 13.6404C31.1217 13.2162 31.0646 12.5856 30.6404 12.2319C30.2162 11.8783 29.5856 11.9354 29.2319 12.3596L18.128 25.6772C17.7513 26.1289 17.0682 26.1597 16.6525 25.7436L10.7074 19.7932C10.3171 19.4025 9.68391 19.4022 9.29321 19.7926C8.90251 20.1829 8.90223 20.8161 9.29258 21.2068L15.2376 27.1572C16.4846 28.4053 18.5342 28.3131 19.6641 26.958L30.7681 13.6404Z"
          strokeWidth={0}
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={colors.primary}
        d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM30.7681 13.6404C31.1217 13.2162 31.0646 12.5856 30.6404 12.2319C30.2162 11.8783 29.5856 11.9354 29.2319 12.3596L18.128 25.6772C17.7513 26.1289 17.0682 26.1597 16.6525 25.7436L10.7074 19.7932C10.3171 19.4025 9.68391 19.4022 9.29321 19.7926C8.90251 20.1829 8.90223 20.8161 9.29258 21.2068L15.2376 27.1572C16.4846 28.4053 18.5342 28.3131 19.6641 26.958L30.7681 13.6404Z"
      />
      <path
        d="M30.6404 12.2319L30 13L30 13L30.6404 12.2319ZM30.7681 13.6404L31.5361 14.2808L31.5361 14.2808L30.7681 13.6404ZM29.2319 12.3596L28.4639 11.7192V11.7192L29.2319 12.3596ZM18.128 25.6772L18.896 26.3176L18.128 25.6772ZM16.6525 25.7436L17.3599 25.0368L16.6525 25.7436ZM10.7074 19.7932L10 20.5L10.7074 19.7932ZM9.29258 21.2068L10 20.5H10L9.29258 21.2068ZM15.2376 27.1572L15.9451 26.4504H15.9451L15.2376 27.1572ZM19.6641 26.958L18.896 26.3176L19.6641 26.958ZM39 20C39 30.4934 30.4934 39 20 39V41C31.598 41 41 31.598 41 20H39ZM20 1C30.4934 1 39 9.50659 39 20H41C41 8.40202 31.598 -1 20 -1V1ZM1 20C1 9.50659 9.50659 1 20 1V-1C8.40202 -1 -1 8.40202 -1 20H1ZM20 39C9.50659 39 1 30.4934 1 20H-1C-1 31.598 8.40202 41 20 41V39ZM30 13L30 13L31.5361 14.2808C32.2435 13.4324 32.1291 12.1712 31.2808 11.4639L30 13ZM30 13V13L31.2808 11.4639C30.4324 10.7565 29.1713 10.8709 28.4639 11.7192L30 13ZM18.896 26.3176L30 13L28.4639 11.7192L17.3599 25.0368L18.896 26.3176ZM15.9451 26.4504C16.7764 27.2825 18.1428 27.221 18.896 26.3176L17.3599 25.0368L15.9451 26.4504ZM10 20.5L15.9451 26.4504L17.3599 25.0368L11.4148 19.0864L10 20.5ZM10 20.5L11.4148 19.0864C10.6342 18.305 9.36782 18.3045 8.58642 19.0852L10 20.5ZM10 20.5H10L8.58642 19.0852C7.80502 19.8658 7.80445 21.1322 8.58515 21.9136L10 20.5ZM15.9451 26.4504L10 20.5L8.58515 21.9136L14.5302 27.864L15.9451 26.4504ZM18.896 26.3176C18.1428 27.221 16.7764 27.2825 15.9451 26.4504L14.5302 27.864C16.1929 29.5281 18.9257 29.4052 20.4321 27.5984L18.896 26.3176ZM30 13L18.896 26.3176L20.4321 27.5984L31.5361 14.2808L30 13Z"
        fill={colors.backgroundDark}
        mask="url(#path-1-inside-1_15566_18407)"
        strokeWidth={0}
      />
    </svg>
  )
}