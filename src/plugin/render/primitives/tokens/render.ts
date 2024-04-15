import { createFrame, createText } from '@src/plugin/helpers'
import { rgbToHex, isRgb, isRgba } from '@src/plugin/helpers/colors'

type VariableScopeWithPrimitive = VariableScope | 'PRIMITIVE' | 'COLOR' | 'DEFAULT_FLOAT' | 'DEFAULT_COLOR'

const getHumanScopeName = (scope: VariableScopeWithPrimitive): string => {
  if (scope === 'ALL_SCOPES') return 'All'
  if (scope === 'ALL_FILLS') return 'All'
  if (scope === 'FRAME_FILL') return 'Frame fill'
  if (scope === 'SHAPE_FILL') return 'Shape fill'
  if (scope === 'TEXT_FILL') return 'Text fill'
  if (scope === 'STROKE_COLOR') return 'Stroke'
  if (scope === 'EFFECT_COLOR') return 'Effects'
  if (scope === 'PRIMITIVE') return 'Primitive'

  if (scope === 'DEFAULT_COLOR') return ''
  if (scope === 'DEFAULT_FLOAT') return ''

  if (scope === 'CORNER_RADIUS') return 'Corner radius'
  if (scope === 'TEXT_CONTENT') return 'Text content'
  if (scope === 'WIDTH_HEIGHT') return 'Width and height'
  if (scope === 'GAP') return 'Gap (Auto layout)'
  if (scope === 'STROKE_FLOAT') return 'Stroke'
  if (scope === 'OPACITY') return 'Layer opacity'
  if (scope === 'EFFECT_FLOAT') return 'Effects'

  return scope
}

