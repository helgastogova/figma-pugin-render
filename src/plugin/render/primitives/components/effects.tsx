import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { EffectStyleData } from '../getLocalStyles'

interface CreateEffectProps {
  style: EffectStyle
  frame: FrameNode
}

const createEffect = ({ style, frame }: CreateEffectProps): void => {
  const effectWrapper = createFrame(
    {
      name: `Effect / ${style.name} `,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 8,
      verticalPadding: 8,
      maxWidth: 260,
      minHeight: 140,
      borderRadius: 8,
    },
    frame,
  )

  effectWrapper.setEffectStyleIdAsync(style.id)

  const textWrapper = createFrame(
    {
      name: `Effect: ${style.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      borderRadius: 6,
      verticalPadding: 8,
      horizontalPadding: 16,
      backgroundColor: '#ffffff',
      itemSpacing: 8,
    },
    effectWrapper,
  )

  textWrapper.appendChild(
    createText({
      characters: style.name,
      fontSize: 18,
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )
}

export const renderEffectStyles = async (effectStyles: EffectStyleData, frame: FrameNode): Promise<void> => {
  const styles = effectStyles.styles

  const effectsFrame = createFrame(
    {
      name: 'Demo / Effects',
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      verticalPadding: 32,
      horizontalPadding: 32,
      borderRadius: 8,
    },
    frame,
  )

  const caption = getDemoTitle('Effects')
  effectsFrame.appendChild(caption)

  const showCase = createFrame(
    {
      name: 'Demo / Effects',
      direction: 'HORIZONTAL',
      wrap: 'WRAP',
      maxWidth: 1364,
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      itemSpacing: 40,
    },
    effectsFrame,
  )

  styles.forEach((style) => {
    createEffect({ style, frame: showCase })
  })
}
