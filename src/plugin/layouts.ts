import { DEFAULT_LAYOUT_SETTINGS } from './constants'

export type LayoutsProps = {
  name?: string
  direction?: 'HORIZONTAL' | 'VERTICAL'
  horizontalAlign?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
  verticalAlign?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
  wrap?: 'NO_WRAP' | 'WRAP'
  autoWidth?: boolean // do not use layoutAlign: 'STRETCH' if true
  autoHeight?: boolean
  borderRadius?: number
  horizontalPadding?: number
  verticalPadding?: number
  itemSpacing?: number
  maxWidth?: number | null
  maxHeight?: number | null
  minWidth?: number | null
  minHeight?: number | null
  layoutGrow?: number
  layoutAlign?: 'STRETCH' | 'INHERIT'
  strokes?: [
    {
      type: 'SOLID'
      color?: {
        r: number
        g: number
        b: number
      }
    },
  ]
  backgroundColor?: string
}

export const getLayoutProps = ({
  name = '',
  direction = DEFAULT_LAYOUT_SETTINGS.layoutMode,
  horizontalAlign = DEFAULT_LAYOUT_SETTINGS.primaryAxisAlignItems,
  verticalAlign = DEFAULT_LAYOUT_SETTINGS.counterAxisAlignItems,
  wrap = DEFAULT_LAYOUT_SETTINGS.layoutWrap,
  autoWidth = DEFAULT_LAYOUT_SETTINGS.primaryAxisSizingMode === 'AUTO',
  autoHeight = DEFAULT_LAYOUT_SETTINGS.counterAxisSizingMode === 'AUTO',
  borderRadius = DEFAULT_LAYOUT_SETTINGS.cornerRadius,
  horizontalPadding = DEFAULT_LAYOUT_SETTINGS.horizontalPadding,
  verticalPadding = DEFAULT_LAYOUT_SETTINGS.verticalPadding,
  itemSpacing = DEFAULT_LAYOUT_SETTINGS.itemSpacing,
  maxWidth = DEFAULT_LAYOUT_SETTINGS.maxWidth,
  maxHeight = DEFAULT_LAYOUT_SETTINGS.maxHeight,
  minWidth = DEFAULT_LAYOUT_SETTINGS.minWidth,
  minHeight = DEFAULT_LAYOUT_SETTINGS.minHeight,
  layoutGrow = DEFAULT_LAYOUT_SETTINGS.layoutGrow,
  layoutAlign = DEFAULT_LAYOUT_SETTINGS.layoutAlign,
}: LayoutsProps) => {
  return {
    name,
    layoutMode: wrap === 'WRAP' ? 'HORIZONTAL' : direction,
    layoutWrap: wrap,
    primaryAxisAlignItems: horizontalAlign,
    counterAxisAlignItems: verticalAlign,
    primaryAxisSizingMode: autoWidth ? 'AUTO' : 'FIXED',
    counterAxisSizingMode: autoHeight ? 'AUTO' : 'FIXED',
    cornerRadius: borderRadius,
    horizontalPadding,
    verticalPadding,
    itemSpacing,
    maxWidth: maxWidth !== undefined ? maxWidth : null,
    maxHeight: maxHeight !== undefined ? maxHeight : null,
    minWidth: minWidth !== undefined ? minWidth : null,
    minHeight: minHeight !== undefined ? minHeight : null,
    layoutGrow,
    layoutAlign,
  }
}
