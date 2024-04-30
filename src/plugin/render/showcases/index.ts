import { renderDemo } from './utils'
import { createColorStyles } from '@src/plugin/helpers/colors'
import { createFrame } from '@src/plugin/helpers'
import { colorStylesWithThemes_, colorStylesWithoutThemes_, preprocessColorStyles } from '@src/plugin/helpers/palette'
import { GlobalContext } from '@src/plugin/context'

export const renderShowcases = async ({
  page: demoPage,
  components,
  renderOnPlace,
}: {
  page: PageNode
  components: Array<ComponentNode | ComponentSetNode>
  renderOnPlace?: boolean
}) => {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const tokensCollection = localCollections.find((collection) => !collection.hiddenFromPublishing)

  const existingStyles = GlobalContext.getPaintStyles()

  const colorStylesWithThemes = preprocessColorStyles(existingStyles, colorStylesWithThemes_)
  const colorStylesWithoutThemes = preprocessColorStyles(existingStyles, colorStylesWithoutThemes_)
  createColorStyles(
    tokensCollection?.modes.length > 0 ? colorStylesWithThemes : colorStylesWithoutThemes,
    existingStyles,
  )

  try {
    const loadedPaintStyles = await figma.getLocalPaintStylesAsync()
    GlobalContext.setPaintStyles(loadedPaintStyles)
  } catch (error) {
    console.error('Error loading paint styles:', error)
  }

  const renderComponentsInBatches = async (
    components: Array<ComponentNode | ComponentSetNode>,
    frame: FrameNode | PageNode,
    modeName: string,
  ) => {
    for (let i = 0; i < components.length; i++) {
      await renderDemo({
        demoPage,
        component: components[i],
        parentFrame: frame,
        backgroundColor: modeName === 'Dark' ? colorStylesWithThemes[1].value : colorStylesWithThemes[0].value,
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  if (tokensCollection?.modes.length > 0) {
    let renderOnPlaceFrame

    if (renderOnPlace) {
      renderOnPlaceFrame = createFrame(
        {
          name:
            components.length < 2
              ? `${components[0]?.name ?? ''} documentation`
              : `documentation for ${components.length} components`,
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
      frame.setExplicitVariableModeForCollection(tokensCollection, mode.modeId)

      await renderComponentsInBatches(components, frame, mode.name)
    }
  } else {
    const frame = createFrame(
      {
        name: 'Documentation',
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
