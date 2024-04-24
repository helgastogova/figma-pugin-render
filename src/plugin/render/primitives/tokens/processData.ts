function buildVariableTree(parts: string[], variable: Variable, currentMap: Map<string, any>): void {
  const groupName = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root'
  const variableName = parts[parts.length - 1]

  if (!currentMap.has(groupName)) {
    currentMap.set(groupName, new Map())
  }
  const group = currentMap.get(groupName)

  if (!group.has(variableName)) {
    group.set(variableName, [])
  }
  group.get(variableName).push(variable)
}

export const groupVariablesByNames = (
  modes: { modeId: string; name: string; variables?: Variable[] }[],
): Map<string, Map<string, Variable[]>> => {
  const groupedVariables = new Map<string, Map<string, Variable[]>>()

  modes.forEach((mode) => {
    ;(mode.variables || []).forEach((variable) => {
      const parts = variable.name.includes('/') ? variable.name.split('/') : ['root', variable.name]
      buildVariableTree(parts, variable, groupedVariables)
    })
  })

  const sortedGroupedVariables = new Map<string, Map<string, Variable[]>>(
    Array.from(groupedVariables.entries()).sort((a, b) => a[0].localeCompare(b[0])),
  )

  return sortedGroupedVariables
}
