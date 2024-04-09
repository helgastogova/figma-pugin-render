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
            fontSize: 34,
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
