import { createFrame, createText } from '../helpers'

export const createTableHead = (headings: string[], minWidth?: number) => {
  const tr = createFrame({
    name: 'header',
    direction: 'HORIZONTAL',
    itemSpacing: 50,
  })

  headings.forEach((items, index) => {
    const th = createFrame({
      name: 'cell',
      itemSpacing: 0,
      direction: 'HORIZONTAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'CENTER',
      verticalPadding: 0,
      minWidth: index === 0 ? 200 : minWidth + 40,
      maxWidth: index === 0 ? 200 : minWidth + 40,
    })

    th.appendChild(createText({ characters: items, fontSize: 18 }))
    tr.appendChild(th)
  })

  return tr
}
