type CustomComponentNode = {
  id?: string
  name: string
  children: ComponentNode[]
}

export async function loadFonts(fontNames: FontName[]) {
  const loadPromises = fontNames.map((fontName) =>
    figma.loadFontAsync(fontName).catch((error) => {
      console.error(`Error loading font ${fontName.family} ${fontName.style}:`, error)
    }),
  )
  await Promise.all(loadPromises)
}

export function hasActiveSelection(): boolean {
  return figma.currentPage.selection.length > 0
}

function addChildrenComponents(node: SceneNode, selectedComponents: Set<ComponentNode | ComponentSetNode>) {
  if (node.type === 'INSTANCE') {
    const instanceNode = node as InstanceNode
    const mainComponent = instanceNode.mainComponent

    if (mainComponent) {
      if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
        selectedComponents.add(mainComponent.parent as ComponentSetNode)
      } else {
        selectedComponents.add(mainComponent)
      }
    }
  } else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    selectedComponents.add(node as ComponentNode | ComponentSetNode)
  } else if ('children' in node) {
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => {
        addChildrenComponents(child, selectedComponents)
      })
    }
  }
}

function collectStandaloneComponents(
  nodes: ReadonlyArray<SceneNode>,
  standaloneComponents: Map<string, ComponentNode[]>,
) {
  nodes.forEach((node) => {
    if (
      node.type === 'COMPONENT' &&
      node.parent &&
      node.parent.type !== 'COMPONENT_SET' &&
      node.parent.type !== 'COMPONENT'
    ) {
      const parentName = node.parent.name
      const components = standaloneComponents.get(parentName) ?? []
      components.push(node)
      standaloneComponents.set(parentName, components)
    }
  })
}

export const findAllComponentsAndSets = (): {
  componentSets: ComponentSetNode[]
  componentSetsDataPartial: Array<{ id: string; name: string; numberOfComponents: number }>
  standaloneComponentSets: CustomComponentNode[]
  standaloneComponentSetsDataPartial: Array<{ id: string; name: string; numberOfComponents: number }>
  selectedComponents: Array<ComponentNode | ComponentSetNode>
  selectedComponentsDataPartial: Array<{ id: string; name: string; numberOfComponents: number }>
} => {
  const selectedComponents: Set<ComponentNode | ComponentSetNode> = new Set()
  figma.currentPage.selection.forEach((node) => {
    console.log('node', node)
    addChildrenComponents(node, selectedComponents)
  })

  if (hasActiveSelection()) {
    return {
      componentSets: [],
      componentSetsDataPartial: [],
      standaloneComponentSets: [],
      standaloneComponentSetsDataPartial: [],
      selectedComponents: Array.from(selectedComponents),
      selectedComponentsDataPartial: Array.from(selectedComponents).map((component) => {
        return {
          id: component.id,
          name: component.name,
          numberOfComponents: component.children.length,
        }
      }),
    }
  }

  const componentSets: ComponentSetNode[] = figma.root.findAllWithCriteria({
    types: ['COMPONENT_SET'],
  }) as ComponentSetNode[]
  const standaloneComponents = new Map<string, ComponentNode[]>()
  collectStandaloneComponents(figma.root.findAllWithCriteria({ types: ['COMPONENT'] }), standaloneComponents)

  const standaloneComponentSets: CustomComponentNode[] = Array.from(standaloneComponents.entries()).map(
    ([name, components]) => ({
      name,
      children: components,
    }),
  )

  const componentSetsDataPartial = componentSets.map((componentSet) => {
    return {
      id: componentSet.id,
      name: componentSet.name,
      numberOfComponents: componentSet.children.length,
    }
  })

  const selectedComponentsDataPartial = Array.from(selectedComponents).map((component) => {
    return {
      id: component.id,
      name: component.name,
      numberOfComponents: component.children.length,
    }
  })

  const standaloneComponentSetsDataPartial = Array.from(standaloneComponentSets).map((componentSet) => {
    return {
      id: componentSet.id,
      name: componentSet.name,
      numberOfComponents: componentSet.children.length,
    }
  })

  return {
    componentSets,
    componentSetsDataPartial,
    standaloneComponentSets,
    standaloneComponentSetsDataPartial,
    selectedComponents: Array.from(selectedComponents),
    selectedComponentsDataPartial,
  }
}

const getCurrentDateTime = (): string => {
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')

  const day = currentDate.getDate().toString().padStart(2, '0')
  const hours = currentDate.getHours().toString().padStart(2, '0')
  const minutes = currentDate.getMinutes().toString().padStart(2, '0')
  const seconds = currentDate.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`
}

export const getDemoPage = (): PageNode => {
  const timestamp = getCurrentDateTime()
  const page =
    (figma.root.findOne((node) => node.name === `Showcases render [Generated at ${timestamp}]`) as PageNode) ??
    figma.createPage()

  page.name = `Showcases render [Generated at ${timestamp}]`
  return page
}
