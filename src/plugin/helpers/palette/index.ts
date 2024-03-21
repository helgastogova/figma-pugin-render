export type ColorType = string
export type RGBColorType = { r: number; g: number; b: number }

export const colorStylesWithThemes: ColorStylesType = {
  lightBackgroundForComponentsDemo____: '#E9E8E8',
  darkBackgroundForComponentsDemo____: '#251F1F',
}

export const colorStylesWithoutThemes: ColorStylesType = {
  lightBackgroundForComponentsDemo____: '#E9E8E8',
}

export interface ColorStylesType {
  [key: string]: ColorType
}
