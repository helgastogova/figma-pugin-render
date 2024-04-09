function buildVariableTree(parts: string[], variable: Variable, index: number = 0, currentMap: Map<string, any>): void {
  const part = parts[index]

  if (index === parts.length - 1) {
    if (!currentMap.has(part)) {
      currentMap.set(part, [])
    }
    const list = currentMap.get(part)
    if (!list.some((item) => item.name === variable.name)) {
      list.push(variable)
    }
  } else {
    if (!currentMap.has(part)) {
      currentMap.set(part, new Map())
    }
    buildVariableTree(parts, variable, index + 1, currentMap.get(part))
  }
}

export const groupVariablesByNames = (modes: VariableMode[]): Map<string, { name: string; value: string }[]> => {
  const groupedVariables = new Map<string, { name: string; value: string }[]>()

  modes.forEach((mode) => {
    mode.variables.forEach((variable) => {
      const parts = variable.name.split('/')
      buildVariableTree(parts, variable, 0, groupedVariables)
    })
  })

  return groupedVariables
}
