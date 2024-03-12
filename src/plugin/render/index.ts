import { createFrame, createText, getDemoTitle, findPageByName } from '../helpers'
import { hexToRgb } from '../helpers/colors'
import { createTableHead } from '../helpers/table'

interface ComponentSetNode {
  children: ComponentNode[]
}

interface ComponentNode {
  name: string
  type: string
  createInstance(): any // Assuming the return type of createInstance is any
  width?: number // Adding optional width property to the ComponentNode interface
}

interface RenderDemoProps {
  componentSet: ComponentSetNode
  name: string
}

export const renderDemo = ({ componentSet, name }: RenderDemoProps) => {
  const demoPage = findPageByName('Component Sets [Demo]')

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Component Sets [Demo] page not found or not a page')
    return
  }

  const propVariants: { [key: string]: string[] } = {}

  // Extracting prop variants from component names
  componentSet.children.forEach((component) => {
    extractPropVariants(component.name, propVariants)
  })

  console.log(propVariants)

  // Determine the maximum width among components
  let minWidth = 0
  componentSet.children.forEach((component) => {
    const componentWidth = component.width || 0
    if (componentWidth > minWidth) {
      minWidth = componentWidth
    }
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
      verticalAlign: 'MIN',
      layoutAlign: 'STRETCH',
    },
    demoPage,
  )

  headersFrame.strokes = [{ type: 'SOLID', color: hexToRgb('#EFEFEF') }]

  // Creating table headers dynamically based on prop variants
  Object.keys(propVariants).forEach((propName) => {
    const propValues = propVariants[propName]
    const header = createTableHead([propName, ...propValues], minWidth)
    headersFrame.appendChild(header)
  })

  tableInsideFrame.appendChild(headersFrame)

  const tableBody = createFrame(
    {
      name: `TableBody`,
      direction: 'HORIZONTAL',
      verticalAlign: 'MIN',
      horizontalAlign: 'MIN',
      borderRadius: 12,
      verticalPadding: 16,
      horizontalPadding: 16,
      autoWidth: true,
      layoutAlign: 'STRETCH',
      itemSpacing: 10,
    },
    demoPage,
  )

  // Creating service cell with prop name
  Object.keys(propVariants).forEach((propName) => {
    const serviceCell = createFrame(
      {
        name: `ServiceCell / ${propName}`,
        minWidth,
        direction: 'VERTICAL',
        verticalAlign: 'MIN',
        horizontalAlign: 'CENTER',
        layoutAlign: 'STRETCH',
      },
      demoPage,
    )
    serviceCell.appendChild(
      createText({
        characters: propName,
        fontSize: 12,
      }),
    )
    tableBody.appendChild(serviceCell)
  })

  // Creating table rows dynamically for each component
  componentSet.children.forEach((component) => {
    const rowFrame = createFrame(
      {
        name: `Row / ${component.name}`,
        direction: 'HORIZONTAL',
        horizontalAlign: 'MIN',
        layoutAlign: 'STRETCH',
        minWidth: component.width || minWidth,
        minHeight: 200,
      },
      demoPage,
    )

    Object.entries(propVariants).forEach(([propName, propValues]) => {
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

      const matchingPropValue = parseComponentName(component.name)[propName]

      const instance = component.createInstance()
      instance.name = `${component.name} / ${propName}: ${matchingPropValue}`
      cellFrame.appendChild(instance)

      rowFrame.appendChild(cellFrame)
    })

    tableBody.appendChild(rowFrame)
  })

  tableInsideFrame.appendChild(tableBody)
  tableFrame.appendChild(tableInsideFrame)
  demoPage.appendChild(tableFrame)
}

// Helper function to extract prop variants recursively
const extractPropVariants = (name: string, propVariants: { [key: string]: string[] }) => {
  const props = name.split(', ').map((prop) => prop.split('='))
  props.forEach(([key, value]) => {
    if (!propVariants[key]) {
      propVariants[key] = []
    }
    if (!propVariants[key].includes(value)) {
      propVariants[key].push(value)
    }
  })
}

// Helper function to parse component name and return an object of props and values
const parseComponentName = (name: string) => {
  const props: { [key: string]: string } = {}
  const propPairs = name.split(', ')
  propPairs.forEach((pair) => {
    const [key, value] = pair.split('=')
    props[key] = value
  })
  return props
}
