import { createFrame, createText, getDemoTitle } from '../../helpers'
import { createTableHead } from '../../helpers/table'

interface NestedCombinations {
  [key: string]: any
}

function getMaxDepth(nestedCombinations: NestedCombinations): number {
  return Object.values(nestedCombinations).reduce((max: number, child: NestedCombinations | string) => {
    return typeof child === 'object' && child !== null && !child.hasOwnProperty('node')
      ? Math.max(max, 1 + getMaxDepth(child))
      : max
  }, 0)
}

const generateNestedPropCombinations = (variants: Record<string, Set<string>>): any => {
  const keys = Object.keys(variants)

  const recursiveGenerate = (index: number, path: string[]): any => {
    if (index === keys.length) {
      return { node: path[path.length - 1] } // Указываем конечный узел
    }

    const propName = keys[index]
    const result: Record<string, any> = {}

    for (const propValue of variants[propName]) {
      result[propValue] = recursiveGenerate(index + 1, [...path, propName, propValue])
    }

    return { [propName]: result }
  }

  return recursiveGenerate(0, [])
}

interface VariantsResult {
  singleVariants: Record<string, string>
  multipleVariants: Record<string, Set<string>>
}

const collectPropsVariants = (componentSet: ComponentSetNode): VariantsResult => {
  const allPropsVariants: Record<string, Set<string>> = {}

  componentSet.children.forEach((component) => {
    const props = parseComponentProps(component.name)
    Object.entries(props).forEach(([key, value]) => {
      if (!allPropsVariants[key]) {
        allPropsVariants[key] = new Set()
      }
      allPropsVariants[key].add(value)
    })
  })

  const singleVariants: Record<string, string> = {}
  const multipleVariants: Record<string, Set<string>> = {}

  Object.entries(allPropsVariants).forEach(([key, values]) => {
    if (values.size === 1) {
      singleVariants[key] = values.values().next().value
    } else {
      multipleVariants[key] = values
    }
  })

  return { singleVariants, multipleVariants }
}

const parseComponentProps = (name: string): Record<string, string> =>
  name.split(', ').reduce((acc, part) => {
    const [key, value] = part.split('=')
    if (key && value) acc[key.trim()] = value.trim()
    return acc
  }, {})

function isComponentNode(node: SceneNode): node is ComponentNode {
  return node.type === 'COMPONENT'
}

function findComponentByProps({
  componentSet,
  properties,
}: {
  componentSet: ComponentSetNode
  properties: Record<string, string>
}): ComponentNode | undefined {
  return componentSet.children.find((node): node is ComponentNode => {
    if (!isComponentNode(node)) return false
    const componentProps = parseComponentProps(node.name)
    return Object.entries(properties).every(([key, value]) => componentProps[key] === value)
  })
}

