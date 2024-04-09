import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { TextStyleData } from '../getLocalStyles'

export const renderTextStyles = async (textStyles: TextStyleData, frame: FrameNode): Promise<void> => {
  const demoFrame = createFrame(
    {
      name: 'Demo / Text Styles',
      direction: 'VERTICAL',
      verticalAlign: 'MIN',
      horizontalAlign: 'MIN',
      itemSpacing: 24,
      verticalPadding: 50,
      horizontalPadding: 50,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
    },
    frame,
  )
  demoFrame.appendChild(getDemoTitle('Typography'))

  for (const item of textStyles.styles ?? []) {
    const fontLine = createFrame(
      {
        name: item.name,
        direction: 'VERTICAL',
        verticalAlign: 'MIN',
        horizontalAlign: 'MIN',
        itemSpacing: 8,
      },
      demoFrame,
    )
    fontLine.appendChild(
      createText({
        characters: item.name,
        textStyleId: item.id,
      }),
    )

    fontLine.appendChild(
      createText({
        characters: `font-size: ${item.item.fontSize}, line-height: ${Math.round(item.item.lineHeight.value)}${item.item.lineHeight.unit === 'PIXELS' ? 'px' : '%'}`,
        fontSize: 16,
        fontColor: '#555555',
      }),
    )
  }
}
