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

const generateNestedPropCombinations = (variants: Record<string, string[]>): any => {
  const keys = Object.keys(variants)

  const recursiveGenerate = (index: number, path: string[]): any => {
    if (index === keys.length) {
      return { node: path[path.length - 1] }
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
  singleVariants: Record<string, string[]>
  multipleVariants: Record<string, string[]>
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

const cutName = (name: string): string => {
  return name.split('#')[0]
}

const collectPropsVariants = (component: ComponentNode | ComponentSetNode): VariantsResult => {
  const allPropsVariants: Record<string, string[]> = {}
  const getPropsFromComponentProps = getComponentProperties(component)

  if (!getPropsFromComponentProps) {
    const singleVariants: Record<string, string[]> = {}
    const multipleVariants: Record<string, string[]> = {}

    component.children.forEach((component) => {
      const props = parseComponentProps(component.name)

      Object.entries(props).forEach(([key, value]) => {
        if (!allPropsVariants[key]) {
          allPropsVariants[key] = []
          allPropsVariants[key].push(value)
        }
        if (!allPropsVariants[key].includes(value)) {
          allPropsVariants[key].push(value)
        }
      })
    })
    Object.entries(allPropsVariants).forEach(([key, values]) => {
      // if (key.startsWith('INSTANCE/')) {
      //   instanceSwapVariants[key] = values
      // } else
      if (values.length < 2) {
        singleVariants[key] = values
      } else {
        multipleVariants[key] = values
      }
    })
    return { singleVariants, multipleVariants }
  } else {
    const { singleVariants, multipleVariants } = getPropsFromComponentProps
    return { singleVariants, multipleVariants }
  }
}

export const getComponentProperties = (component: ComponentNode | ComponentSetNode): VariantsResult | null => {
  try {
    let definitions: ComponentPropertyDefinitions

    if (component.type === 'COMPONENT' && component.parent && 'componentPropertyDefinitions' in component.parent) {
      definitions = (component.parent as ComponentSetNode).componentPropertyDefinitions
    } else if ('componentPropertyDefinitions' in component) {
      definitions = component.componentPropertyDefinitions
    }

    const singleVariants: Record<string, string[]> = {}
    const multipleVariants: Record<string, string[]> = {}

    Object.entries(definitions).forEach(([key, item]) => {
      if (!item) return
      const name = cutName(key)
      switch (item.type) {
        case 'VARIANT':
          item.variantOptions.length < 2
            ? (singleVariants[name] = item.variantOptions)
            : (multipleVariants[name] = item.variantOptions)
          break
        case 'BOOLEAN':
          singleVariants[name] = [item.defaultValue ? 'true' : 'false']
          break
        case 'TEXT':
          singleVariants[name] = [item.defaultValue.toString()]
          break
        // case 'INSTANCE_SWAP':
        //   props[`INSTANCE/${name}`] = item.preferredValues
        //   break

        default:
          break
      }
    })
    return { singleVariants, multipleVariants }
  } catch (e) {
    // console.error('Error while getting component properties', e)
    return null
  }
}

function findComponentByProps({
  component,
  properties,
}: {
  component: ComponentSetNode
  properties: Record<string, string>
}): ComponentNode | undefined {
  return component.children.find((node): node is ComponentNode => {
    if (!isComponentNode(node)) return false
    const componentProps = parseComponentProps(node.name)
    return Object.entries(properties).every(([key, value]) => componentProps[key] === value)
  })
}

function renderTest({
  component,
  nestedCombinations,
  parentFrame,
  currentPath = [],
  minWidth,
  minHeight,
  frameName,
  tableRows,
  backgroundColor,
  entriesLength,
}: {
  component: ComponentNode | ComponentSetNode
  nestedCombinations: { [key: string]: any }
  parentFrame: FrameNode
  currentPath: string[]
  minWidth: number
  minHeight: number
  frameName?: string
  tableRows: string[]
  backgroundColor?: string
  entriesLength?: number
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

  if (isComponentNode(component)) {
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

    const componentNode = component as ComponentNode
    const instance = componentNode.createInstance()
    cell.appendChild(instance)
  } else {
    // component
    if (maxDepth === 0 && depthLevel === 0 && component.children.length !== 0) {
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
      component.children.forEach((item) => {
        if (!isComponentNode(item)) return

        const instance = item.createInstance()
        instance.name = item.name
        cell.appendChild(instance)
      })
    }
    if (depthLevel > 0 && depthLevel <= entriesLength - 2 && frameName && entriesLength > 2) {
      parentFrame.appendChild(
        createText({
          characters: frameName,
          fontSize: 28 - 4 * depthLevel,
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
        const item = findComponentByProps({ component, properties })
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

        if (item) {
          const instance = item.createInstance()

          instance.name = name
          cell.name = `${name ?? component.name}`
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
          //direction: isLastOrPenultimateLevel || maxDepth <= 2 || currentPath.length > 3 ? 'HORIZONTAL' : 'VERTICAL', // подумать над этим условием там
          direction: entriesLength - depthLevel <= 1 ? 'HORIZONTAL' : 'VERTICAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'MIN',
          itemSpacing: 50,
          borderRadius: 24,
        },
        parentFrame,
      )

      if (isLastOrPenultimateLevel && depthLevel > entriesLength - 2) {
        const labelFrame = createFrame(
          {
            name: frameName.split(': ')[0],
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
        labelFrame.appendChild(createText({ characters: frameName.split(': ')[1] ?? '', fontSize: 18 }))
      }

      Object.entries(propValues).forEach(([propValue, nestedCombinations]) => {
        renderTest({
          component,
          nestedCombinations,
          parentFrame: frame,
          currentPath: [...newPath, propValue],
          minWidth,
          minHeight,
          frameName: `${propName}: ${propValue}`,
          tableRows,
          backgroundColor,
          entriesLength,
        })
      })
    })
  }
}
interface RenderDemoProps {
  demoPage: PageNode
  component: ComponentSetNode | ComponentNode
  parentFrame?: FrameNode | PageNode
  backgroundColor?: string
}

export const renderDemo = async ({
  demoPage,
  component,
  parentFrame,
  backgroundColor,
}: RenderDemoProps): Promise<void> => {
  if (!component) {
    console.error('Component not found')
    return
  }

  if (!demoPage || demoPage.type !== 'PAGE') {
    console.error('Could not create page for rendering showcases')
    return
  }

  const { minWidth_, minHeight } = component?.children?.reduce(
    (acc, item) => {
      const { width, height } = item
      return {
        minWidth_: Math.max(acc.minWidth_, width ?? 0),
        minHeight: Math.max(acc.minHeight, height ?? 0),
      }
    },
    { minWidth_: 0, minHeight: 0 },
  )

  const minWidth = minWidth_ < 100 ? 100 : minWidth_

  const { multipleVariants } = collectPropsVariants(component)
  const nestedCombinations = generateNestedPropCombinations(multipleVariants)

  const entries = Object.entries(multipleVariants)

  const lastTwoSets = entries.slice(-2)
  const tableHeaders = lastTwoSets.map(([key, set]) => [key, ...Array.from(set)])

  // separate nestedCombinations – first and others

  const rootFrame = createFrame(
    {
      name: `Demo for ${component.name}`,
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

  rootFrame.appendChild(getDemoTitle(component.name))
  const rootInsideFrame = createFrame(
    {
      name: `Demo for ${component.name}`,
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
    component,
    nestedCombinations,
    parentFrame: rootInsideFrame,
    currentPath: [],
    minWidth,
    minHeight,
    frameName: component.name,
    tableRows: tableHeaders[0] ?? [],
    backgroundColor,
    entriesLength: entries.length,
  })

  if (component.description) {
    const descriptionFrame = createFrame(
      {
        name: 'Single properties list',
        direction: 'VERTICAL',
        horizontalAlign: 'MIN',
        verticalAlign: 'MIN',
        verticalPadding: 20,
        layoutAlign: 'STRETCH',
        itemSpacing: 20,
      },
      rootInsideFrame,
    )
    const descriptionText = createText({
      characters: `Description: ${component.description}`,
      fontSize: 18,
      fontName: { family: 'Roboto', style: 'Regular' },
      fontColor: '#555555',
    })

    descriptionFrame.layoutMode = 'VERTICAL'
    descriptionFrame.layoutAlign = 'STRETCH'
    descriptionFrame.appendChild(descriptionText)

    descriptionText.layoutSizingHorizontal = 'FILL'
    descriptionText.layoutSizingVertical = 'HUG'
  }
}
