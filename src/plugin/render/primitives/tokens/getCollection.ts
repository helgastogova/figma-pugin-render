interface ModeWithVariables {
  [modeId: string]: {
    name: string
    variables: Array<{
      name: string
      alias?: Variable
      value: VariableValue
      type: VariableResolvedDataType
      scopes: VariableScope[]
    }>
  }
}

const isVariableAlias = (value: VariableValue): value is VariableAlias =>
  typeof value === 'object' && value && 'type' in value && value.type === 'VARIABLE_ALIAS'

const fetchVariablesForModes = async (
  variableIds: string[],
  modes: { modeId: string; name: string }[],
  defaultModeId: string,
): Promise<ModeWithVariables> => {
  const modesWithVars: ModeWithVariables = modes.reduce((acc, mode) => {
    acc[mode.modeId] = { name: mode.name, variables: [] }
    return acc
  }, {})

  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId)
    if (!variable || variable.hiddenFromPublishing) continue
    //if (!variable) continue

    for (const mode of modes) {
      const value = variable.valuesByMode[mode.modeId]
      if (!value) continue

      const scopes = variable.scopes || []
      let aliasValue = value

      if (isVariableAlias(value)) {
        const alias = await figma.variables.getVariableByIdAsync(value.id)
        if (!alias) continue
        aliasValue = alias.valuesByMode[defaultModeId]
      }

      modesWithVars[mode.modeId].variables.push({
        name: variable.name,
        value: aliasValue,
        type: variable.resolvedType,
        scopes: scopes.length > 0 ? scopes : ['ALL_SCOPES'],
        description: variable.description,
      })
    }
  }

  return modesWithVars
}

export const getCollection = async (): Promise<Collection> => {
  const variableCollections = await figma.variables.getLocalVariableCollectionsAsync()
  if (!variableCollections?.length) return

  const defaultModeId =
    variableCollections[0]?.modes.find((mode) => mode.name === 'Default')?.modeId ||
    variableCollections[0].modes[0].modeId
  const collections: VariableCollection[] = []

  for (const collection of variableCollections) {
    const modesWithVars = await fetchVariablesForModes(collection.variableIds, collection.modes, defaultModeId)

    collections.push({
      name: collection.name,
      modes: Object.values(modesWithVars),
    })
  }

  return collections
}
