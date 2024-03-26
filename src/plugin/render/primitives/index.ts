import { getLocalStyles, ColorStyleData, TextStyleData, EffectStyleData } from './getLocalStyles'
import { renderTextStyles } from './components/text'
import { renderColorStyles } from './components/palette'
import { renderEffectStyles } from './components/effects'
import { getCollections } from './getLocalStyles'

import { createFrame } from '../../helpers'

export const generateVariables = async (page: PageNode): Promise<void> => {
  const frame = createFrame(
    {
      name: 'Primitives / Variables',
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      verticalPadding: 30,
      horizontalPadding: 30,
      borderRadius: 24,
    },
    page,
    'right',
  )
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
    renderColorStyles(colorStyles as ColorStyleData, frame)
    renderTextStyles(textStyles as TextStyleData, frame)
    renderEffectStyles(effectStyles as EffectStyleData, frame)
    // renderGridStyles(gridStyles, frame)
  })

  const collections = await getCollections()

  console.log('Variables generated', collections)
}
