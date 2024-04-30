import { GlobalContext } from '@src/plugin/context'
type Paint = SolidPaint | GradientPaint | ImagePaint | VideoPaint

export function hexToRgbA(hex: string): { r: number; g: number; b: number; a?: number } {
  if (!hex) return { r: 0, g: 0, b: 0 }

  return hex.length < 7 ? figma.util.rgb(hex) : figma.util.rgba(hex)
}

const toHex = (value: number) => {
  const hex = Math.round(value * 255).toString(16)
  return (hex.length === 1 ? '0' + hex : hex).toUpperCase()
}

export type RGB = { r: number; g: number; b: number }
export type RGBA = { r: number; g: number; b: number; a: number }

export const isRgb = (value: unknown): value is RGB => {
  if (typeof value === 'object' && value !== null) {
    const val = value as { r: unknown; g: unknown; b: unknown }
    return typeof val.r === 'number' && typeof val.g === 'number' && typeof val.b === 'number'
  }
  return false
}

export const isRgba = (value: unknown): value is RGBA => {
  if (typeof value === 'object' && value !== null) {
    const val = value as { r: unknown; g: unknown; b: unknown; a: unknown }
    return (
      typeof val.r === 'number' && typeof val.g === 'number' && typeof val.b === 'number' && typeof val.a === 'number'
    )
  }
  return false
}

export function rgbToHex(value: RGB | RGBA): string | undefined {
  if (!isRgb(value)) return undefined

  if ('a' in value && value.a !== undefined && value.a < 1) {
    return `#${toHex(value.r)}${toHex(value.g)}${toHex(value.b)}${toHex(value.a)}`
  }

  return `#${toHex(value.r)}${toHex(value.g)}${toHex(value.b)}`
}

export async function createColorStyles(styles: PaintStyle[], existingStyles?: PaintStyle[]) {
  styles.forEach(({ name, value, description }) => {
    const existingStyle = existingStyles?.find((style) => style.name === name)

    if (!existingStyle) {
      const style = figma.createPaintStyle()
      style.name = name
      style.description = description
      style.paints = createPaints(value)
    } else {
      existingStyle.description = description
      existingStyle.paints = createPaints(value)
    }
  })
}

export function createPaints(color: string | string[]): Paint[] {
  if (typeof color === 'string') {
    const { r, g, b, a } = hexToRgbA(color)
    return [
      {
        type: 'SOLID',
        color: { r, g, b },
        opacity: a ?? 1,
      },
    ]
  } else if (Array.isArray(color) && color.length === 2) {
    const startColor = hexToRgbA(color[0])
    const endColor = hexToRgbA(color[1])

    return [
      {
        type: 'GRADIENT_LINEAR',
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0.7],
        ],
        gradientStops: [
          {
            color: { r: startColor.r, g: startColor.g, b: startColor.b, a: 'a' in startColor ? startColor.a : 1 },
            position: 0,
          },
          {
            color: { r: endColor.r, g: endColor.g, b: endColor.b, a: 'a' in endColor ? endColor.a : 1 },
            position: 1,
          },
        ],
      },
    ]
  }

  return []
}

export function hexColorMatch(style: PaintStyle, hex: string): boolean {
  const firstPaint = style.paints[0]

  if (firstPaint.type === 'SOLID') {
    return rgbToHex(firstPaint.color).toUpperCase() === hex.toUpperCase()
  }

  return false
}
export function findAndSetStyle(
  color?: string,
  element?: ComponentNode | RectangleNode | TextNode | FrameNode,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!color || !element) {
      resolve()
      return
    }

    const styles = GlobalContext.getPaintStyles() // почему то тут пусто
    const style = styles?.find((style) => hexColorMatch(style, color))

    if (style) {
      try {
        await element.setFillStyleIdAsync(style.id)
        resolve()
      } catch (error) {
        console.error('Failed to set fill style:', error)
        reject(error)
      } finally {
        resolve()
      }
    } else {
      const fills: Paint[] = createPaints(color)
      element.fills = fills
      resolve()
    }
  })
}

export function parseColor(color: string): RGB | RGBA {
  color = color.trim()
  const hexRegex = /^#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2}){0,1}$/
  const hexShorthandRegex = /^#([A-Fa-f0-9]{3})([A-Fa-f0-9]){0,1}$/

  if (hexRegex.test(color) || hexShorthandRegex.test(color)) {
    const hexValue = color.substring(1)
    const expandedHex =
      hexValue.length === 3 || hexValue.length === 4
        ? hexValue
            .split('')
            .map((char) => char + char)
            .join('')
        : hexValue

    const alphaValue = expandedHex.length === 8 ? expandedHex.slice(6, 8) : undefined

    return {
      r: parseInt(expandedHex.slice(0, 2), 16) / 255,
      g: parseInt(expandedHex.slice(2, 4), 16) / 255,
      b: parseInt(expandedHex.slice(4, 6), 16) / 255,
      ...(alphaValue ? { a: parseInt(alphaValue, 16) / 255 } : {}),
    }
  } else {
    throw new Error('Invalid color format')
  }
}
