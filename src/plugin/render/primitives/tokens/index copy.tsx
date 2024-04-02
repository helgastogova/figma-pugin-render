import { getCollections } from '../getLocalStyles'
import { createFrame, createText } from '@src/plugin/helpers'
import { rgbToHex, isRgb, hexToRgbA } from '@src/plugin/helpers/colors'
//hiddenFromPublishing

interface VariableCollection {
  id: string
  name: string
  variableIds: string[]
  modes?: { name: string; modeId: string }[]
}

export const generateTokens = async (page: PageNode): Promise<void> => {
  const collections = await getCollections()

  for (const collection of Object.values(collections)) {
    const modes = collection.modes || [{ name: 'Default', modeId: '' }]
    const variables: Variable[] = collection.variableIds.map((id) => figma.variables.getVariableById(id))

    for (const mode of modes) {
      const modeFrame = createFrame(
        {
          name: `${collection.name} / ${mode.name}`,
          direction: 'HORIZONTAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          verticalPadding: 30,
          horizontalPadding: 30,
          borderRadius: 24,
        },
        page,
      )

      const groupedVariables = await groupVariablesDynamic(variables, mode.modeId)
      renderGroupsRecursive(modeFrame, groupedVariables, mode)
    }
  }
}

const groupVariablesDynamic = async (variables: Variable[], modeId: string): Promise<Map<string, any>> => {
  const groupMap = new Map<string, any>()

  for (const variable of variables) {
    let value = variable.valuesByMode[modeId]
    if (value?.type === 'VARIABLE_ALIAS') {
      const aliasedVariable = await figma.variables.getVariableById(value.id)

      value = aliasedVariable?.valuesByMode[modeId]
      console.log(`variable:`, JSON.stringify(value, null, 2))
    }
    const parts = variable.name.split('/')
    let currentMap = groupMap

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        if (!currentMap.has(part)) currentMap.set(part, [])
        // console.log(`Pushing variable ${variable.name} with value`, JSON.stringify(value, null, 2))

        currentMap.get(part).push({ variable, value })
      } else {
        if (!currentMap.has(part)) currentMap.set(part, new Map())
        currentMap = currentMap.get(part)
      }
    }
  }

  return groupMap
}

export const renderModeFrames = async (
  collection: VariableCollection,
  topLevelFrame: FrameNode,
  topLevelGroups: Map<string, any>,
) => {
  const modes = collection.modes // || [{ name: 'Default', modeId: '' }]
  for (const mode of modes) {
    const modeFrame = createFrame(
      {
        name: `${collection.name} / ${mode.name}`,
        direction: 'HORIZONTAL',
        horizontalAlign: 'MIN',
        verticalAlign: 'MIN',
        itemSpacing: 50,
        verticalPadding: 30,
        horizontalPadding: 30,
        borderRadius: 24,
      },
      topLevelFrame,
      'right',
    )

    renderGroupsRecursive(modeFrame, topLevelGroups, mode)
  }
}

const renderGroupsRecursive = (
  frame: FrameNode,
  groups: Map<string, any> | Variable[],
  mode: { name: string; modeId: string },
  depth: number = 0,
) => {
  if (Array.isArray(groups)) {
    // console.log(`Rendering variable: ${Array.from(groups)}`)
    for (const variable of groups) {
      // renderDemo(frame, variable, mode)
    }
  } else {
    for (const [groupName, subGroups] of groups) {
      const subFrame = createFrame(
        {
          name: `${groupName}`,
          direction: depth === 0 ? 'VERTICAL' : 'HORIZONTAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 10,
          verticalPadding: 10,
          horizontalPadding: 10,
          borderRadius: 12,
        },
        frame,
      )

      renderGroupsRecursive(subFrame, subGroups, mode, depth + 1)
    }
  }
}

const renderDemo = (frame: FrameNode, variable: Variable, mode: { name: string; modeId: string }) => {
  // console.log(`Rendering demo for variable: ${variable.name} in mode: ${mode.name}`)

  if (!value) {
    // console.error(`No value found for variable ${variable.name} in mode ${mode.name}`)
    return
  }

  switch (variable.resolvedType) {
    case 'COLOR':
      createColorBlock(frame, variable, value, mode)
      break
    case 'STROKE_COLOR':
      createBlock(frame, variable, mode)
      break
    // Add other cases as necessary
  }
}

const createBlock = (frame: FrameNode, variable: Variable, mode: { name: string; modeId: string }) => {
  const block = createFrame(
    {
      name: variable.name,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 10,
      verticalPadding: 10,
      horizontalPadding: 10,
      borderRadius: 12,
    },
    frame,
  )

  createText({
    name: 'Name',
    text: variable.name,
    parent: block,
  })

  createText({
    name: 'Value',
    text: variable.valuesByMode[mode.modeId ?? ''] ?? '',
    parent: block,
  })
}

const createColorBlock = (frame: FrameNode, variable: Variable, value: RGB) => {
  // if (!variable.scopes.length)
  const color = rgbToHex(value as RGB) ?? ''

  if (!color) return

  const wrapper = createFrame(
    {
      name: `${variable.name} / ${color}`,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 8,
      verticalPadding: 8,
      horizontalPadding: 16,
      backgroundColor: color,
      minWidth: 300,
      minHeight: 140,
    },
    frame,
  )

  Object.assign(wrapper, {
    // fills: style.paints,
    strokeWeight: 1,
    strokes: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
  })

  const textWrapper = createFrame(
    {
      name: `${variable.name}/${color}`,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      borderRadius: 6,
      verticalPadding: 8,
      horizontalPadding: 16,
      backgroundColor: '#ffffff',
      itemSpacing: 8,
    },
    wrapper,
  )

  textWrapper.appendChild(
    createText({
      characters: `${variable.name}`,
      fontSize: 18,
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )
  textWrapper.appendChild(
    createText({
      characters: `${color}`,
      fontSize: 18,
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )
}
