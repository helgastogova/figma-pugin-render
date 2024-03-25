import { isPublished } from './isPublished'
import { assembleStylesArray } from './assembleStylesArray'

export type StyleData = {
  publishedStatus: string
}

export type ColorStyleData = StyleData & {
  type: 'color'
  styles: PaintStyle[]
}

export type TextStyleData = StyleData & {
  type: 'text'
  styles: TextStyle[]
}

export type EffectStyleData = StyleData & {
  type: 'effect'
  styles: EffectStyle[]
}

async function getStylesByType(type: 'color' | 'text' | 'effect'): Promise<BaseStyle[]> {
  const styleMethods = {
    color: figma.getLocalPaintStyles,
    text: figma.getLocalTextStyles,
    effect: figma.getLocalEffectStyles,
  }
  const styles = styleMethods[type]()
  return styles.length > 0 ? styles : []
}

export async function getLocalStyles(
  type: 'color' | 'text' | 'effect',
): Promise<ColorStyleData | TextStyleData | EffectStyleData> {
  const styles = await getStylesByType(type)
  const cleanedStyleData = assembleStylesArray(styles)
  const publishedStatus = await isPublished(cleanedStyleData)

  return {
    type,
    styles: cleanedStyleData,
    publishedStatus,
  }
}
