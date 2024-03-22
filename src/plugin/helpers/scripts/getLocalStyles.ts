import { isPublished } from './isPublished'
import { assembleStylesArray } from './assembleStylesArray'

type BaseStyle = PaintStyle | TextStyle | EffectStyle
type StyleData = {
  type: 'color' | 'text' | 'effect'
  styles: BaseStyle[]
  publishedStatus: string
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

export async function getLocalStyles(type: 'color' | 'text' | 'effect'): Promise<StyleData> {
  const styles = await getStylesByType(type)
  const cleanedStyleData = assembleStylesArray(styles)
  const publishedStatus = await isPublished(cleanedStyleData)

  return {
    type,
    styles: cleanedStyleData,
    publishedStatus,
  }
}
