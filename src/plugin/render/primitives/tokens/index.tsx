import { createFrame, createText } from '@src/plugin/helpers'
import { getCollection } from './getCollection'
import { groupVariablesByNames } from './processData'
import { renderGroupsRecursive } from './render'

export const generateTokens = async (page: PageNode): Promise<void> => {
  const collections = await getCollection()

  // TODO: add mode support
  collections.forEach((collection) => {
    collection.modes.forEach((mode) => {
      const modeFrame = createFrame(
        {
          name: `Collection ${collection.name} for the ${mode.name} mode`,
          direction: 'HORIZONTAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          autoWidth: true,
          autoHeight: true,
          itemSpacing: 50,
          borderRadius: 24,
          verticalPadding: 50,
          horizontalPadding: 50,
          // backgroundColor: '#FFFFFF',
        },
        page,
      )

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
            autoWidth: true,
            autoHeight: true,
            itemSpacing: 16,
          },
          modeFrame,
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
