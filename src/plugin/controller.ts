import { CreateUIMessageType } from './types'
import { findAllComponentsAndSets, getDemoPage, hasActiveSelection, loadFonts } from './utils'
import { renderShowcases } from './render/showcases'
import { GlobalContext } from './context'

//TODO
// 1. titles with library colors
// 2. group blocks ??

figma.showUI(__html__, { width: 768, height: 500, title: 'Components documentation', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  try {
    const loadedPaintStyles = await figma.getLocalPaintStylesAsync()
    GlobalContext.setPaintStyles(loadedPaintStyles)
  } catch (error) {
    console.error('Error loading paint styles:', error)
  }
  const userHasActiveSelection = hasActiveSelection()

  const { selectedComponents, selectedComponentsDataPartial, componentsList, componentsListPartial } =
    await findAllComponentsAndSets()

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
        data: { selectedToRenderComponents, generateOnNewPage },
      } = msg

      let demoPage: PageNode

      if (generateOnNewPage) {
        demoPage = await getDemoPage()
        await figma.setCurrentPageAsync(demoPage)
      } else {
        demoPage = figma.currentPage
      }

      try {
        // dealing with fonts
        const textStyles = await figma.getLocalTextStylesAsync()
        const fontNames = textStyles.map((style) => style.fontName).filter((fontName) => fontName) as FontName[]
        fontNames.push(
          { family: 'Roboto', style: 'Regular' },
          { family: 'Roboto', style: 'Bold' },
          { family: 'Inter', style: 'Regular' },
        )
        await loadFonts(fontNames)

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
