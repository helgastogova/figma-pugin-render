type Paint = SolidPaint | GradientPaint | ImagePaint | VideoPaint

export function hexToRgb(hex: string | undefined): { r: number; g: number; b: number } {
  if (!hex) return { r: 0, g: 0, b: 0 }
  if (typeof hex === 'string') {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return { r: 0, g: 0, b: 0 }
    return figma.util.rgb(hex)
  } else if (typeof hex === 'object') {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex[0])) return { r: 0, g: 0, b: 0 }
    return figma.util.rgb(hex[0]) //TODO: fix gradients
  }
  return { r: 0, g: 0, b: 0 }
}

export function rgbToHex(rgb: RGB): string {
  if (!rgb) return ''
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16)
    return (hex.length === 1 ? '0' + hex : hex).toUpperCase()
  }

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

export async function createColorStyles(styles) {
  const existingStyles = figma.getLocalPaintStyles()

  styles.forEach(({ name, value, description }) => {
    const existingStyle = existingStyles.find((style) => style.name === name)

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

export function createPaints(color: string): Paint[] {
  if (typeof color === 'string') {
    return [{ type: 'SOLID', color: hexToRgb(color) }]
  }
  return [
    {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0.7],
      ],
      gradientStops: [
        { color: { ...hexToRgb(color[0]), a: 1 }, position: 0 },
        { color: { ...hexToRgb(color[1]), a: 1 }, position: 1 },
      ],
    },
  ]
}

export function hexColorMatch(style: PaintStyle, hex: string): boolean {
  const firstPaint = style.paints[0]

  if (firstPaint.type === 'SOLID') {
    return rgbToHex(firstPaint.color).toUpperCase() === hex.toUpperCase()
  }

  return false
}

export function findAndSetStyle(color?: string, element?: ComponentNode | RectangleNode | TextNode | FrameNode): void {
  if (!color || !element) return

  const style = figma.getLocalPaintStyles().find((style) => hexColorMatch(style, color))

  if (style) {
    element.fillStyleId = style.id
  } else {
    const fills: Paint[] = createPaints(color)
    element.fills = fills
  }
}

export function adjustColorBrightness(hex: string, percent: number): string {
  let { r, g, b } = hexToRgb(hex)

  r = Math.min(255, Math.max(0, r + (r * percent) / 100))
  g = Math.min(255, Math.max(0, g + (g * percent) / 100))
  b = Math.min(255, Math.max(0, b + (b * percent) / 100))

  return rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b) })
}
