import { createFrame, createText, getDemoTitle } from '@src/plugin/helpers'
import { ColorStyleData } from '../getLocalStyles'
import { rgbToHex } from '@src/plugin/helpers/colors'

interface CreatePaletteProps {
  style: PaintStyle
  frame: FrameNode | PageNode
}

export const createPalette = ({ style, frame }: CreatePaletteProps): void => {
  const paletteWrapper = createFrame(
    {
      name: `Palette / ${style.name} `,
      direction: 'HORIZONTAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      itemSpacing: 8,
      verticalPadding: 8,
    },
    frame,
  )

  const fillWrapper = createFrame(
    {
      name: 'Fill',
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      borderRadius: 8,
      verticalPadding: 8,
      horizontalPadding: 8,
      backgroundColor: '#ffffff',
      minHeight: 60,
      minWidth: 60,
    },
    paletteWrapper,
  )

  Object.assign(fillWrapper, {
    fills: style.paints,
    strokeWeight: 1,
    strokes: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }],
  })

  const textWrapper = createFrame(
    {
      name: `Color: ${style.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      borderRadius: 6,
      verticalPadding: 8,
      horizontalPadding: 16,
      itemSpacing: 8,
    },
    paletteWrapper,
  )

  const hex = style?.paints[0]?.type === 'SOLID' ? rgbToHex(style.paints[0].color) : ''

  hex &&
    textWrapper.appendChild(
      createText({
        characters: hex,
        fontSize: 24,
        fontName: { family: 'Roboto', style: 'Bold' },
      }),
    )

  textWrapper.appendChild(
    createText({
      characters: style.name,
      fontSize: 18,
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )

  // findAndSetStyle(style.paints, paletteWrapper) // fix that
}

export const renderColorStyles = async (colorStyles: ColorStyleData, frame: FrameNode): Promise<void> => {
  const paintStyles = colorStyles.styles

  const paletteFrame = createFrame(
    {
      name: 'Demo / Palette',
      direction: 'VERTICAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      verticalPadding: 32,
      horizontalPadding: 32,
      borderRadius: 8,
    },
    frame,
  )

  const caption = getDemoTitle('Palette / Colors (Local styles)')
  paletteFrame.appendChild(caption)

  const paletteFrameColors = createFrame(
    {
      name: 'Demo / Palette / Colors',
      direction: 'HORIZONTAL',
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      itemSpacing: 16,
    },
    paletteFrame,
  )

  const groupedPaintStyles = paintStyles.reduce((acc, style) => {
    const groupName = style.name.split('/')[0].trim()
    acc[groupName] = acc[groupName] || []
    acc[groupName].push(style)
    return acc
  }, {})

  groupedPaintStyles &&
    Object.keys(groupedPaintStyles).forEach((key) => {
      const groupFrame = createFrame(
        {
          name: key,
          direction: 'VERTICAL',
          horizontalAlign: 'MIN',
          verticalAlign: 'MIN',
          itemSpacing: 16,
          verticalPadding: 16,
          horizontalPadding: 16,
          borderRadius: 8,
          backgroundColor: '#ffffff',
        },
        paletteFrameColors,
      )

      groupedPaintStyles[key].forEach((style) => {
        createPalette({ style, frame: groupFrame })
      })
    })
}
