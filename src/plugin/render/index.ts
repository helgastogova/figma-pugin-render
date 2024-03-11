// Предполагается, что эти функции импортированы из соответствующих файлов
import { createFrame, getDemoTitle, createText, findPageByName } from '../helpers'
import { hexToRgb } from '../helpers/colors'
import { createTableHead } from '../helpers/table'

interface ComponentPropVariants {
  [propName: string]: string[]
}

interface RenderDemoProps {
  componentSet: ComponentSetNode
  name: string
  minWidth: number
  propVariants: ComponentPropVariants
}

export const renderDemo = ({ componentSet, name, minWidth }: RenderDemoProps) => {
  const demoPage = findPageByName('Component Sets [Demo]')

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Component Sets [Demo] page not found or not a page')
    return
  }

  const propVariants: PropVariant = {}

  componentSet.children.forEach((component) => {
    const props = component.name.split(', ').map((prop) => prop.split('='))
    props.forEach(([key, value]) => {
      if (!propVariants[key]) {
        propVariants[key] = []
      }
      if (!propVariants[key].includes(value)) {
        propVariants[key].push(value)
      }
    })
  })

  const tableFrame = createFrame(
    {
      name: `Table / ${name}`,
      direction: 'VERTICAL',
      verticalAlign: 'MIN',
      horizontalAlign: 'MIN',
      borderRadius: 12,
      verticalPadding: 16,
      horizontalPadding: 16,
      autoWidth: true,
      layoutAlign: 'STRETCH',
    },
    demoPage,
  )

  tableFrame.appendChild(getDemoTitle(name))

  const tableInsideFrame = createFrame(
    {
      name: `Table / inside`,
      direction: 'VERTICAL',
      verticalAlign: 'MIN',
      verticalPadding: 8,
      horizontalPadding: 8,
      borderRadius: 12,
      autoWidth: true,
    },
    demoPage,
  )

  const headersFrame = createFrame(
    {
      name: 'Headers',
      direction: 'HORIZONTAL',
      borderRadius: 12,
      verticalAlign: 'CENTER',
      layoutAlign: 'STRETCH',
    },
    demoPage,
  )

  headersFrame.strokes = [{ type: 'SOLID', color: hexToRgb('#EFEFEF') }]

  Object.keys(propVariants).forEach((propName) => {
    const propValues = propVariants[propName]
    const header = createTableHead([propName, ...propValues], minWidth)
    headersFrame.appendChild(header)
  })

  tableInsideFrame.appendChild(headersFrame)

  // Создание тела таблицы
  componentSet.children.forEach((component) => {
    const rowFrame = createFrame(
      {
        name: `Row / ${component.name}`,
        direction: 'HORIZONTAL',
        horizontalAlign: 'CENTER',
        layoutAlign: 'STRETCH',
        minWidth,
      },
      demoPage,
    )

    Object.keys(propVariants).forEach((propName) => {
      const cellFrame = createFrame(
        {
          name: `Cell / ${propName}`,
          direction: 'VERTICAL',
          verticalAlign: 'MIN',
          horizontalAlign: 'CENTER',
          layoutAlign: 'STRETCH',
        },
        demoPage,
      )

      // В зависимости от того, как вы хотите представить значения свойств, здесь может быть разная логика
      // Например, просто создаем текстовый блок с именем варианта свойства
      propVariants[propName].forEach((variant) => {
        const variantText = createText(
          {
            characters: `${propName}: ${variant}`,
            textAlignHorizontal: 'CENTER',
          },
          demoPage,
        )

        cellFrame.appendChild(variantText)
      })

      rowFrame.appendChild(cellFrame)
    })

    tableInsideFrame.appendChild(rowFrame)
  })

  demoPage.appendChild(tableFrame)
}
