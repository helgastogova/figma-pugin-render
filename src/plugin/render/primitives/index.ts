import { getLocalStyles, ColorStyleData, TextStyleData } from '../../helpers/scripts/getLocalStyles'
import { renderTextStyles } from './components/text'
import { renderColorStyles } from './components/palette'

export const generateVariables = async (page: PageNode): Promise<void> => {
  const stylesPromises = {
    colorStyles: getLocalStyles('color'),
    textStyles: getLocalStyles('text'),
    effectStyles: getLocalStyles('effect'),
  }

  await Promise.all([stylesPromises.colorStyles, stylesPromises.textStyles, stylesPromises.effectStyles]).then(
    ([colorStyles, textStyles, effectStyles]) => {
      console.log(colorStyles, textStyles, effectStyles)
      renderColorStyles(colorStyles as ColorStyleData, page)
      renderTextStyles(textStyles as TextStyleData, page)
      // renderEffectStyles(effectStyles, page)
    },
  )
}
