export const findAllComponentSetsOnPage = (): ComponentSetNode[] => {
  const realComponentSets = figma.root.findAll((node) => node.type === 'COMPONENT_SET') as ComponentSetNode[]

  const allComponents = figma.root.findAll((node) => node.type === 'COMPONENT') as ComponentNode[]
  const standaloneComponents = allComponents.filter((component) => component.parent.type !== 'COMPONENT_SET')

  const groupedComponents = standaloneComponents.reduce(
    (acc, component) => {
      const parentName = component.parent.name
      if (!acc[parentName]) {
        acc[parentName] = []
      }
      acc[parentName].push(component)
      return acc
    },
    {} as Record<string, ComponentNode[]>,
  )

  const standaloneComponentsSet = Object.entries(groupedComponents).map(([name, components]) => {
    return {
      name,
      children: components,
    }
  }) as ComponentSetNode[]

  return [...realComponentSets, ...standaloneComponentsSet]
}

export const getDemoPage = (): PageNode => {
  return (figma.root.findOne((node) => node.name === 'Component Sets [Demo]') as PageNode) ?? figma.createPage()
}
