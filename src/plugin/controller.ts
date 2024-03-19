import { renderDemo } from './render'

figma.showUI(__html__, { width: 900, height: 450, title: 'Render Components Sets Demo', themeColors: false })

interface CreateUIMessage {
  type: 'render-demo' | 'cancel' | 'request-user-info' | 'request-components'
  message: string
  //   data: ComponentsConfigType
}

const findAllComponentSetsOnPage = (): ComponentSetNode[] => {
  return figma.root.findAll((node) => node.type === 'COMPONENT_SET') as ComponentSetNode[]
}

const findAllComponentsOnPage = (): ComponentNode[] => {
  return figma.root.findAll((node) => node.type === 'COMPONENT') as ComponentNode[]
}

figma.ui.onmessage = async (msg: CreateUIMessage) => {
  const components = findAllComponentsOnPage()
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

      let demoPage = figma.root.findOne((node) => node.name === 'Component Sets [Demo]') as PageNode
      if (!demoPage) {
        demoPage = figma.createPage()
        demoPage.name = 'Component Sets [Demo]'
      }
      figma.currentPage = demoPage

      componentSets.forEach((item) => {
        const mutableChildren = item.children.map((child) => child as ComponentNode)
        renderDemo({ componentSet: { ...item, children: mutableChildren } })
      })

      figma.closePlugin()
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts' })
      console.error(err)
    }
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
