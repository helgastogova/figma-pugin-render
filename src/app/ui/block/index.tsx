import React, { forwardRef } from 'react'
import cx from 'classnames'
import s from './block.module.css'

type Spacing = '4' | '8' | '16' | '24' | '40' | '80'

type Props = {
  asChild?: boolean
  className?: string
  children?: React.ReactNode
  focusable?: boolean
  hoverable?: boolean
  inline?: boolean
  flex?: boolean
  flexNumber?: '1' | '0'
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  background?: 'primary' | 'secondary' | 'brand-dark' | 'inverse'
  border?: 'primary' | 'secondary'
  borderRadius?: '6' | '12' | '40' | 'full'
  marginX?: 'auto'
  marginY?: '0'
  marginLeft?: 'auto' | Spacing
  marginTop?: 'auto' | Spacing
  marginBottom?: 'auto' | Spacing
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  position?: 'relative' | 'absolute' | 'fixed'
  gap?: Spacing
  wrap?: 'wrap' | 'nowrap'
  padding?: Spacing
  paddingX?: Spacing
  paddingY?: Spacing
  role?: string
  style?: React.CSSProperties
} & (
  | { columns?: void; vertical?: void; horizontal?: true }
  | { columns?: void; vertical: true; horizontal?: void }
  | { columns: '1' | '2' | '3' | '4' | '5'; vertical?: void; horizontal?: void }
  | { columns?: void; vertical?: boolean; horizontal?: boolean }
) &
  ({ padding?: Spacing; paddingX?: void; paddingY?: void } | { padding?: void; paddingX?: Spacing; paddingY?: Spacing })

const Block = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      inline,
      flex,
      flexNumber,
      background,
      position,
      onClick,
      border,
      borderRadius,
      columns,
      vertical,
      horizontal,
      focusable,
      hoverable,
      onMouseEnter,
      onMouseLeave,
      align,
      justify,
      gap,
      marginX,
      marginY,
      marginLeft,
      marginTop,
      marginBottom,
      padding,
      paddingX,
      paddingY,
      wrap,
      style,
      role,
      ...props
    },
    ref,
  ) => {
    const Element: React.ElementType = 'div'
    const displayClass = () => {
      if (inline) return s.inline
      if (columns) return s.grid
      if (flex) return s.flex
      return s.block
    }

    return (
      <Element
        style={style}
        role={role}
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cx(
          s.root,
          className,
          displayClass(),
          {
            [s.vertical]: vertical,
            [s.horizontal]: horizontal,
            [s.focusable]: focusable,
            [s.hoverable]: hoverable,
            [s[`position-${position}`]]: position,
            [s[`align-${align}`]]: align,
            [s[`background-${background}`]]: background,
            [s[`border-${border}`]]: border,
            [s[`border-radius-${borderRadius}`]]: borderRadius,
            [s[`columns-${columns}`]]: columns, // eslint-disable-line
            [s[`gap-${gap}`]]: gap,
            [s[`justify-${justify}`]]: justify,
            [s[`margin-x-${marginX}`]]: marginX,
            [s[`margin-y-${marginY}`]]: marginY,
            [s[`margin-left-${marginLeft}`]]: marginLeft,
            [s[`margin-top-${marginTop}`]]: marginTop,
            [s[`margin-bottom-${marginBottom}`]]: marginBottom,
            [s[`padding-${padding}`]]: padding,
            [s[`padding-x-${paddingX}`]]: paddingX,
            [s[`padding-y-${paddingY}`]]: paddingY,
            [s[`wrap-${wrap}`]]: wrap,
            [s[`flex-number-${flexNumber}`]]: flexNumber,
          },
          className,
        )}
        {...props}
      />
    )
  },
)

Block.displayName = 'Block'

export default Block
