import { generateVariables } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentSetsOnPage, getDemoPage } from './utils'
import { handleRendering } from './render'

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
      const demoPage = getDemoPage()
      demoPage.name = 'Component Sets [Demo]'
      figma.currentPage = demoPage

      await Promise.all([
        figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }),
        figma.loadFontAsync({ family: 'Roboto', style: 'Bold' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
        // TODO: Load other fonts user has used in their design system
      ])

      await handleRendering(demoPage, componentSets)
      await generateVariables(demoPage)

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
