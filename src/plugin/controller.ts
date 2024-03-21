import { renderDemo } from './render'
import { createFrame } from './helpers'

/*
TODO: 
1. vars for bgs 
2. show typo
3. show local vars
4. show takens
6. show components (Icons?)
*/

figma.showUI(__html__, { width: 900, height: 450, title: 'Render Components Sets Demo', themeColors: false })

interface CreateUIMessage {
  type: 'render-demo' | 'cancel' | 'request-user-info' | 'request-components'
  message: string
}

const findAllComponentSetsOnPage = (): ComponentSetNode[] => {
  return figma.root.findAll((node) => node.type === 'COMPONENT_SET') as ComponentSetNode[]
}

figma.ui.onmessage = async (msg: CreateUIMessage) => {
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
      ])

      const demoPage =
        (figma.root.findOne((node) => node.name === 'Component Sets [Demo]') as PageNode) ?? figma.createPage()
      demoPage.name = 'Component Sets [Demo]'
      figma.currentPage = demoPage

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
            backgroundColor: modeName === 'Dark' ? '#000' : '#fff',
          })
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      if (tokensCollection && tokensCollection.modes.length > 0) {
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
              backgroundColor: mode.name === 'Dark' ? '#000' : '#fff', // Примерное применение переменной для фона
            },
            demoPage,
            'right',
          )
          frame.setExplicitVariableModeForCollection(tokensCollection.id, mode.modeId)
          await renderComponentSetsInBatches(componentSets, frame, mode.name)
        }
      } else {
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
