import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { ColorStyleData } from '../getLocalStyles'

interface CreatePaletteProps {
  style: PaintStyle // Используйте BaseStyle вместо PaintStyle
  frame: FrameNode | PageNode
}

export const createPalette = ({ style, frame }: CreatePaletteProps): void => {
  const paletteWrapper = createFrame(
    {
      name: `Palette / ${style.name} `,
      direction: 'VERTICAL',
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
      minHeight: 140,
      minWidth: 260,
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
      backgroundColor: '#ffffff',
      itemSpacing: 8,
    },
    fillWrapper,
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

  const caption = getDemoTitle('Palette')
  paletteFrame.appendChild(caption)

  const paletteFrameColors = createFrame(
    {
      name: 'Demo / Palette / Colors',
      direction: 'HORIZONTAL',
      wrap: 'WRAP',
      maxWidth: 1364,
      horizontalAlign: 'MIN',
      verticalAlign: 'MIN',
      autoWidth: true,
      autoHeight: true,
      itemSpacing: 16,
    },
    paletteFrame,
  )
  paintStyles.forEach((style) => {
    createPalette({ style, frame: paletteFrameColors })
  })
}
