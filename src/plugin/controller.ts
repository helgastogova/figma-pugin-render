import { renderPrimitives } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentsAndSets, getDemoPage, hasActiveSelection, loadFonts } from './utils'
import { handleRenderingComponentSets } from './render/showcases'
import { renderTokens } from './render/primitives/tokens'

// import { renderAI } from './ai/ai-render'
//TODO

// 1. titles with library colors
// 2. group block
// забирать цвет если изменили

figma.showUI(__html__, { width: 768, height: 500, title: 'Showcase render', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const userHasActiveSelection = hasActiveSelection()

  const {
    selectedComponents,
    selectedComponentsDataPartial,
    componentSets,
    componentSetsDataPartial,
    standaloneComponentSets,
    standaloneComponentSetsDataPartial,
  } = findAllComponentsAndSets()

  if (msg.type === 'request-components') {
    figma.ui.postMessage({
      data: {
        type: 'components',
        hasActiveSelection: userHasActiveSelection,
        componentSets: componentSetsDataPartial,
        selectedComponents: selectedComponentsDataPartial,
        standaloneComponentSets: standaloneComponentSetsDataPartial,
      },
    })
  }

  if (msg.type === 'render-demo') {
    try {
      console.log('msg', msg)
      // components, that user selected to render from the list in the plugin
      const {
        data: { selectedToRenderComponents, generatePrimitives, generateTokens, generateOnNewPage },
      } = msg

      // lets determine what page we need to render on

      let demoPage: PageNode

      if (generateOnNewPage) {
        // if user wants to generate on a new page, we will create a new page
        demoPage = getDemoPage()
        figma.currentPage = demoPage
      } else {
        // if user wants to generate on the current page, we will use the current page
        demoPage = figma.currentPage
      }

      try {
        // dealing with fonts
        const textStyles = figma.getLocalTextStyles()
        const fontNames = textStyles.map((style) => style.fontName).filter((fontName) => fontName) as FontName[]
        fontNames.push(
          { family: 'Roboto', style: 'Regular' },
          { family: 'Roboto', style: 'Bold' },
          { family: 'Inter', style: 'Regular' },
        )
        await loadFonts(fontNames)
        // dealing with fonts

        await Promise.all([
          // renderAI(demoPage),
          handleRenderingComponentSets({
            page: generateOnNewPage ? demoPage : figma.currentPage,
            componentSets: userHasActiveSelection
              ? selectedComponents.filter((component) => selectedToRenderComponents.some((i) => i.id === component.id))
              : [...componentSets, ...(standaloneComponentSets as any)].filter((component) =>
                  selectedToRenderComponents.some((i) => i.id === component.id),
                ),
            renderOnPlace: !generateOnNewPage,
          }),
          // console.log('handleRenderingComponentSets'),
        ])
          .catch((error) => {
            figma.ui.postMessage({ type: 'error', message: 'Failed to render demo' })
            console.error(error)
            throw error
          })
          .then(async () => {
            if (generatePrimitives) await renderPrimitives(demoPage)
            if (generateTokens) await renderTokens(demoPage)
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
    } catch (error) {
      console.error('Failed to load some fonts:', error)
      figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
    }
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
