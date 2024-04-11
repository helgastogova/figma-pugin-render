export async function applyAutoLayoutToSelection() {
  if (figma.currentPage.selection.length === 0) {
    figma.closePlugin('Ничего не выделено.')
    return
  }

  const selectedNode = figma.currentPage.selection[0]

  //   if (selectedNode.type !== 'FRAME' && selectedNode.type !== 'COMPONENT') {
  //     figma.closePlugin('Выделенный узел не является фреймом или компонентом.')
  //     return
  //   }
  console.log(selectedNode)
  function applyAutoLayout(node) {
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'AUTO'

    if ('children' in node) {
      for (const child of node.children) {
        applyAutoLayout(child)
      }
    }
  }

  applyAutoLayout(selectedNode)

  figma.closePlugin('Автолейаут применен к выделенному компоненту.')
}
