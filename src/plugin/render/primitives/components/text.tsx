import { createFrame, createText, getDemoTitle } from '@src/plugin/helpers'
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

  const groupedTextStyles = textStyles.styles.reduce((acc, style) => {
    const groupName = style.name.split('/')[0].trim()
    acc[groupName] = acc[groupName] || []
    acc[groupName].push(style)
    return acc
  }, {})

  groupedTextStyles &&
    Object.keys(groupedTextStyles).forEach((key) => {
      const groupFrame = createFrame(
        {
          name: key,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          verticalPadding: 16,
          horizontalPadding: 16,
          borderRadius: 8,
          backgroundColor: '#ffffff',
        },
        demoFrame,
      )

      groupFrame.appendChild(getDemoTitle(key))

      groupedTextStyles[key].forEach((item) => {
        const fontLine = createFrame(
          {
            name: item.name,
            direction: 'VERTICAL',
            autoWidth: true,
            verticalAlign: 'MIN',
            horizontalAlign: 'MIN',
            itemSpacing: 8,
          },
          groupFrame,
        )
        fontLine.appendChild(
          createText({
            characters: item.name,
            // textStyleId: item.id,
          }),
        )

        const { description, fontSize, lineHeight } = item.item

        fontLine.appendChild(
          createText({
            characters: `font-size: ${fontSize}, line-height: ${getLineHeight(lineHeight)}`,
            fontSize: 16,
            fontColor: '#555555',
          }),
        )

        if (!description) return

        const descriptionText = createText({
          characters: `Description: ${description}`,
          fontSize: 18,
          fontName: { family: 'Roboto', style: 'Regular' },
          fontColor: '#555555',
        })

        fontLine.layoutMode = 'VERTICAL'
        fontLine.layoutAlign = 'STRETCH'
        fontLine.appendChild(descriptionText)

        descriptionText.layoutSizingHorizontal = 'FILL'
        descriptionText.layoutSizingVertical = 'HUG'
      })
    })
}

const getLineHeight = (lineHeight: LineHeight): string => {
  if (lineHeight.unit === 'AUTO') {
    return 'auto'
  }

  const lineHeightValue = Math.round(lineHeight.value * 100) / 100

  return lineHeight.unit === 'PIXELS' ? `${lineHeightValue}px` : `${lineHeightValue}%`
}
