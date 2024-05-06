export async function loadFonts(fontNames: FontName[]) {
  const loadPromises = fontNames.map((fontName) =>
    figma.loadFontAsync(fontName).catch((error) => {
      console.error(`Error loading font ${fontName.family} ${fontName.style}:`, error)
    }),
  )
  await Promise.all(loadPromises)
}

export const hasActiveSelection = (): boolean => figma.currentPage.selection.length > 0
async function addChildrenComponents(
  node: SceneNode,
  set: Set<ComponentNode | ComponentSetNode>,
  foundInChildren = false,
) {
  if (node.type === 'INSTANCE') {
    const instanceNode = node as InstanceNode
    try {
      const mainComponent = await instanceNode.getMainComponentAsync()
      if (mainComponent) {
        await addComponentOrParentSet(mainComponent, set)
        foundInChildren = true
      }
    } catch (error) {
      console.error('Error getting main component:', error)
    }
  } else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    await addComponentOrParentSet(node, set)
    foundInChildren = true
  } else if ('children' in node && node.children.length > 0) {
    for (const child of node.children) {
      foundInChildren = (await addChildrenComponents(child, set, foundInChildren)) || foundInChildren
    }
  }

  if (!foundInChildren) {
    let parent = node.parent
    while (parent && parent.type !== 'PAGE') {
      if (parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
        await addComponentOrParentSet(parent, set)
        foundInChildren = true
        break
      }
      parent = parent.parent
    }
  }

  return foundInChildren
}

async function addComponentOrParentSet(
  node: SceneNode | PageNode | (BaseNode & ChildrenMixin),
  set: Set<ComponentNode | ComponentSetNode>,
) {
  let current = node

  let added = false

  while (current?.type !== 'PAGE') {
    if (current?.type === 'COMPONENT_SET') {
      set.add(current as ComponentSetNode)
      added = true
      break
    }
    current = current.parent
  }

  if (!added && (['COMPONENT', 'COMPONENT_SET'].includes(node.type) as boolean)) {
    set.add(node as ComponentNode | ComponentSetNode)
  }
}

const getNumberOfComponents = (component: ComponentNode | ComponentSetNode): number => {
  if (component.type === 'COMPONENT') return 1

  return (component as ComponentSetNode).children.length
}

export const findAllComponentsAndSets = async (): Promise<{
  componentsList: Array<ComponentNode | ComponentSetNode>
  componentsListPartial: Array<{ id: string; name: string; numberOfComponents: number }>
  selectedComponents: Array<ComponentNode | ComponentSetNode>
  selectedComponentsDataPartial: Array<{ id: string; name: string; numberOfComponents: number }>
}> => {
  if (hasActiveSelection()) {
    const selectedComponents: Set<ComponentNode | ComponentSetNode> = new Set()

    const tasks = figma.currentPage.selection.map((node) => addChildrenComponents(node, selectedComponents))
    await Promise.all(tasks)

    return {
      componentsList: [],
      componentsListPartial: [],
      selectedComponents: Array.from(selectedComponents),
      selectedComponentsDataPartial: Array.from(selectedComponents).map((component) => {
        return {
          id: component.id,
          name: component.name,
          numberOfComponents: getNumberOfComponents(component),
        }
      }),
    }
  }

  const standaloneComponents: Set<ComponentNode | ComponentSetNode> = new Set()
  try {
    await figma.loadAllPagesAsync()
  } catch (error) {
    console.error('Error loading font Roboto Regular:', error)
  } finally {
    figma.root.findAllWithCriteria({ types: ['COMPONENT'] }).forEach((node) => {
      addChildrenComponents(node, standaloneComponents)
    })
  }

  const componentsList = [...Array.from(standaloneComponents.values())]

  const componentsListPartial = componentsList.map((component) => {
    return {
      id: component.id,
      name: component.name,
      numberOfComponents: getNumberOfComponents(component),
    }
  })

  return {
    componentsList,
    componentsListPartial,
    selectedComponents: [],
    selectedComponentsDataPartial: [],
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

export const getDemoPage = async (): Promise<PageNode> => {
  const timestamp = getCurrentDateTime()
  await figma.loadAllPagesAsync()
  const page =
    (figma.root.findOne((node) => node.name === `Showcases render [Generated at ${timestamp}]`) as PageNode) ??
    figma.createPage()

  page.name = `Showcases render [Generated at ${timestamp}]`
  return page
}
