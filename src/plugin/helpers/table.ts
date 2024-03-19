import { createFrame, createText } from '../helpers'

export const createTableHead = (headings: string[], minWidth?: number) => {
  const tr = createFrame({
    name: 'tr',
    direction: 'HORIZONTAL',
    itemSpacing: 50,
  })

  headings.forEach((items) => {
    const th = createFrame({
      name: 'th',
      itemSpacing: 0,
      direction: 'HORIZONTAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'CENTER',
      verticalPadding: 0,
      minWidth: minWidth + 40,
      maxWidth: minWidth + 40,
      fobtSize: 18,
    })

    th.appendChild(createText({ characters: items, fontSize: 18 }))
    tr.appendChild(th)
  })

  return tr
}
