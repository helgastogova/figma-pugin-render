import { renderDemo } from './utils'
import { createColorStyles } from '../../helpers/colors'
import { createFrame } from '../../helpers'
import { colorStylesWithThemes, colorStylesWithoutThemes } from '../../helpers/palette'

export const renderShowcases = async ({
  page: demoPage,
  components,
  renderOnPlace,
}: {
  page: PageNode
  components: ComponentSetNode[] | ComponentNode[]
  renderOnPlace?: boolean
}) => {
  //defaultVariant
  //description
  //Link
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const tokensCollection = localCollections.find(
    (collection) => collection.name === 'Tokens' && !collection.hiddenFromPublishing,
  )

  const renderComponentsInBatches = async (
    components: ComponentSetNode[] | ComponentNode[],
    frame: FrameNode | PageNode,
    modeName: string,
  ) => {
    for (let i = 0; i < components.length; i++) {
      await renderDemo({
        demoPage,
        component: components[i],
        parentFrame: frame,
        backgroundColor: modeName === 'Dark' ? '#251F1F' : '#E9E8E8',
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  if (tokensCollection && tokensCollection.modes.length > 0) {
    createColorStyles(colorStylesWithThemes)

    let renderOnPlaceFrame

    if (renderOnPlace) {
      renderOnPlaceFrame = createFrame(
        {
          name:
            components.length < 2
              ? `Showcase render ${components[0]?.name ?? ''}`
              : `Showcase render for ${components.length} components`,
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
        'center',
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
        renderOnPlace ? renderOnPlaceFrame : demoPage,
        'right',
      )
      frame.setExplicitVariableModeForCollection(tokensCollection.id, mode.modeId) //TODO:  but that the one we have for setting the mode
      await renderComponentsInBatches(components, frame, mode.name)
    }
  } else {
    createColorStyles(colorStylesWithoutThemes)
    const frame = createFrame(
      {
        name: 'Showcase render',
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
    await renderComponentsInBatches(components, frame, 'Light')
  }
}
