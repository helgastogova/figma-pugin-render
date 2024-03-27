import { renderDemo } from './utils'
import { createColorStyles } from '../../helpers/colors'
import { createFrame } from '../../helpers'
import { colorStylesWithThemes, colorStylesWithoutThemes } from '../../helpers/palette'

export const handleRenderingComponentSets = async (demoPage: PageNode, componentSets: ComponentSetNode[]) => {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const tokensCollection = localCollections.find(
    (collection) => collection.name === 'Tokens' && !collection.hiddenFromPublishing,
  )

  const renderComponentSetsInBatches = async (
    componentSets: ComponentSetNode[],
    frame: FrameNode | PageNode,
    modeName: string,
  ) => {
    for (let i = 0; i < componentSets.length; i++) {
      await renderDemo({
        componentSet: componentSets[i],
        parentFrame: frame,
        backgroundColor: modeName === 'Dark' ? '#251F1F' : '#E9E8E8',
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  if (tokensCollection && tokensCollection.modes.length > 0) {
    createColorStyles(colorStylesWithThemes)
    for (const mode of tokensCollection.modes) {
      const frame = createFrame(
        {
          name: `${mode.name} Theme`,
          direction: 'VERTICAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          verticalPadding: 30,
          horizontalPadding: 30,
          borderRadius: 24,
        },
        demoPage,
        'right',
      )
      frame.setExplicitVariableModeForCollection(tokensCollection.id, mode.modeId)
      await renderComponentSetsInBatches(componentSets, frame, mode.name)
    }
  } else {
    createColorStyles(colorStylesWithoutThemes)
    const frame = createFrame(
      {
        name: 'Components Sets render',
        direction: 'VERTICAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        itemSpacing: 50,
        verticalPadding: 30,
        horizontalPadding: 30,
        borderRadius: 24,
      },
      demoPage,
      'right',
    )
    await renderComponentSetsInBatches(componentSets, frame, 'Light')
  }
}
