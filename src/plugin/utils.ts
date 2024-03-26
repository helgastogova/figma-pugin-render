export const findAllComponentSetsOnPage = (): ComponentSetNode[] => {
  return figma.root.findAll((node) => node.type === 'COMPONENT_SET') as ComponentSetNode[]
}

export const getDemoPage = (): PageNode => {
  return (figma.root.findOne((node) => node.name === 'Component Sets [Demo]') as PageNode) ?? figma.createPage()
}
