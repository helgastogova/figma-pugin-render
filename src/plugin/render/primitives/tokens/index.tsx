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

  if (!variableCollections?.length) return
  const collections = [] as Collection[]

  const defaultModeId = variableCollections[0]?.modes[0]?.modeId

  for (let x = 0; x < variableCollections.length; x++) {
    const collection = variableCollections[x]

    // setup modes objects
    const modes = {} as { [key: string]: Mode }
    for (let j = 0; j < collection?.modes?.length; j++) {
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

  // главные блоки
  // TODO: add mode support
  collections.forEach((collection) => {
    collection.modes.forEach((mode) => {
      const modeFrame = createFrame(
        {
          name: `${collection.name} / ${mode.name}`,
          direction: 'HORIZONTAL',
          wrap: 'WRAP',
          maxWidth: 1360,
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 50,
          verticalPadding: 50,
          horizontalPadding: 50,
          borderRadius: 24,
          backgroundColor: mode.name === 'Dark' ? '#251F1F' : mode.name === 'Light' ? '#E9E8E8' : '#FFFFFF',
        },
        page,
        'right',
      )

      const groupedVariables = groupVariablesByNames([mode])
      for (const [groupName, subGroups] of groupedVariables) {
        const subFrame = createFrame(
          {
            name: `${groupName}`,
            wrap: 'WRAP',
            maxWidth: 1360,
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            verticalPadding: 50,
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
          },
          modeFrame,
        )

        subFrame.appendChild(
          createText({
            characters: `${groupName}`,
            fontSize: 42,
            fontName: { family: 'Roboto', style: 'Regular' },
          }),
        )

        const wrapper = createFrame(
          {
            name: `${groupName} / wrapper`,
            wrap: 'WRAP',
            maxWidth: 1360,
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
            verticalPadding: 8,
          },
          subFrame,
        )

        renderGroupsRecursive({ frame: wrapper, groups: subGroups, mode, topGroupName: groupName })
      }
    })
  })
}
const groupVariablesByNames = (modes: VariableMode[]): Map<string, any> => {
  const groupedVariables = new Map<string, any>()

  modes.forEach((mode) => {
    mode.variables.forEach((variable) => {
      const parts = variable.name.split('/')
      let currentMap = groupedVariables

      parts.forEach((part, index) => {
        if (index < parts.length - 1) {
          if (!currentMap.has(part)) {
            currentMap.set(part, new Map())
          }
          currentMap = currentMap.get(part)
        } else {
          if (!currentMap.has(part)) {
            currentMap.set(part, [])
          }
          const list = currentMap.get(part)
          if (!list.some((item) => item.name === variable.name)) {
            list.push(variable)
          }
        }
      })
    })
  })

  return groupedVariables
}

const renderGroupsRecursive = ({
  frame,
  groups,
  mode,
  depth = 0,
  topGroupName = '',
}: {
  frame: FrameNode
  groups: Map<string, any> | Variable[]
  mode: { name: string; modeId: string }
  depth?: number
  topGroupName?: string
}) => {
  if (Array.isArray(groups)) {
    for (const variable of groups) {
      renderDemo({ frame, variable, mode, topGroupName })
    }
  } else {
    for (const [groupName, subGroups] of groups) {
      const subFrame = createFrame(
        {
          name: `${groupName} / ${depth}`,
          wrap: 'WRAP',
          maxWidth: 1360,
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 16,
          verticalPadding: 8,
        },
        frame,
      )

      renderGroupsRecursive({ frame: subFrame, groups: subGroups, mode, depth: depth + 1, topGroupName })
    }
  }
}

type GroupType =
  | 'background'
  | 'border'
  | 'text'
  | 'shadow'
  | 'elevation'
  | 'gradient'
  | 'opacity'
  | 'size'
  | 'spacing'
  | 'radius'
  | 'font'
  | 'icon'
  | 'line'

const getGroupType = (loweredTopGroupName: string): GroupType => {
  if (
    loweredTopGroupName.includes('background') ||
    loweredTopGroupName.includes('content') ||
    loweredTopGroupName.includes('color')
  )
    return 'background'
  if (loweredTopGroupName.includes('border') || loweredTopGroupName.includes('outline')) return 'border'
  if (loweredTopGroupName.includes('text')) return 'text'
  if (loweredTopGroupName.includes('shadow')) return 'shadow'
  if (loweredTopGroupName.includes('elevation')) return 'elevation'
  if (loweredTopGroupName.includes('gradient')) return 'gradient'
  if (loweredTopGroupName.includes('opacity')) return 'opacity'
  if (loweredTopGroupName.includes('size')) return 'size'
  if (loweredTopGroupName.includes('spacing')) return 'spacing'
  if (loweredTopGroupName.includes('radius')) return 'radius'
  if (loweredTopGroupName.includes('font')) return 'font'
  if (loweredTopGroupName.includes('icon')) return 'icon'
  if (loweredTopGroupName.includes('line')) return 'line'
  return ''
}

const renderDemo = ({
  frame,
  variable,
  mode,
  topGroupName,
}: {
  frame: FrameNode
  variable: { name: string; value: any; type: string }
  mode: { name: string; modeId: string }
  topGroupName?: string
}) => {
  const { name, value, type } = variable
  // console.log(`Rendering demo for variable: ${type} ${name} in mode: ${mode.name}`)
  if (!value) return

  const groupType = getGroupType(topGroupName?.toLowerCase() ?? '')

  switch (type) {
    case 'COLOR':
      createColorBlock({ frame, name, value, mode, groupType })
      break
    case 'STROKE_COLOR':
      createBlock(frame, variable, mode)
      break
    // Add other cases as necessary

    default:
      break
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

const createColorBlock = ({
  frame,
  name,
  value,
  groupType,
}: {
  frame: FrameNode
  name: string
  value: RGB
  groupType?: GroupType
}) => {
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
      horizontalPadding: 8,
      backgroundColor: groupType === 'background' && color,
      minWidth: 300,
      minHeight: 140,
      borderRadius: 24,
    },
    frame,
  )

  switch (groupType) {
    case 'background':
      Object.assign(wrapper, {
        strokeWeight: 1,
        strokes: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
      })
      break
    case 'border':
      Object.assign(wrapper, {
        strokeWeight: 3,
        strokes: [{ type: 'SOLID', color: figma.util.rgb(color) }],
      })
      break

    default:
      break
  }

  const textWrapper = createFrame(
    {
      name: `${name}/${color}`,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      borderRadius: 16,
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
      fontSize: 14,
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
