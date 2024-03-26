import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { TextStyleData } from '../getLocalStyles'

export const renderTextStyles = async (textStyles: TextStyleData, frame: FrameNode): Promise<void> => {
  const demoFrame = createFrame(
    {
      name: 'Demo / Text Styles ',
      direction: 'VERTICAL',
      verticalAlign: 'MIN',
      horizontalAlign: 'MIN',
      itemSpacing: 16,
      verticalPadding: 16,
      horizontalPadding: 16,
    },
    frame,
  )
  demoFrame.appendChild(getDemoTitle('Typography'))

  textStyles.styles?.forEach((item) => {
    demoFrame.appendChild(
      createText({
        characters: item.name,
        textStyleId: item?.id,
      }),
    )
  })
}
