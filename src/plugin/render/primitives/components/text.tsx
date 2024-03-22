import { createFrame, createText, getDemoTitle } from '../../../helpers'
import { StyleData } from '../../../helpers/scripts/getLocalStyles'

export const renderTextStyles = async (textStyles: StyleData, page: PageNode): Promise<void> => {
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
    page,
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

  page.appendChild(demoFrame)
}
