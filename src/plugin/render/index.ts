import { createFrame, createText, getDemoTitle, findPageByName } from '../helpers'
import { createTableHead } from '../helpers/table'
//createText
interface RenderDemoProps {
  componentSet: any
}

function getMaxDepth(nestedCombinations: any): number {
  let maxDepth = 0

  function explore(node: any, currentDepth: number) {
    if (typeof node !== 'object' || node === null || node.hasOwnProperty('node')) {
      maxDepth = Math.max(maxDepth, currentDepth)
      return
    }

    Object.values(node).forEach((child) => {
      explore(child, currentDepth + 1)
    })
  }

  explore(nestedCombinations, 0)
  return maxDepth
}

export function generateNestedPropCombinations(variants: Record<string, Set<string>>): any {
  const keys = Object.keys(variants)
  const nestedResults: any = {}

  function helper(path: (string | number)[], index: number) {
    if (index === keys.length) {
      let currentLevel = nestedResults

      for (let i = 0; i < path.length - 1; i += 2) {
        const propName = path[i]
        const propValue = path[i + 1]

        if (!currentLevel[propName]) {
          currentLevel[propName] = {}
        }

        if (!currentLevel[propName][propValue]) {
          currentLevel[propName][propValue] = {}
        }

        currentLevel = currentLevel[propName][propValue]
      }

      currentLevel['node'] = path[path.length - 1]
      return
    }

    const currentKey = keys[index]
    variants[currentKey].forEach((variant) => {
      helper([...path, currentKey, variant], index + 1)
    })
  }

  helper([], 0)
  return nestedResults
}

interface VariantsResult {
  singleVariants: Record<string, string>
  multipleVariants: Record<string, Set<string>>
}

export function collectPropsVariants(componentSet: ComponentSetNode): VariantsResult {
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
      singleVariants[key] = Array.from(values)[0]
    } else {
      multipleVariants[key] = values
    }
  })

  return {
    singleVariants,
    multipleVariants,
  }
}

function parseComponentProps(name: string): Record<string, string> {
  const props: Record<string, string> = {}
  name.split(', ').forEach((part) => {
    const [key, value] = part.split('=')
    if (key && value) {
      props[key.trim()] = value.trim()
    }
  })
  return props
}

function findComponentByProps({
  componentSet,
  properties,
}: {
  componentSet: ComponentSetNode
  properties: Record<string, string>
}): ComponentNode | undefined {
  return componentSet.children.find((component) => {
    const componentProps = parseComponentProps(component.name)
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
}: {
  componentSet: ComponentSetNode
  nestedCombinations: { [key: string]: any }
  parentFrame: FrameNode
  currentPath: string[]
  minWidth: number
  minHeight: number
  frameName?: string
  tableRows: string[]
}) {
  const depthLevel = currentPath.length / 2
  const maxDepth = getMaxDepth(nestedCombinations)

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
          backgroundColor: '#f0f0f0',
        },
        parentFrame,
      )

      if (component) {
        const instance = component.createInstance()

        instance.name = name
        cell.name = `${name ?? componentSet.name} / ${isLastOrPenultimateLevel}`
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
        direction: isLastOrPenultimateLevel || maxDepth <= 2 ? 'HORIZONTAL' : 'VERTICAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        itemSpacing: 50,
      },
      parentFrame,
    )

    if (isLastOrPenultimateLevel) {
      const labelFrame = createFrame(
        {
          name: frameName.split('=')[0],
          horizontalAlign: 'CENTER',
          verticalAlign: 'CENTER',
          minWidth: minWidth + 40,
          minHeight: minHeight + 40,
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
      })
    })
  })
}

export const renderDemo = ({ componentSet }: RenderDemoProps): void => {
  if (!componentSet) {
    console.error('Component Set not found')
    return
  }
  const demoPage = findPageByName('Component Sets [Demo]')

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Component Sets [Demo] page not found or not a page')
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
  const tableHeaders =
    lastTwoSets.length > 1
      ? lastTwoSets.map(([key, set]) => [key, ...Array.from(set)])
      : lastTwoSets.map(([, set]) => Array.from(set))

  const rootFrame = createFrame(
    {
      name: `Demo for ${componentSet.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 50,
      verticalPadding: 50,
      horizontalPadding: 50,
    },
    demoPage,
  )

  rootFrame.appendChild(getDemoTitle(componentSet.name))
  const rootInsideFrame = createFrame(
    {
      name: `Demo for ${componentSet.name}`,
      direction: 'VERTICAL',
      horizontalAlign: 'CENTER',
      verticalAlign: 'MIN',
      itemSpacing: 20,
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
  })
}
