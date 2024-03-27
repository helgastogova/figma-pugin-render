type CustomComponentSet = {
  name: string
  children: ComponentNode[]
}

export const findAllComponentSetsOnPage = (): {
  componentSets: ComponentSetNode[]
  standaloneComponentSets: CustomComponentSet[]
} => {
  const componentSets: ComponentSetNode[] = []
  const standaloneComponents = new Map<string, ComponentNode[]>()

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
  }
}

export const getDemoPage = (): PageNode => {
  return (figma.root.findOne((node) => node.name === 'Component Sets [Demo]') as PageNode) ?? figma.createPage()
}
