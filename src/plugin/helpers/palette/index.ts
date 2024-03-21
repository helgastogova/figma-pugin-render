export type ColorType = string
export type RGBColorType = { r: number; g: number; b: number }

export const colorStylesWithThemes: ColorStylesType[] = [
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

export const colorStylesWithoutThemes: ColorStylesType[] = [
  {
    name: '_DemoPage-lightBackgroundForComponentsDemo',
    value: '#E9E8E8',
    description: 'Used as a light background for component demos. Do not use in main design.',
  },
]

export interface ColorStylesType {
  name: string
  value: string
  description: string
}
