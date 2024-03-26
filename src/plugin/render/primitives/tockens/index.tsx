import { getCollections } from '../getLocalStyles'
import { createFrame, createText, FrameNode } from '../../../helpers'

interface Variable {
  id: string
  name: string
}

interface VariableCollection {
  id: string
  name: string
  variableIds: string[]
  modes?: { name: string; modeId: string }[]
}

export const generateTokens = async (page: PageNode): Promise<void> => {
  const collections = await getCollections()

  // Функция для группировки переменных по первым двум уровням их названий
  const groupVariables = (variables: Variable[]): Map<string, Map<string, Variable[]>> => {
    const topLevelGroups = new Map<string, Map<string, Variable[]>>()
    variables.forEach((variable) => {
      const [topLevel, subLevel, ...rest] = variable.name.split('/')
      let subLevelName = subLevel
      if (rest.length > 0) {
        subLevelName += '/' + rest.join('/')
      }

      if (!topLevelGroups.has(topLevel)) {
        topLevelGroups.set(topLevel, new Map<string, Variable[]>())
      }
      const subLevelGroups = topLevelGroups.get(topLevel)
      if (!subLevelGroups?.has(subLevelName)) {
        subLevelGroups?.set(subLevelName, [])
      }
      subLevelGroups?.get(subLevelName)?.push(variable)
    })
    return topLevelGroups
  }

  for (const collection of Object.values(collections)) {
    const variables: Variable[] = collection.variableIds.map((id) => figma.variables.getVariableById(id))
    const topLevelGroups = groupVariables(variables)

    // Группировка переменных по режимам и их рендер
    const renderModeFrames = async (collection: VariableCollection) => {
      const modes = collection.modes || [{ name: 'Default', modeId: '' }] // Обеспечиваем наличие режима по умолчанию
      for (const mode of modes) {
        const modeFrame = createFrame(
          {
            name: `${collection.name} / ${mode.name}`,
            direction: 'VERTICAL',
            horizontalAlign: 'CENTER',
            verticalAlign: 'MIN',
            itemSpacing: 50,
            verticalPadding: 30,
            horizontalPadding: 30,
            borderRadius: 24,
          },
          page,
          'right',
        )

        // Рендер подгрупп внутри режимов
        topLevelGroups.forEach((subLevelGroups, topLevelName) => {
          const topLevelFrame = createFrame(
            {
              name: topLevelName,
              direction: 'VERTICAL',
              horizontalAlign: 'CENTER',
              verticalAlign: 'MIN',
              itemSpacing: 10,
              verticalPadding: 10,
              horizontalPadding: 10,
              borderRadius: 12,
            },
            modeFrame,
            'right',
          )

          subLevelGroups.forEach((variables, subLevelName) => {
            const subLevelFrame = createFrame(
              {
                name: subLevelName,
                direction: 'VERTICAL',
                horizontalAlign: 'CENTER',
                verticalAlign: 'MIN',
                itemSpacing: 10,
                verticalPadding: 10,
                horizontalPadding: 10,
                borderRadius: 12,
              },
              topLevelFrame,
              'right',
            )

            variables.forEach((variable) => {
              subLevelFrame.appendChild(createText({ characters: variable.name, fontSize: 14, fontColor: '#000000' }))
            })
          })
        })

        await renderDemo(modeFrame, mode)
      }
    }

    await renderModeFrames(collection)
  }
}

async function renderDemo(frame: FrameNode, mode: { name: string; modeId: string }): Promise<void> {
  console.log(`Rendering demo for mode: ${mode.name} in frame: ${frame.name}`)
}
