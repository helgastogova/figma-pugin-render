import { createFrame, createText } from '../helpers'

export const createTableHead = (headings: string[], minWidth?: number) => {
  const tr = createFrame({
    name: 'tr',
    direction: 'HORIZONTAL',
    itemSpacing: 0,
  })

  headings.forEach((items) => {
    const th = createFrame({
      name: 'th',
      verticalPadding: 8,
      itemSpacing: 0,
      direction: 'HORIZONTAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      minWidth,
    })

    th.appendChild(createText({ characters: items }))
    tr.appendChild(th)
  })

  return tr
}
