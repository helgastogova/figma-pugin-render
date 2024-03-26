import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { EffectStyleData } from '../../../helpers/scripts/getLocalStyles'

interface CreateEffectProps {
  style: EffectStyle
  frame: FrameNode | PageNode
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
    },
    frame,
  )

  console.log('style', style, style.effects)

  const myEffectStyle: EffectStyle = figma.getStyleById('someEffectStyleId') as EffectStyle

  const effectBlock = figma.createRectangle()
  effectBlock.resize(260, 140)
  effectBlock.cornerRadius = 4

  applyEffectToNode(effectWrapper, myEffectStyle)

  effectWrapper.appendChild(effectBlock)
}

export const renderEffectStyles = async (effectStyles: EffectStyleData, page: PageNode): Promise<void> => {
  const styles = effectStyles.styles
  figma.currentPage = page

  console.log('we are working with', effectStyles)

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
    page,
  )

  const caption = getDemoTitle('Effects')
  effectsFrame.appendChild(caption)

  const effectFrame = createFrame(
    {
      name: 'Demo / Effects',
      direction: 'HORIZONTAL',
      wrap: 'WRAP',
      maxWidth: 1364,
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      itemSpacing: 16,
    },
    effectsFrame,
  )

  styles.forEach((style) => {
    createEffect({ style, frame: effectFrame })
  })

  page.appendChild(effectsFrame)
}

function createEffectFromStyle(effectStyle: EffectStyle): Effect[] {
  const effects: Effect[] = effectStyle.effects.map((effect) => {
    switch (effect.type) {
      case 'DROP_SHADOW':
      case 'INNER_SHADOW':
        return {
          type: effect.type,
          color: effect.color,
          offset: effect.offset,
          radius: effect.radius,
          spread: effect.spread || 0,
          visible: effect.visible,
        }
      case 'LAYER_BLUR':
      case 'BACKGROUND_BLUR':
        return {
          type: effect.type,
          radius: effect.radius,
          visible: effect.visible,
        }
      default:
        throw new Error(`Unsupported effect type: ${effect.type}`)
    }
  })

  return effects
}

function applyEffectToNode(node: SceneNode, effectStyle: EffectStyle): void {
  if ('effects' in node) {
    node.effects = createEffectFromStyle(effectStyle)
  }
}