export const renderGroupsRecursive = ({
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
  if (Array.isArray(groups) && groups.length < 2) {
    for (const variable of groups) {
      renderDemo({ frame, variable, mode, topGroupName })
    }
  } else {
    for (const [groupName, subGroups] of groups) {
      const subFrame = createFrame(
        {
          name: `${groupName}`,
          direction: 'VERTICAL',
          autoWidth: true,
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoHeight: true,
          itemSpacing: 20,
        },
        frame,
      )

      !Array.isArray(subGroups) &&
        subFrame.appendChild(
          createText({
            characters: `${groupName}`,
            fontSize: 36 - depth * 4,
            fontName: { family: 'Roboto', style: 'Regular' },
          }),
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
    hidden?: boolean
    name: string
    value: VariableValue
    type: VariableDataType
    scopes: VariableScopeWithPrimitive[]
    description?: string
  }
  mode: { name: string; modeId: string }
}) => {
  // const backgroundColor =
  //   mode.name.toLowerCase() === 'dark' ? '#251F1F' : mode.name.toLowerCase() === 'light' ? '#E9E8E8' : '#FFFFFF'

  const { name, value, type, scopes, description } = variable

  if (!value) return

  switch (type) {
    case 'COLOR':
      if (!isRgb(value)) return

      const frameForItems = createFrame(
        {
          name: `type=${type}, name=${name}`,
          direction: 'HORIZONTAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'CENTER',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 16,
          verticalPadding: 16,
        },
        frame,
      )

      const elementsWrapper =
        scopes.length === 1 && scopes[0] === 'PRIMITIVE'
          ? frameForItems
          : createFrame(
              {
                name: 'Scope elements',
                direction: 'HORIZONTAL',
                horizontalAlign: 'MIN',
                verticalAlign: 'MIN',
                autoWidth: true,
                autoHeight: true,
                itemSpacing: 16,
                borderRadius: 16,
                // backgroundColor,
              },
              frameForItems,
            )

      if (scopes.length > 1 || scopes[0] === 'ALL_SCOPES' || scopes[0] === 'PRIMITIVE') {
        createColorCase({ frame: elementsWrapper, name, value: value as RGB, mode, scope: 'DEFAULT_COLOR' })
      } else {
        scopes.forEach((scope) => {
          createColorCase({ frame: elementsWrapper, name, value, mode, scope })
        })
      }

      const textWrapper = createFrame(
        {
          name: `${name}/${rgbToHex(value as RGB)}`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 8,
        },
        frameForItems,
      )

      textWrapper.appendChild(
        createText({
          characters: `${name}, ${rgbToHex(value)}`,
          fontSize: 24,
          fontName: { family: 'Roboto', style: 'Bold' },
        }),
      )

      textWrapper.appendChild(
        createText({
          characters: `${scopes.length > 1 ? 'Scopes' : 'Scope'}: ${scopes.map(getHumanScopeName).join(', ')}`,
          fontSize: 18,
          fontName: { family: 'Roboto', style: 'Regular' },
        }),
      )

      if (!description) return

      const descriptionText = createText({
        characters: `Description: ${description}`,
        fontSize: 18,
        fontName: { family: 'Roboto', style: 'Regular' },
        fontColor: '#555555',
      })

      textWrapper.layoutMode = 'VERTICAL'
      textWrapper.layoutAlign = 'STRETCH'
      textWrapper.appendChild(descriptionText)

      descriptionText.layoutSizingHorizontal = 'FILL'
      descriptionText.layoutSizingVertical = 'HUG'

      break
    case 'FLOAT':
      const frameForFloatItems = createFrame(
        {
          name: `${name}/${type}`,
          direction: 'HORIZONTAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'CENTER',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 20,
          verticalPadding: 16,
        },
        frame,
      )

      if (scopes.length > 1 || scopes[0] === 'ALL_SCOPES') {
        createBlock({ frame: frameForFloatItems, name, value, mode, scope: 'DEFAULT_FLOAT' })
      } else {
        scopes.forEach((scope) => {
          createBlock({ frame: frameForFloatItems, name, value, mode, scope })
        })
      }

      const textWrapperForFloat = createFrame(
        {
          name: name,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 8,
        },
        frameForFloatItems,
      )

      textWrapperForFloat.appendChild(
        createText({
          characters: `${name}, ${value}`,
          fontSize: 24,
          fontName: { family: 'Roboto', style: 'Bold' },
        }),
      )

      textWrapperForFloat.appendChild(
        createText({
          characters: `${scopes.length > 1 ? 'Scopes' : 'Scope'}: ${scopes.map(getHumanScopeName).join(', ')}`,
          fontSize: 14,
          fontName: { family: 'Roboto', style: 'Regular' },
        }),
      )
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
  // mode,
  scope,
}: {
  frame: FrameNode
  name: string
  mode: { name: string; modeId: string }
  value: VariableValue
  scope?: VariableScopeWithPrimitive
}) => {
  // const backgroundColor =
  //   mode.name.toLowerCase() === 'dark' ? '#251F1F' : mode.name.toLowerCase() === 'light' ? '#E9E8E8' : '#FFFFFF'

  const wrapper = createFrame(
    {
      name: `${name}/${scope}/${value}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 16,
      verticalPadding: 8,
      minHeight: 80,
      minWidth: 100,
      horizontalPadding: 8,
    },
    frame,
  )

  switch (scope) {
    case 'ALL_SCOPES':
    case 'DEFAULT_FLOAT':
    case 'GAP':
    case 'STROKE_FLOAT':
    case 'TEXT_CONTENT':
    case 'EFFECT_FLOAT':
    case 'WIDTH_HEIGHT':
      wrapper.appendChild(
        createText({
          characters: `${value}`,
          fontSize: 52,
          fontName: { family: 'Roboto', style: 'Bold' },
          fontColor: '#B2B0B0',
          textAlignHorizontal: 'CENTER',
        }),
      )
      break
    case 'CORNER_RADIUS':
      Object.assign(wrapper, {
        cornerRadius: value as number,
        fills: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }],
      })
      break

      Object.assign(wrapper, {
        maxWidth: value as number,
        minWidth: value as number,
        maxHeight: value as number,
        minHeight: value as number,
        fills: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }],
      })
      break

    case 'OPACITY':
      Object.assign(wrapper, {
        opacity: (+value > 1 ? 1 : value) as number,
      })
      break

    default:
      break
  }
}

const createColorCase = ({
  frame,
  // mode,
  // name,
  value,
  scope,
}: {
  frame: FrameNode
  name: string
  mode: { name: string; modeId: string }
  value: RGBA | RGB
  scope?: VariableScopeWithPrimitive
}) => {
  if (!isRgb(value as RGBA | RGB)) return

  const color = rgbToHex(value as RGBA | RGB) ?? ''
  if (!color) return

  // const fontColor =
  //   mode.name.toLowerCase() === 'dark' ? '#E9E8E8' : mode.name.toLowerCase() === 'light' ? '#251F1F' : '#000000'

  const wrapper = createFrame(
    {
      name: `scope=${scope}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 16,
    },
    frame,
  )

  const colorBlock = createFrame(
    {
      name: 'color block',
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'CENTER',
      minWidth: 60,
      minHeight: 60,
      borderRadius: 24,
    },
    wrapper,
  )

  if (['DEFAULT_COLOR', 'ALL_SCOPES'].includes(scope)) {
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
      case 'EFFECT_COLOR':
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
            characters: 'YO',
            fontSize: 54,
            fontColor: color,
            fontName: { family: 'Roboto', style: 'Bold' },
            textAlignVertical: 'CENTER',
          }),
        )
        break
      default:
        break
    }
  }
}
