import { renderDemo } from './utils'
import { createColorStyles } from '../../helpers/colors'
import { createFrame } from '../../helpers'
import { colorStylesWithThemes, colorStylesWithoutThemes } from '../../helpers/palette'

export const handleRenderingComponentSets = async (
  demoPage: PageNode,
  componentSets: ComponentSetNode[],
  renderArea?: 'center',
) => {
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
        demoPage,
        componentSet: componentSets[i],
        parentFrame: frame,
        backgroundColor: modeName === 'Dark' ? '#251F1F' : '#E9E8E8',
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  if (tokensCollection && tokensCollection.modes.length > 0) {
    createColorStyles(colorStylesWithThemes)
    let renderOnPlaceFrame

    if (renderArea === 'center') {
      renderOnPlaceFrame = createFrame(
        {
          name: 'Showcase render',
          direction: 'HORIZONTAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          verticalPadding: 30,
          horizontalPadding: 30,
          borderRadius: 24,
        },
        demoPage,
        'right',
        renderArea,
      )
    }
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
        renderArea === 'center' ? renderOnPlaceFrame : demoPage,
        'right',
      )
      frame.setExplicitVariableModeForCollection(tokensCollection.id, mode.modeId) //TODO:  but that the one we have for setting the mode
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
