import { createFrame, createText, getDemoTitle } from '@src/plugin/helpers'
import { getCollection } from './getCollection'
import { groupVariablesByNames } from './processData'
import { renderGroupsRecursive } from './render'

type ModeInCollection = { modeId: string; name: string; variables?: Variable[] }

export const renderTokens = async (page: PageNode): Promise<void> => {
  const collections: VariableCollection[] = await getCollection()

  if (collections.length === 0) {
    const noTokensText = createText({
      characters: 'No tokens found',
      fontSize: 24,
      fontName: { family: 'Roboto', style: 'Bold' },
    })
    page.appendChild(noTokensText)
    return
  }

  const modesFrame = createFrame(
    {
      name: `Collections`,
      direction: 'HORIZONTAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      borderRadius: 24,
      verticalPadding: 50,
      horizontalPadding: 50,
      backgroundColor: '#FFFFFF',
    },
    page,
    'right',
  )

  collections.forEach((collection) => {
    collection.modes.forEach((mode: ModeInCollection) => {
      const modeFrame = createFrame(
        {
          name: `Collection ${collection.name} for the ${mode.name} mode`,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 50,
          borderRadius: 24,
          verticalPadding: 50,
          horizontalPadding: 50,
        },
        modesFrame,
        'right',
      )

      const caption = getDemoTitle(`Collection ${collection.name} for the ${mode.name} mode`)
      modeFrame.appendChild(caption)

      const modeFrameWrapper = createFrame(
        {
          name: 'Wrapper for the mode frame',
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 50,
        },
        modeFrame,
      )

      const groupedVariables = groupVariablesByNames([mode])

      if (groupedVariables.size === 0) return
      for (const [groupName, subGroups] of groupedVariables) {
        const subFrame = createFrame(
          {
            name: `Group name: ${groupName}`,
            direction: 'VERTICAL',
            maxWidth: 1430,
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
          },
          modeFrameWrapper,
        )
        groupName !== 'root' &&
          subFrame.appendChild(
            createText({
              characters: `${groupName}`,
              fontSize: 24,
              fontName: { family: 'Roboto', style: 'Bold' },
            }),
          )

        const wrapper = createFrame(
          {
            name: `wrapper for ${groupName}`,
            direction: 'VERTICAL',
            horizontalAlign: 'MIN',
            verticalAlign: 'MIN',
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 30,
          },
          subFrame,
        )

        renderGroupsRecursive({ frame: wrapper, groups: subGroups, mode, topGroupName: groupName })
      }
    })
  })
}
