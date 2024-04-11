type CustomComponentSet = {
  name: string
  children: ComponentNode[]
}

export const findAllComponentSetsOnPage = (): {
  componentSets: ComponentSetNode[]
  standaloneComponentSets: CustomComponentSet[]
  selectedComponents: Array<ComponentNode | ComponentSetNode>
} => {
  const componentSets: ComponentSetNode[] = []
  const standaloneComponents = new Map<string, ComponentNode[]>()
  const selectedComponents: ComponentNode[] = [] // Инициализируем массив для выбранных компонентов

  figma.currentPage.selection.forEach((node) => {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      selectedComponents.push(node as ComponentNode | ComponentSetNode)
    }
  })

  if (selectedComponents.length)
    return {
      componentSets: [],
      standaloneComponentSets: [],
      selectedComponents,
    }

  figma.root.findAll((node) => {
    if (node.type === 'COMPONENT_SET') {
      componentSets.push(node as ComponentSetNode)
    } else if (node.type === 'COMPONENT') {
      const component = node as ComponentNode
      if (component.parent.type !== 'COMPONENT_SET') {
        const parentName = component.parent.name
        if (!standaloneComponents.has(parentName)) {
          standaloneComponents.set(parentName, [])
        }
        standaloneComponents.get(parentName)?.push(component)
      }
    }
    return false
  })

  const standaloneComponentSets: CustomComponentSet[] = Array.from(standaloneComponents.entries()).map(
    ([name, components]) => ({
      name,
      children: components,
    }),
  )

  return {
    componentSets,
    standaloneComponentSets,
    selectedComponents,
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
