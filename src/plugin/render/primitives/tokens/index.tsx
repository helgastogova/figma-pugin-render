import { createFrame, createText } from '@src/plugin/helpers'
import { rgbToHex, isRgb, isRgba, hexToRgbA } from '@src/plugin/helpers/colors'

type VariableScopeWithPrimitive = VariableScope | 'PRIMITIVE' | 'COLOR'
type Mode = {
  name: string
  variables: {
    name: string
    value: VariableValue
    type: VariableDataType
    scopes: VariableScopeWithPrimitive[]
    alias?: VariableAlias
  }[]
}

function isVariableAlias(value: VariableValue): value is VariableAlias {
  if (typeof value !== 'object') return false
  return (value as VariableAlias).type === 'VARIABLE_ALIAS'
}

export const generateTokens = async (page: PageNode): Promise<void> => {
  const variableCollections = await figma.variables.getLocalVariableCollectionsAsync()

  if (!variableCollections?.length) return
  const collections = [] as VariableCollection[]

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
        const scopes = variable?.scopes

        if (!value || variable.hiddenFromPublishing) continue

        // if it's a variable id, we need to find the name of it
        if (isVariableAlias(value)) {
          const alias = await figma.variables.getVariableByIdAsync(value.id)

          if (!alias) continue

          modes[mode.modeId].variables.push({
            name: variable.name,
            alias: alias,
            value: alias.valuesByMode[defaultModeId],
            type: alias.resolvedType,
            scopes: scopes ?? alias.scopes,
          })
        } else {
          const newScopes = scopes ?? variable.scopes
          modes[mode.modeId].variables.push({
            name: variable.name,
            value: value,
            type: variable.resolvedType,
            scopes: newScopes.length ? newScopes : ['PRIMITIVE'],
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
          name: `Collection ${collection.name} for ${mode.name} mode`,
          wrap: 'WRAP',
          maxWidth: 1430,
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 50,
          borderRadius: 24,
          // backgroundColor: '#FFFFFF',
        },
        page,
        'right',
      )

      // add boredee
      Object.assign(modeFrame, {
        strokes: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }],
        strokeWeight: 5,
      })

      const groupedVariables = groupVariablesByNames([mode])
      for (const [groupName, subGroups] of groupedVariables) {
        const subFrame = createFrame(
          {
            name: `Group name: ${groupName}`,
            direction: 'VERTICAL',
            maxWidth: 1430,
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            verticalPadding: 50,
            horizontalPadding: 50,
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
          },
          modeFrame,
        )

        subFrame.appendChild(
          createText({
            characters: `Group name: ${groupName}`,
            fontSize: 42,
            fontName: { family: 'Roboto', style: 'Regular' },
          }),
        )

        const wrapper = createFrame(
          {
            name: `wrapper for ${groupName}`,
            direction: 'HORIZONTAL',
            wrap: 'WRAP',
            maxWidth: 1360,
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
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

const renderDemo = ({
  frame,
  variable,
  mode,
}: {
  frame: FrameNode
  variable: {
    name: string
    value: VariableValue
    type: VariableDataType
    scopes: VariableScopeWithPrimitive[]
  }
  mode: { name: string; modeId: string }
}) => {
  const backgroundColor =
    mode.name.toLowerCase() === 'dark' ? '#251F1F' : mode.name.toLowerCase() === 'light' ? '#E9E8E8' : '#FFFFFF'

  const { name, value, type, scopes } = variable

  if (!value) return

  switch (type) {
    case 'COLOR':
      if (!isRgb(value)) return

      const frameForItems = createFrame(
        {
          name: `${name}/${type}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 16,
          verticalPadding: 16,
        },
        frame,
      )
      const textWrapper = createFrame(
        {
          name: `${name}/${rgbToHex(value)}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 8,
        },
        frameForItems,
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
          characters: `${rgbToHex(value)}`,
          fontSize: 18,
          fontName: { family: 'Roboto', style: 'Regular' },
        }),
      )
      const elementsWrapper =
        scopes.length === 1 && scopes[0] === 'PRIMITIVE'
          ? frameForItems
          : createFrame(
              {
                name: 'Scope elements',
                wrap: 'WRAP',
                maxWidth: 1360,
                horizontalAlign: 'MIN',
                verticalAlign: 'MIN',
                autoWidth: true,
                autoHeight: true,
                itemSpacing: 16,
                verticalPadding: 16,
                horizontalPadding: 16,
                borderRadius: 16,
                backgroundColor,
              },
              frameForItems,
            )

      scopes.forEach((scope) => {
        createColorCase({ frame: elementsWrapper, name, value, mode, scope })
      })

      break
    case 'FLOAT':
      const frameForFloatItems = createFrame(
        {
          name: `${name}/${type}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 16,
          verticalPadding: 16,
        },
        frame,
      )
      const textWrapperForFloat = createFrame(
        {
          name: `${name}/${rgbToHex(value)}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 8,
        },
        frameForFloatItems,
      )

      textWrapperForFloat.appendChild(
        createText({
          characters: `${name}`,
          fontSize: 14,
          fontName: { family: 'Roboto', style: 'Regular' },
        }),
      )
      // textWrapper.appendChild(
      //   createText({
      //     characters: `${rgbToHex(value)}`,
      //     fontSize: 18,
      //     fontName: { family: 'Roboto', style: 'Regular' },
      //   }),
      // )

      scopes.forEach((scope) => {
        createBlock({ frame: frameForFloatItems, name, value, mode, scope })
      })

      break
    // Add other cases as necessary

    default:
      break
  }
}

const createBlock = ({
  frame,
  name,
  value,
  mode,
  scope,
}: {
  frame: FrameNode
  name: string
  mode: { name: string; modeId: string }
  value: VariableValue
  scope?: VariableScopeWithPrimitive
}) => {
  const backgroundColor =
    mode.name.toLowerCase() === 'dark' ? '#251F1F' : mode.name.toLowerCase() === 'light' ? '#E9E8E8' : '#FFFFFF'
  /*
ALL_SCOPES
CORNER_RADIUS
WIDTH_HEIGHT
GAP
TEXT_CONTENT
STROKE_FLOAT
OPACITY
EFFECT_FLOAT
*/
  const wrapper = createFrame(
    {
      name: `${name}/${scope}/${value}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 16,
      verticalPadding: 8,
      minHeight: 100,
      minWidth: 140,
      horizontalPadding: 8,
    },
    frame,
  )

  switch (scope) {
    case 'ALL_SCOPES':
      break
    case 'CORNER_RADIUS':
      Object.assign(wrapper, {
        cornerRadius: value as number,
        fills: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }],
      })
      break
    case 'WIDTH_HEIGHT':
      Object.assign(wrapper, {
        maxWidth: value as number,
        minWidth: value as number,
        maxHeight: value as number,
        minHeight: value as number,
        fills: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }],
      })
      break
    case 'GAP':
      createFrame(
        {
          name: `Gap ${value}`,
          direction: 'VERTICAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          itemSpacing: 16,
          verticalPadding: 8,
          minHeight: value as number,
          maxHeight: value as number,
          minWidth: 140,
          backgroundColor: '#FCBFBF',
          horizontalPadding: 8,
        },
        wrapper,
      )
      break
    // case 'TEXT_CONTENT':
    //   wrapper.appendChild(
    //     createText({
    //       characters: 'Text',
    //       fontSize: 42,
    //       fontName: { family: 'Roboto', style: 'Regular' },
    //     }),
    //   )
    //   break
    // case 'STROKE_FLOAT':
    //   Object.assign(wrapper, {
    //     strokeWeight: value as number,
    //     strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }],
    //   })
    //   break
    // case 'OPACITY':
    //   Object.assign(wrapper, {
    //     opacity: value as number,
    //   })
    //   break
    // case 'EFFECT_FLOAT':
    //   Object.assign(wrapper, {
    //     effects: [
    //       {
    //         type: 'DROP_SHADOW',
    //         color: { r: 0, g: 0, b: 0 },
    //         offset: { x: 0, y: 4 },
    //         radius: value as number,
    //         visible: true,
    //         blendMode: 'NORMAL',
    //       },
    //     ],
    //   })
    //   break
    default:
      break
  }
  frame.appendChild(
    createText({
      characters: `Scope: ${getHumanScopeName(scope)}`,
      fontSize: 14,
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )
}

/* 
Scopes allow a variable to be shown/hidden in the variable picker UI for various fields. This is useful to help declutter the Figma UI if you have a large number of variables. Currently only supported on FLOAT and COLOR variables.
ALL_SCOPES is a special scope that means that the variable will be shown in the picker UI for all current and any future fields. If ALL_SCOPES is set, no additional scopes can be set.
Likewise, ALL_FILLS is a special scope that means that the variable will be shown in the picker UI for all current and any future color fill fields. If ALL_FILLS is set, no additional fill scopes can be set.
Valid scopes for FLOAT variables are: ALL_SCOPES, TEXT_CONTENT, WIDTH_HEIGHT, GAP, STROKE_FLOAT, OPACITY, and EFFECT_FLOAT.
Valid scopes for COLOR variables are ALL_SCOPES, ALL_FILLS, FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR, and EFFECT_COLOR.

'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'

'ALL_SCOPES'
'TEXT_CONTENT'
'CORNER_RADIUS'
'WIDTH_HEIGHT'
'GAP'
'ALL_FILLS'
'FRAME_FILL'
'SHAPE_FILL'
'TEXT_FILL'
'STROKE_COLOR'
'STROKE_FLOAT'
'EFFECT_FLOAT'
'EFFECT_COLOR'
'OPACITY'

'COLOR' scopes:
'ALL_SCOPES'
'ALL_FILLS'
'FRAME_FILL'
'SHAPE_FILL'
'TEXT_FILL'
'STROKE_COLOR'
'EFFECT_COLOR'

'FLOAT' scopes:
'ALL_SCOPES'
'TEXT_CONTENT'
'WIDTH_HEIGHT'
'GAP'
'STROKE_FLOAT'
'OPACITY'
'EFFECT_FLOAT'

'BOOLEAN' scopes:
'ALL_SCOPES'
'TEXT_CONTENT'
'WIDTH_HEIGHT'
'GAP'
'STROKE_FLOAT'
'OPACITY'
'EFFECT_FLOAT'

'STRING' scopes:
'ALL_SCOPES'
'TEXT_CONTENT'
'WIDTH_HEIGHT'
'GAP'
'STROKE_FLOAT'
'OPACITY'
'EFFECT_FLOAT'
----

'ALL_SCOPES' – All
'ALL_FILLS' – All fills
'FRAME_FILL' – Fill: Frame
'SHAPE_FILL' – Fill: Shape
'TEXT_FILL' – Fill: Text
'STROKE_COLOR' – Stroke
'EFFECT_COLOR' – Effecs

type Effect = DropShadowEffect | InnerShadowEffect | BlurEffect

*/

const createColorCase = ({
  frame,
  mode,
  name,
  value,
  scope,
}: {
  frame: FrameNode
  name: string
  mode: { name: string; modeId: string }
  value: RGB
  scope?: VariableScopeWithPrimitive
}) => {
  if (!isRgb(value as RGB)) return

  const color = rgbToHex(value as RGB) ?? ''
  if (!color) return

  const fontColor =
    mode.name.toLowerCase() === 'dark' ? '#E9E8E8' : mode.name.toLowerCase() === 'light' ? '#251F1F' : '#000000'

  const wrapper = createFrame(
    {
      name: `${name}/${color}/${scope}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 16,
      verticalPadding: 8,
      horizontalPadding: 8,
    },
    frame,
  )

  const colorBlock = createFrame(
    {
      name: 'color block',
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'CENTER',
      minWidth: 140,
      minHeight: 100,
      borderRadius: 24,
    },
    wrapper,
  )

  if (['PRIMITIVE', 'ALL_SCOPES'].includes(scope)) {
    Object.assign(colorBlock, {
      strokeWeight: 1,
      strokes: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
      fills: [{ type: 'SOLID', color: { r: value.r, g: value.g, b: value.b }, opacity: isRgba(value) ? value.a : 1 }],
    })
  } else {
    switch (scope) {
      case 'ALL_FILLS':
      case 'FRAME_FILL':
      case 'SHAPE_FILL':
      case 'COLOR': // for general colors (primitives)
        Object.assign(colorBlock, {
          strokeWeight: 1,
          strokes: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }],
          fills: [
            { type: 'SOLID', color: { r: value.r, g: value.g, b: value.b }, opacity: isRgba(value) ? value.a : 1 },
          ],
        })

        break
      case 'STROKE_COLOR':
        Object.assign(colorBlock, {
          strokeWeight: 3,
          strokes: [{ type: 'SOLID', color: { r: value.r, g: value.g, b: value.b } }],
        })
        break
      case 'EFFECT_COLOR':
        Object.assign(colorBlock, {
          effects: [
            {
              type: 'DROP_SHADOW',
              color: value,
              offset: { x: 0, y: 4 },
              radius: 4,
              visible: true,
              blendMode: 'NORMAL',
            },
          ],
        })
        break
      case 'TEXT_FILL':
        colorBlock.appendChild(
          createText({
            characters: 'Text',
            fontSize: 54,
            fontColor: color,
            fontName: { family: 'Roboto', style: 'Regular' },
            textAlignVertical: 'CENTER',
          }),
        )
        break
      default:
        break
    }
    if (scope !== 'PRIMITIVE') {
      wrapper.appendChild(
        createText({
          characters: `Scope: ${getHumanScopeName(scope)}`,
          fontSize: 14,
          fontName: { family: 'Roboto', style: 'Regular' },
          fontColor,
        }),
      )
    }
  }
}

const getHumanScopeName = (scope: VariableScopeWithPrimitive): string => {
  if (scope === 'ALL_SCOPES') return 'All'
  if (scope === 'ALL_FILLS') return 'All fills'
  if (scope === 'FRAME_FILL') return 'Frame fill'
  if (scope === 'SHAPE_FILL') return 'Shape fill'
  if (scope === 'TEXT_FILL') return 'Text fill'
  if (scope === 'STROKE_COLOR') return 'Stroke'
  if (scope === 'EFFECT_COLOR') return 'Effects'
  if (scope === 'PRIMITIVE') return 'Primitive'
  return scope
}
