import { getLocalStyles, ColorStyleData, TextStyleData, EffectStyleData } from './getLocalStyles'
import { renderTextStyles } from './components/text'
import { renderColorStyles } from './components/palette'
import { renderEffectStyles } from './components/effects'

export const generateVariables = async (page: PageNode): Promise<void> => {
  const stylesPromises = {
    colorStyles: getLocalStyles('color'),
    textStyles: getLocalStyles('text'),
    effectStyles: getLocalStyles('effect'),
    // gridStyles: getLocalStyles('grid'),
  }

  await Promise.all([
    stylesPromises.colorStyles,
    stylesPromises.textStyles,
    stylesPromises.effectStyles,
    // stylesPromises.gridStyles,
  ]).then(([colorStyles, textStyles, effectStyles]) => {
    renderColorStyles(colorStyles as ColorStyleData, page)
    renderTextStyles(textStyles as TextStyleData, page)
    renderEffectStyles(effectStyles as EffectStyleData, page)
    // renderGridStyles(gridStyles, page)
  })
}
