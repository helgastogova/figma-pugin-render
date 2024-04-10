import { generateVariables } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentSetsOnPage, getDemoPage } from './utils'
import { handleRenderingComponentSets } from './render/componentSets'
import { generateTokens } from './render/primitives/tokens'

figma.showUI(__html__, { width: 400, height: 450, title: 'Showcase render', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const { componentSets, standaloneComponentSets } = findAllComponentSetsOnPage()

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

      figma.currentPage = demoPage

      const textStyles = figma.getLocalTextStyles()
      const uniqueFontNames = new Set(textStyles.map((style) => style.fontName))

      await Promise.allSettled([
        ...Array.from(uniqueFontNames)
          .filter((fontName) => fontName)
          .map((fontName) =>
            figma
              .loadFontAsync(fontName)
              .catch((error) => console.error(`Failed to load font ${fontName.family} ${fontName.style}:`, error)),
          ),
        figma
          .loadFontAsync({ family: 'Roboto', style: 'Regular' })
          .catch((error) => console.error('Failed to load font Roboto Regular:', error)),
        figma
          .loadFontAsync({ family: 'Roboto', style: 'Bold' })
          .catch((error) => console.error('Failed to load font Roboto Bold:', error)),
        figma
          .loadFontAsync({ family: 'Inter', style: 'Regular' })
          .catch((error) => console.error('Failed to load font Inter Regular:', error)),
      ])

      await Promise.all([
        handleRenderingComponentSets(demoPage, [...componentSets, ...(standaloneComponentSets as any)]),
        //handleRenderingComponentSets(demoPage, []),
      ])
        .catch((error) => {
          figma.ui.postMessage({ type: 'error', message: 'Failed to render demo' })
          console.error(error)
          throw error
        })
        .then(async () => {
          await generateVariables(demoPage)
          await generateTokens(demoPage)
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
