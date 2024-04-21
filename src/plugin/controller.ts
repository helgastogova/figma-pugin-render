import { generateVariables } from './render/primitives'
import { CreateUIMessageType } from './types'
import { findAllComponentsAndSets, getDemoPage, hasActiveSelection } from './utils'
import { handleRenderingComponentSets } from './render/showcases'
import { generateTokens } from './render/primitives/tokens'

import { renderAI } from './ai/ai-render'
//TODO

// 1. titles with library colors
// 2. group block

async function loadFonts(fontNames: FontName[]) {
  const loadPromises = fontNames.map((fontName) =>
    figma.loadFontAsync(fontName).catch((error) => {
      console.error(`Error loading font ${fontName.family} ${fontName.style}:`, error)
    }),
  )
  await Promise.all(loadPromises)
}

figma.showUI(__html__, { width: 400, height: 450, title: 'Showcase render', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const { selectedComponents, componentSets, standaloneComponentSets } = findAllComponentsAndSets()

  const componentSetsDataPartial = componentSets.map((componentSet) => {
    return {
      id: componentSet.id,
      name: componentSet.name,
      numberOfComponents: componentSet.children.length,
    }
  })

  const selectedComponentsDataPartial = selectedComponents.map((component) => {
    return {
      id: component.id,
      name: component.name,
      numberOfComponents: component.children.length,
    }
  })

  const standaloneComponentSetsDataPartial = standaloneComponentSets.map((componentSet) => {
    return {
      id: componentSet.id,
      name: componentSet.name,
      numberOfComponents: componentSet.children.length,
    }
  })

  if (msg.type === 'request-components') {
    figma.ui.postMessage({
      data: {
        type: 'components',
        hasActiveSelection: hasActiveSelection(),
        componentSets: componentSetsDataPartial,
        selectedComponents: selectedComponentsDataPartial,
        standaloneComponentSets: standaloneComponentSetsDataPartial,
      },
    })
  }

  if (msg.type === 'render-demo') {
    try {
      let demoPage
      if (!hasActiveSelection()) {
        demoPage = getDemoPage()
        figma.currentPage = demoPage
      } else {
        demoPage = figma.currentPage
      }

      try {
        const textStyles = figma.getLocalTextStyles()
        const fontNames = textStyles.map((style) => style.fontName).filter((fontName) => fontName) as FontName[]

        fontNames.push(
          { family: 'Roboto', style: 'Regular' },
          { family: 'Roboto', style: 'Bold' },
          { family: 'Inter', style: 'Regular' },
        )

        await loadFonts(fontNames)

        const renderOnlySelectedComponents = hasActiveSelection()

        await Promise.all([
          renderAI(demoPage),
          // handleRenderingComponentSets({
          //   page: renderOnlySelectedComponents ? figma.currentPage : demoPage,
          //   componentSets: renderOnlySelectedComponents
          //     ? selectedComponents
          //     : [...componentSets, ...(standaloneComponentSets as any)],
          //   renderOnlySelectedComponents,
          // }),
          // console.log('handleRenderingComponentSets'),
        ])
          .catch((error) => {
            figma.ui.postMessage({ type: 'error', message: 'Failed to render demo' })
            console.error(error)
            throw error
          })
          .then(async () => {
            return
            if (selectedComponents.length) return

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
    } catch (error) {
      console.error('Failed to load some fonts:', error)
      figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
    }
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
