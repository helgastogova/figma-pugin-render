type CustomComponentSet = {
  name: string
  children: ComponentNode[]
}

function addChildrenComponents(node: SceneNode, selectedComponents: Set<ComponentNode | ComponentSetNode>) {
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    selectedComponents.add(node as ComponentNode | ComponentSetNode)
  } else if ('children' in node) {
    node.children.forEach((child) => {
      addChildrenComponents(child, selectedComponents)
    })
  }
}

export const findAllComponentsAndSets = (): {
  componentSets: ComponentSetNode[]
  standaloneComponentSets: CustomComponentSet[]
  selectedComponents: Array<ComponentNode | ComponentSetNode>
} => {
  const componentSets: ComponentSetNode[] = []
  const standaloneComponents = new Map<string, ComponentNode[]>()
  const selectedComponents: Set<ComponentNode | ComponentSetNode> = new Set() // Инициализируем Set для выбранных компонентов

  figma.currentPage.selection.forEach((node) => {
    addChildrenComponents(node, selectedComponents)
  })

  if (selectedComponents.size)
    return {
      componentSets: [],
      standaloneComponentSets: [],
      selectedComponents: Array.from(selectedComponents),
    }

  figma.root.findAll((node) => {
    if (node.type === 'COMPONENT_SET') {
      componentSets.push(node as ComponentSetNode)
    } else if (node.type === 'COMPONENT') {
      const component = node as ComponentNode

      if (['COMPONENT_SET', 'COMPONENT'].includes(component.parent.type)) {
        const parentName = component.parent.name
        let components = standaloneComponents.get(parentName)
        if (!components) {
          components = []
          standaloneComponents.set(parentName, components)
        }
        components.push(component)
      }
    } else if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') {
      if ('findAll' in node && typeof node.findAll === 'function') {
        node.findAll((childNode) => {
          if (childNode.type === 'COMPONENT_SET') {
            componentSets.push(childNode as ComponentSetNode)
          } else if (childNode.type === 'COMPONENT') {
            const component = childNode as ComponentNode
            if (component.parent.type !== 'COMPONENT_SET') {
              const parentName = component.parent.name
              let components = standaloneComponents.get(parentName)
              if (!components) {
                components = []
                standaloneComponents.set(parentName, components)
              }
              components.push(component)
            }
          }
          return false
        })
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
    selectedComponents: [],
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
