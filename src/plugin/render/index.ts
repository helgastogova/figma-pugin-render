import { createFrame, createText, getDemoTitle, findPageByName } from '../helpers'
import { hexToRgb } from '../helpers/colors'

interface ComponentSetNode {
  children: ComponentNode[]
}

interface ComponentNode {
  name: string
  type: string
  createInstance: () => InstanceNode
  width?: number
}

interface RenderDemoProps {
  componentSet: ComponentSetNode
  name: string
  minWidth: number
}

// Собирает все варианты свойств из набора компонентов
interface VariantsResult {
  singleVariants: Record<string, string>
  multipleVariants: Record<string, Set<string>>
}

function collectPropsVariants(componentSet: ComponentSetNode): VariantsResult {
  const allPropsVariants: Record<string, Set<string>> = {}

  // Сбор всех вариантов свойств
  componentSet.children.forEach((component) => {
    const props = parseComponentProps(component.name)
    Object.entries(props).forEach(([key, value]) => {
      if (!allPropsVariants[key]) {
        allPropsVariants[key] = new Set()
      }
      allPropsVariants[key].add(value)
    })
  })

  // Разделение на одиночные и множественные варианты
  const singleVariants: Record<string, string> = {}
  const multipleVariants: Record<string, Set<string>> = {}

  Object.entries(allPropsVariants).forEach(([key, values]) => {
    if (values.size === 1) {
      // Для свойств с одним значением преобразуем Set в строку
      singleVariants[key] = Array.from(values)[0]
    } else {
      // Для свойств с несколькими значениями сохраняем Set
      multipleVariants[key] = values
    }
  })

  return {
    singleVariants,
    multipleVariants,
  }
}

// Анализирует название компонента и извлекает свойства
function parseComponentProps(name: string): Record<string, string> {
  const props: Record<string, string> = {}
  name.split(', ').forEach((part) => {
    const [key, value] = part.split('=')
    props[key.trim()] = value.trim()
  })
  return props
}

// Тип для хранения вариантов свойств

export const renderTableWithPropsPerRow = (
  componentSet: ComponentSetNode,
  demoPage: PageNode,
  name: string,
  minWidth: number,
) => {
  // Собираем варианты свойств для компонентов
  const { multipleVariants, singleVariants } = collectPropsVariants(componentSet)

  // Создаём фрейм таблицы
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
      strokes: [{ type: 'SOLID', color: hexToRgb('#EFEFEF') }],
    },
    demoPage,
  )

  // Для каждого свойства создаём строку
  Object.entries(multipleVariants).forEach(([propName, variants]) => {
    // Создание шапки для текущего свойства
    const propHeaderFrame = createFrame(
      {
        name: 'Headers',
        direction: 'HORIZONTAL',
        borderRadius: 12,
        verticalAlign: 'CENTER',
        layoutAlign: 'STRETCH',
        itemSpacing: 10,
      },
      demoPage,
    )

    const propHeader = createFrame({
      name: propName,
      verticalPadding: 8,
      itemSpacing: 0,
      direction: 'HORIZONTAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      minWidth,
    })
    propHeader.appendChild(createText({ characters: propName }))
    propHeaderFrame.appendChild(propHeader)

    // Создание ячеек для вариантов свойства
    variants.forEach((variant) => {
      const variantCell = createFrame({
        name: propName,
        verticalPadding: 8,
        itemSpacing: 0,
        direction: 'HORIZONTAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        minWidth,
      })
      variantCell.appendChild(createText({ characters: variant }))

      propHeaderFrame.appendChild(variantCell)
    })

    tableFrame.appendChild(propHeaderFrame)

    const rowFrame = createFrame(
      {
        name: `row / ${propName}`,
        direction: 'HORIZONTAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        itemSpacing: 10,
      },
      demoPage,
    )

    rowFrame.appendChild(
      createFrame(
        {
          direction: 'HORIZONTAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          minWidth,
          minHeight: 100,
        },
        demoPage,
      ),
    )

    variants.forEach((variant) => {
      const cellFrame = createFrame(
        {
          name: `cell / ${propName}`,
          direction: 'HORIZONTAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          minWidth,
          minHeight: 100,
        },
        demoPage,
      )
      // Ищем компонент с текущим свойством и вариантом
      const component = componentSet.children.find(
        (child) => child.type === 'COMPONENT' && parseComponentProps(child.name)[propName] === variant,
      )

      if (component) {
        const instance = component.createInstance()
        // Добавляем инстанс в ячейку строки
        cellFrame.appendChild(instance)
      } else {
        // Если инстанс не найден, добавляем плейсхолдер
        const placeholder = createText({
          characters: 'N/A',
        })
        cellFrame.appendChild(placeholder)
      }
      rowFrame.appendChild(cellFrame)
    })

    tableFrame.appendChild(rowFrame)
  })

  demoPage.appendChild(tableFrame)
}

export const renderDemo = ({ componentSet, name, minWidth }: RenderDemoProps): void => {
  if (!componentSet) {
    console.error('Component Set not found')
    return
  }
  const demoPage = findPageByName('Component Sets [Demo]')

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Component Sets [Demo] page not found or not a page')
    return
  }

  renderTableWithPropsPerRow(componentSet, demoPage, name, minWidth)
}
