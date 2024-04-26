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
      addComponentOrParentSet(mainComponent, selectedComponents)
    }
  } else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    addComponentOrParentSet(node, selectedComponents)
  } else if ('children' in node) {
    node.children.forEach((child) => {
      addChildrenComponents(child, selectedComponents)
    })
  }
}

function addComponentOrParentSet(node: SceneNode, set: Set<ComponentNode | ComponentSetNode>) {
  let parent = node.parent
  let added = false

  while (parent && parent.type !== 'PAGE') {
    if (parent.type === 'COMPONENT_SET') {
      set.add(parent as ComponentSetNode)
      added = true
      break
    }
    parent = parent.parent
  }

  // Если родительский компонентный набор не найден, добавляем исходный узел
  if (!added) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      set.add(node as ComponentNode | ComponentSetNode)
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
export const getCurrentDateTime = (type: 'long' | 'short' = 'long'): string => {
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()
  const day = currentDate.getDate().toString().padStart(2, '0')
  const hours = currentDate.getHours().toString().padStart(2, '0')
  const minutes = currentDate.getMinutes().toString().padStart(2, '0')
  const seconds = currentDate.getSeconds().toString().padStart(2, '0')

  // Массив с названиями месяцев
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = monthNames[monthIndex]

  return type === 'long'
    ? `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`
    : `${month} ${day}, ${year} at ${hours}:${minutes}`
}

export const getDemoPage = (): PageNode => {
  const timestamp = getCurrentDateTime()
  const page =
    (figma.root.findOne((node) => node.name === `Showcases render [Generated at ${timestamp}]`) as PageNode) ??
    figma.createPage()

  page.name = `Showcases render [Generated at ${timestamp}]`
  return page
}
