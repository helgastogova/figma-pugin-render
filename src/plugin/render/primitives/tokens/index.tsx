import { getCollections } from '../getLocalStyles'
import { createFrame, createText } from '@src/plugin/helpers'
import { rgbToHex, isRgb } from '@src/plugin/helpers/colors'
//hiddenFromPublishing

interface VariableCollection {
  id: string
  name: string
  variableIds: string[]
  modes?: { name: string; modeId: string }[]
}

export const generateTokens = async (page: PageNode): Promise<void> => {
  const collections = await getCollections()

  const topLevelFrame = createFrame(
    {
      name: 'Tokens',
      direction: 'HORIZONTAL',
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

  const groupVariables = (variables: Variable[]): Map<string, Map<string, Map<string, Variable[]>>> => {
    const topLevelGroups = new Map<string, Map<string, Map<string, Variable[]>>>()

    variables.forEach((variable) => {
      const [topLevel, secondLevel, ...rest] = variable.name.split('/')
      const thirdLevelName = rest.join('/')

      if (!topLevelGroups.has(topLevel)) {
        topLevelGroups.set(topLevel, new Map<string, Map<string, Variable[]>>())
      }
      const secondLevelGroups = topLevelGroups.get(topLevel)
      if (!secondLevelGroups?.has(secondLevel)) {
        secondLevelGroups?.set(secondLevel, new Map<string, Variable[]>())
      }
      const thirdLevelGroups = secondLevelGroups?.get(secondLevel)
      if (!thirdLevelGroups?.has(thirdLevelName)) {
        thirdLevelGroups?.set(thirdLevelName, [])
      }
      thirdLevelGroups?.get(thirdLevelName)?.push(variable)
    })
    return topLevelGroups
  }

  for (const collection of Object.values(collections)) {
    const variables: Variable[] = collection.variableIds.map((id) => figma.variables.getVariableById(id))
    const topLevelGroups = groupVariables(variables)

    const renderModeFrames = async (collection: VariableCollection) => {
      const modes = collection.modes || [{ name: 'Default', modeId: '' }]
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

        topLevelGroups.forEach((secondLevelGroups, topLevelName) => {
          const topLevelFrame = createFrame(
            {
              name: `${topLevelName}`,
              direction: 'VERTICAL',
              horizontalAlign: 'MIN',
              verticalAlign: 'MIN',
              itemSpacing: 10,
              verticalPadding: 10,
              horizontalPadding: 10,
              borderRadius: 12,
            },
            modeFrame,
            'right',
          )

          topLevelFrame.appendChild(
            createText({
              characters: `${topLevelName}`,
              fontSize: 24,
              fontName: { family: 'Roboto', style: 'Regular' },
            }),
          )

          secondLevelGroups.forEach((thirdLevelGroups, secondLevelName) => {
            const secondLevelFrame = createFrame(
              {
                name: `${secondLevelName}`,
                direction: thirdLevelGroups.size > 1 ? 'HORIZONTAL' : 'VERTICAL',
                horizontalAlign: 'MIN',
                verticalAlign: 'MIN',
                itemSpacing: 5,
                verticalPadding: 5,
                horizontalPadding: 5,
                borderRadius: 8,
              },
              topLevelFrame,
              'right',
            )

            thirdLevelGroups.forEach((variables, thirdLevelName) => {
              const thirdLevelFrame = createFrame(
                {
                  name: `${thirdLevelName}`,
                  direction: 'VERTICAL',
                  horizontalAlign: 'CENTER',
                  verticalAlign: 'MIN',
                  itemSpacing: 2,
                  verticalPadding: 2,
                  horizontalPadding: 2,
                  borderRadius: 4,
                },
                secondLevelFrame,
                'right',
              )

              variables.forEach((variable) => {
                renderDemo(thirdLevelFrame, variable, mode)
              })
            })
          })

          modeFrame.appendChild(topLevelFrame)
        })
      }
    }

    await renderModeFrames(collection)
  }
}

function renderDemo(frame: FrameNode, variable: Variable, mode: { name: string; modeId: string }): Promise<void> {
  const value = variable.valuesByMode[mode.modeId ?? ''] ?? ''
  console.log(variable.resolvedType)
  if (variable.resolvedType === 'COLOR' && isRgb(value)) {
    const color = rgbToHex(value)

    if (color) {
      const colorFrame = createFrame(
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

      Object.assign(colorFrame, {
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
        colorFrame,
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
  }
  //   switch (variable.resolvedType) {
  //     case 'COLOR':
  //       return createPalette(variable, frame)
  //     case 'TEXT':
  //       return createTextFrame(variable, frame)
  //     case 'NUMBER':
  //       return createNumberFrame(variable, frame)
  //     case 'BOOLEAN':
  //       return createBooleanFrame(variable, frame)
  //     case 'ENUM':
  //       return createEnumFrame(variable, frame)
  //     case 'IMAGE':
  //       return createImageFrame(variable, frame)
  //     case 'SHADOW':
  //       return createShadowFrame(variable, frame)
  //     case 'EFFECT':
  //       return createEffectFrame(variable, frame)
  //     default:
  //       return Promise.resolve()
  //   }
}

/*
}
declare type VariableValue = boolean | string | number | RGB | RGBA | VariableAlias
declare type VariableScope =
  | 'ALL_SCOPES'
  | 'TEXT_CONTENT'
  | 'CORNER_RADIUS'
  | 'WIDTH_HEIGHT'
  | 'GAP'
  | 'ALL_FILLS'
  | 'FRAME_FILL'
  | 'SHAPE_FILL'
  | 'TEXT_FILL'
  | 'STROKE_COLOR'
  | 'STROKE_FLOAT'
  | 'EFFECT_FLOAT'
  | 'EFFECT_COLOR'
  | 'OPACITY'
  */
