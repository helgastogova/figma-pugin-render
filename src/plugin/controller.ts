import { generateVariables } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentSetsOnPage, getDemoPage } from './utils'
import { handleRendering } from './render/componentSets'
import { generateTokens } from './render/primitives/tokens'

figma.showUI(__html__, { width: 400, height: 450, title: 'Render Components Sets Demo', themeColors: false })

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
      ]).catch((error) => {
        figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
        console.error(error)
      })

      //await generateTokens(demoPage)

      await Promise.all([handleRendering(demoPage, componentSets)])
        .catch((error) => {
          figma.ui.postMessage({ type: 'error', message: 'Failed to render demo' })
          console.error(error)
          throw error
        })
        .then(async () => {
          await generateTokens(demoPage)
          await generateVariables(demoPage)
          figma.ui.postMessage({ type: 'success', message: 'Demo rendered successfully.' })
        })
        .catch((error) => {
          console.error('Error during post-rendering:', error)
        })
      figma.closePlugin()
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
      console.error(error)
    }

    figma.closePlugin()
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
