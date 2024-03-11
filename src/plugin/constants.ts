export type LayoutsProps = {
  layoutMode: 'HORIZONTAL' | 'VERTICAL'
  primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
  counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
  primaryAxisSizingMode: 'FIXED' | 'AUTO'
  counterAxisSizingMode: 'AUTO' | 'MIN' | 'CENTER' | 'MAX' | 'STRETCH'
  itemSpacing: number
  horizontalPadding: number
  verticalPadding: number
  cornerRadius: number
  maxWidth: number | null
  maxHeight: number | null
  minWidth: number | null
  minHeight: number | null
  layoutGrow: number
  layoutAlign: 'STRETCH' | 'INHERIT'
  layoutWrap: 'NO_WRAP' | 'WRAP'
}

export const DEFAULT_LAYOUT_SETTINGS: LayoutsProps = {
  layoutMode: 'HORIZONTAL', //direction
  layoutWrap: 'NO_WRAP', //wrap
  primaryAxisAlignItems: 'CENTER', //horizontalAlign
  counterAxisAlignItems: 'CENTER', //verticalAlign
  primaryAxisSizingMode: 'AUTO', //autoWidth
  counterAxisSizingMode: 'AUTO', //autoHeight
  cornerRadius: 0, //borderRadius
  itemSpacing: 0, //itemSpacing
  horizontalPadding: 0, //horizontalPadding
  verticalPadding: 0, //verticalPadding
  maxWidth: null, //maxWidth
  maxHeight: null, //maxHeight
  minWidth: null, //minWidth
  minHeight: null, //minHeight
  layoutGrow: 0, //layoutGrow
  layoutAlign: 'INHERIT', //layoutAlign
}
