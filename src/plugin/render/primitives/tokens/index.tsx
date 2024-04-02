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
function isVariableAlias(value: VariableValue): value is VariableAlias {
  if (typeof value !== 'object') return false
  return (value as VariableAlias).type === 'VARIABLE_ALIAS'
}

export const generateTokens = async (page: PageNode): Promise<void> => {
  const variableCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const collections = [] as Collection[]

  const defaultModeId = variableCollections[0].modes[0].modeId

  // iterate through all the collections
  for (let x = 0; x < variableCollections.length; x++) {
    const collection = variableCollections[x]

    // setup modes objects
    const modes = {} as { [key: string]: Mode }
    for (let j = 0; j < collection.modes.length; j++) {
      modes[collection.modes[j].modeId] = {
        name: collection.modes[j].name,
        variables: [],
      }
    }

    // through all the variables
    for (let i = 0; i < collection.variableIds.length; i++) {
      const variableId = collection.variableIds[i]
      const variable = await figma.variables.getVariableByIdAsync(variableId)

      // get the variable for each modes
      for (let j = 0; j < collection.modes.length; j++) {
        const mode = collection.modes[j]
        const value = variable?.valuesByMode[mode.modeId]
        if (!value) continue

        // if it's a variable id, we need to find the name of it
        if (isVariableAlias(value)) {
          const alias = await figma.variables.getVariableByIdAsync(value.id)
          if (!alias) continue
          modes[mode.modeId].variables.push({
            name: variable.name,
            alias: alias,
            value: alias.valuesByMode[defaultModeId],
            type: alias.resolvedType,
          })
        } else {
          // not a variable alias
          modes[mode.modeId].variables.push({
            name: variable.name,
            value: value,
            type: variable.resolvedType,
          })
        }
      }
    }

    // push the collection to the collections array
    collections.push({
      name: collection.name,
      modes: Object.values(modes),
    })
  }
  // console.log(collections)

  collections.forEach((collection) => {
    collection.modes.forEach((mode) => {
      const modeFrame = createFrame(
        {
          name: `${collection.name} / ${mode.name}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          verticalPadding: 30,
          horizontalPadding: 30,
          borderRadius: 24,
        },
        page,
        'right',
      )

      const groupedVariables = groupVariablesByNames([mode])
      console.log(`Grouped variables for mode ${mode.name}:`, groupedVariables)

      renderGroupsRecursive(modeFrame, groupedVariables, mode)
    })
  })
}

// Группировка переменных по именам внутри режима (mode)
const groupVariablesByNames = (modes: VariableMode[]): Map<string, any> => {
  const groupedVariables = new Map<string, any>()

  modes.forEach((mode) => {
    mode.variables.forEach((variable) => {
      const parts = variable.name.split('/')
      let currentMap = groupedVariables

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!currentMap.has(part)) currentMap.set(part, [])
          currentMap.get(part).push(variable)
        } else {
          if (!currentMap.has(part)) currentMap.set(part, new Map())
          currentMap = currentMap.get(part)
        }
      })
    })
  })

  return groupedVariables
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
    for (const variable of groups) {
      renderDemo(frame, variable, mode)
    }
  } else {
    for (const [groupName, subGroups] of groups) {
      const subFrame = createFrame(
        {
          name: `${groupName} / ${depth}`,
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

      let wrapper

      if (depth === 0) {
        subFrame.appendChild(
          createText({
            characters: `${groupName}`,
            fontSize: 18,
            fontName: { family: 'Roboto', style: 'Regular' },
          }),
        )

        wrapper = createFrame(
          {
            name: `${groupName} / ${depth}`,
            direction: depth === 0 ? 'VERTICAL' : 'HORIZONTAL',
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            itemSpacing: 10,
            verticalPadding: 10,
            horizontalPadding: 10,
            borderRadius: 12,
          },
          subFrame,
        )
      }

      renderGroupsRecursive(depth === 0 ? wrapper : subFrame, subGroups, mode, depth + 1)
    }
  }
}

const renderDemo = (frame: FrameNode, variable: Variable, mode: { name: string; modeId: string }) => {
  const { name, value, type } = variable
  console.log(`Rendering demo for variable: ${type} ${name} in mode: ${mode.name}`)
  if (!value) return

  switch (type) {
    case 'COLOR':
      createColorBlock(frame, name, value, mode)
      break
    case 'STROKE_COLOR':
      createBlock(frame, variable, mode)
      break
    // Add other cases as necessary
  }
}

const createBlock = (frame: FrameNode, name: string, value: any) => {
  const block = createFrame(
    {
      name,
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
    text: name,
    parent: block,
  })

  createText({
    name: 'Value',
    text: value,
    parent: block,
  })
}

const createColorBlock = (frame: FrameNode, name: string, value: RGB) => {
  const color = rgbToHex(value as RGB) ?? ''

  if (!color) return

  const wrapper = createFrame(
    {
      name: `${name} / ${color}`,
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
      name: `${name}/${color}`,
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
      characters: `${name}`,
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
