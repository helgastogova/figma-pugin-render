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
      maxWidth: 260,
      minHeight: 140,
      borderRadius: 8,
    },
    frame,
  )

  effectWrapper.setEffectStyleIdAsync(style.id)
}

export const renderEffectStyles = async (effectStyles: EffectStyleData, page: PageNode): Promise<void> => {
  const styles = effectStyles.styles
  figma.currentPage = page

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

  page.appendChild(effectsFrame)
}

function createEffectFromStyle(effectStyle: EffectStyle): Effect[] {
  const effects: Effect[] = effectStyle.effects.map((effect) => {
    console.log('effect', effect, effect.type)
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
        throw new Error(`Unsupported effect type: ${effect?.type}`)
    }
  })

  return effects
}

function applyEffectToNode(node: SceneNode, effectStyle: EffectStyle): void {
  if ('effects' in node) {
    Object.assign(node.effects, createEffectFromStyle(effectStyle))
  }
  console.log('node', node.effects)
}
