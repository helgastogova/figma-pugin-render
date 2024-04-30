import { rgbToHex } from '@src/plugin/helpers/colors'

export interface ColorStylesType {
  name: string
  value: string
  description: string
}

export const colorStylesWithThemes_: ColorStylesType[] = [
  {
    name: '_DemoPage-lightBackgroundForComponentsDemo',
    value: '#E9E8E8',
    description: 'Used as a light background for component demos. Do not use in main design.',
  },
  {
    name: '_DemoPage-darkBackgroundForComponentsDemo',
    value: '#251F1F',
    description: 'Used as a dark background for component demos. Do not use in main design.',
  },
]

export const colorStylesWithoutThemes_: ColorStylesType[] = [
  {
    name: '_DemoPage-lightBackgroundForComponentsDemo',
    value: '#E9E8E8',
    description: 'Used as a light background for component demos. Do not use in main design.',
  },
]

export function preprocessColorStyles(
  existingStyles: PaintStyle[] | null,
  styles: ColorStylesType[],
): ColorStylesType[] {
  return styles.map((style) => {
    const existingStyle = existingStyles?.find((s) => s.name === style.name)

    if (existingStyle) {
      const currentColor = existingStyle.paints[0] as SolidPaint
      style.value = rgbToHex(currentColor.color)
    }

    return style
  })
}