function renderTest({
  componentSet,
  nestedCombinations,
  parentFrame,
  currentPath = [],
  minWidth,
  minHeight,
  frameName,
  tableRows,
  backgroundColor,
}: {
  componentSet: ComponentSetNode
  nestedCombinations: { [key: string]: any }
  parentFrame: FrameNode
  currentPath: string[]
  minWidth: number
  minHeight: number
  frameName?: string
  tableRows: string[]
  backgroundColor?: string
}) {
  const depthLevel = currentPath.length / 2
  const maxDepth = getMaxDepth(nestedCombinations)

  // component
  if (maxDepth === 0 && depthLevel === 0 && componentSet.children.length !== 0) {
    const cell = createFrame(
      {
        name: 'Component variants',
        direction: 'HORIZONTAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'CENTER',
        verticalPadding: 20,
        horizontalPadding: 20,
        layoutAlign: 'STRETCH',
        itemSpacing: 20,
        backgroundColor,
      },
      parentFrame,
    )
    componentSet.children.forEach((component) => {
      if (!isComponentNode(component)) return
      const instance = component.createInstance()
      instance.name = component.name
      cell.appendChild(instance)
    })
  }

  const isLastOrPenultimateLevel = depthLevel >= maxDepth - 1
  const properties = currentPath?.reduce((acc, val, index, array) => {
    if (index % 2 === 0 && array[index + 1] !== undefined) {
      acc[val] = array[index + 1]
    }
    return acc
  }, {})

  if (!isLastOrPenultimateLevel && frameName && depthLevel > 0) {
    parentFrame.appendChild(
      createText({
        characters: frameName,
        fontSize: 18,
        fontColor: '#777',
        textAlignHorizontal: 'CENTER',
        layoutAlign: 'STRETCH',
      }),
    )
  }

  const name = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')

  Object.entries(nestedCombinations).forEach(([propName, propValues]) => {
    const newPath = [...currentPath, propName]

    if (propName === 'node') {
      const component = findComponentByProps({ componentSet, properties })
      const cell = createFrame(
        {
          direction: 'VERTICAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'CENTER',
          minWidth: minWidth + 40, // it's strange, but i need to plus paddings here
          minHeight: minHeight + 40,
          verticalPadding: 20,
          horizontalPadding: 20,
          layoutAlign: 'STRETCH',
          backgroundColor,
        },
        parentFrame,
      )

      if (component) {
        const instance = component.createInstance()

        instance.name = name
        cell.name = `${name ?? componentSet.name}`
        cell.appendChild(instance)
        parentFrame.appendChild(cell)
      } else {
        cell.appendChild(
          createText({
            characters: 'N/A',
            fontSize: 18,
            fontColor: '#999',
          }),
        )
      }
      return
    }

    const frame = createFrame(
      {
        name: frameName,
        direction: isLastOrPenultimateLevel || maxDepth <= 2 || currentPath.length > 3 ? 'HORIZONTAL' : 'VERTICAL', // подумать над этим условием там
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        itemSpacing: 50,
        borderRadius: 24,
      },
      parentFrame,
    )

    if (isLastOrPenultimateLevel) {
      const labelFrame = createFrame(
        {
          name: frameName.split('=')[0],
          horizontalAlign: 'CENTER',
          verticalAlign: 'CENTER',
          // minWidth: minWidth + 40,
          minWidth: 200,
          minHeight: minHeight + 40,
          borderRadius: 24,
        },
        frame,
      )

      frame.appendChild(labelFrame)
      labelFrame.appendChild(createText({ characters: frameName.split('=')[1] ?? '', fontSize: 18 }))
    }

    Object.entries(propValues).forEach(([propValue, nestedCombinations]) => {
      renderTest({
        componentSet,
        nestedCombinations,
        parentFrame: frame,
        currentPath: [...newPath, propValue],
        minWidth,
        minHeight,
        frameName: `${propName}=${propValue}`,
        tableRows,
        backgroundColor,
      })
    })
  })
}
interface RenderDemoProps {
  demoPage: PageNode
  componentSet: ComponentSetNode
  parentFrame?: FrameNode | PageNode
  backgroundColor?: string
}

export const renderDemo = async ({
  demoPage,
  componentSet,
  parentFrame,
  backgroundColor,
}: RenderDemoProps): Promise<void> => {
  if (!componentSet) {
    console.error('Component Set not found')
    return
  }

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Could not create page for rendering showcases')
    return
  }

  const { minWidth_, minHeight } = componentSet?.children?.reduce(
    (acc, component) => {
      const { width, height } = component
      return {
        minWidth_: Math.max(acc.minWidth_, width ?? 0),
        minHeight: Math.max(acc.minHeight, height ?? 0),
      }
    },
    { minWidth_: 0, minHeight: 0 },
  )

  const minWidth = minWidth_ < 100 ? 100 : minWidth_

  const { multipleVariants } = collectPropsVariants(componentSet)
  const nestedCombinations = generateNestedPropCombinations(multipleVariants)

  const entries = Object.entries(multipleVariants)

  const lastTwoSets = entries.slice(-2)
  const tableHeaders = lastTwoSets.map(([key, set]) => [key, ...Array.from(set)])

  const rootFrame = createFrame(
    {
      name: `Demo for ${componentSet.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      verticalPadding: 50,
      horizontalPadding: 50,
      borderRadius: 24,
      backgroundColor: '#fff',
    },
    parentFrame ?? demoPage,
  )

  rootFrame.appendChild(getDemoTitle(componentSet.name))
  const rootInsideFrame = createFrame(
    {
      name: `Demo for ${componentSet.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      verticalPadding: 30,
      horizontalPadding: 30,
      borderRadius: 24,
    },
    demoPage,
  )
  rootFrame.appendChild(rootInsideFrame)
  if (lastTwoSets.length > 1) tableHeaders[1][0] = `${tableHeaders[0][0]} / ${tableHeaders[1][0]}`
  const showHeadersArray = tableHeaders[1] ?? tableHeaders[0]

  if (showHeadersArray) rootInsideFrame.appendChild(createTableHead(showHeadersArray, minWidth))

  renderTest({
    componentSet,
    nestedCombinations,
    parentFrame: rootInsideFrame,
    currentPath: [],
    minWidth,
    minHeight,
    frameName: componentSet.name,
    tableRows: tableHeaders[0] ?? [],
    backgroundColor,
  })
}
