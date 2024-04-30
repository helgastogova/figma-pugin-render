import { renderPrimitives } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentsAndSets, getDemoPage, hasActiveSelection, loadFonts } from './utils'
import { renderShowcases } from './render/showcases'
import { renderTokens } from './render/primitives/tokens'

//TODO
// 1. titles with library colors
// 2. group blocks ??

figma.showUI(__html__, { width: 768, height: 500, title: 'Components documentation', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const userHasActiveSelection = hasActiveSelection()

  const { selectedComponents, selectedComponentsDataPartial, componentsList, componentsListPartial } =
    findAllComponentsAndSets()

  if (msg.type === 'request-components') {
    figma.ui.postMessage({
      data: {
        type: 'components',
        hasActiveSelection: userHasActiveSelection,
        componentsList: componentsListPartial,
        selectedComponents: selectedComponentsDataPartial,
      },
    })
  }

  if (msg.type === 'render-demo') {
    try {
      const {
        data: { selectedToRenderComponents, generatePrimitives, generateTokens, generateOnNewPage },
      } = msg

      let demoPage: PageNode

      if (generateOnNewPage) {
        demoPage = getDemoPage()
        figma.currentPage = demoPage
      } else {
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
          renderShowcases({
            page: generateOnNewPage ? demoPage : figma.currentPage,
            components: userHasActiveSelection
              ? selectedComponents.filter((component) => selectedToRenderComponents.some((i) => i.id === component.id))
              : componentsList.filter((component) => selectedToRenderComponents.some((i) => i.id === component.id)),
            renderOnPlace: !generateOnNewPage,
          }),
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
