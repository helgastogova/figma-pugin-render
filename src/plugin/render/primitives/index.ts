import { getLocalStyles, ColorStyleData, TextStyleData, EffectStyleData } from './getLocalStyles'
import { renderTextStyles } from './components/text'
import { renderColorStyles } from './components/palette'
import { renderEffectStyles } from './components/effects'

import { createFrame } from '../../helpers'

export const generateVariables = async (page: PageNode): Promise<void> => {
  const frame = createFrame(
    {
      name: 'Primitives / Variables',
      direction: 'HORIZONTAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      verticalPadding: 30,
      horizontalPadding: 30,
      borderRadius: 24,
      backgroundColor: '#ffffff',
    },
    page,
    'right',
  )
  const stylesPromises = {
    colorStyles: getLocalStyles('color'),
    textStyles: getLocalStyles('text'),
    effectStyles: getLocalStyles('effect'),
  }

  await Promise.all([stylesPromises.colorStyles, stylesPromises.textStyles, stylesPromises.effectStyles]).then(
    ([colorStyles, textStyles, effectStyles]) => {
      colorStyles.styles.length && renderColorStyles(colorStyles as ColorStyleData, frame)
      textStyles.styles.length && renderTextStyles(textStyles as TextStyleData, frame)
      effectStyles.styles.length && renderEffectStyles(effectStyles as EffectStyleData, frame)
    },
  )
}
