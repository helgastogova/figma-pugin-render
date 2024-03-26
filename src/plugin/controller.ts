import { renderDemo } from './render'
import { createFrame } from './helpers'
import { createColorStyles } from './helpers/colors'
import { colorStylesWithThemes, colorStylesWithoutThemes } from './helpers/palette'
import { generateVariables } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentSetsOnPage, getDemoPage } from './utils'

figma.showUI(__html__, { width: 900, height: 450, title: 'Render Components Sets Demo', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const componentSets = findAllComponentSetsOnPage()

  const componentSetsDataPartial = componentSets.map((componentSet) => {
    return {
      id: componentSet.id,
      name: componentSet.name,
      numberOfComponents: componentSet.children.length,
    }
  })

  if (msg.type === 'request-components') {
    figma.ui.postMessage({ data: { type: 'components', componentSets: componentSetsDataPartial } })
  }

  if (msg.type === 'render-demo') {
    try {
      await Promise.all([
        figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }),
        figma.loadFontAsync({ family: 'Roboto', style: 'Bold' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
        // TODO: Load other fonts user has used in their design system
      ])

      const demoPage = getDemoPage()
      demoPage.name = 'Component Sets [Demo]'
      figma.currentPage = demoPage
      ;(async () => {
        await generateVariables(demoPage)
      })()

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
        await renderComponentSetsInBatches(componentSets, demoPage, 'Light')
      }

      figma.closePlugin('Demo rendered successfully.')
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
      console.error(error)
    }
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
