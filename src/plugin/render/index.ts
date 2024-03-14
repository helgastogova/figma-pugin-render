import { createFrame, createText, getDemoTitle, findPageByName } from '../helpers'

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

function generateNestedPropCombinations(variants: Record<string, Set<string>>): any {
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

function collectPropsVariants(componentSet: ComponentSetNode): VariantsResult {
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
  properties: Record<string, string> // Объект с полным набором свойств
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
}: {
  componentSet: ComponentSetNode
  nestedCombinations: { [key: string]: any }
  parentFrame: FrameNode
  currentPath: string[]
  minWidth: number
  minHeight: number
}) {
  const depthLevel = currentPath.length / 2

  const properties = currentPath.reduce((acc, val, index, array) => {
    if (index % 2 === 0 && array[index + 1] !== undefined) {
      acc[val] = array[index + 1]
    }
    return acc
  }, {})

  const name = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')

  const isLastLevel = Object.keys(nestedCombinations).some(
    (key) => nestedCombinations[key] === 'node' || typeof nestedCombinations[key] === 'string',
  )
  const isFirstLevelWithSingleNesting = depthLevel === 0 && Object.keys(nestedCombinations).length === 1

  Object.entries(nestedCombinations).forEach(([propName, propValues]) => {
    const newPath = [...currentPath, propName]
    if (propName === 'node') {
      const cell = createFrame(
        {
          direction: 'VERTICAL',
          horizontalAlign: 'CENTER',
          verticalAlign: 'CENTER',
          minWidth: minWidth + 20, // it's strange, but i need to plus paddings here
          minHeight: minHeight + 20,
          verticalPadding: 10,
          horizontalPadding: 10,
          layoutAlign: 'STRETCH',
        },
        parentFrame,
      )

      const component = findComponentByProps({ componentSet, properties })

      if (component) {
        const instance = component.createInstance()
        // get name from properties

        instance.name = name
        cell.name = `${name ?? componentSet.name} / ${depthLevel}`
        cell.appendChild(instance)
        parentFrame.appendChild(cell)
      }
      return
    }

    const frame = createFrame(
      {
        name: `${name ?? componentSet.name} / ${depthLevel}`,
        direction:
          ((isLastLevel || isFirstLevelWithSingleNesting) && depthLevel % 2 === 0) || depthLevel === 1
            ? 'HORIZONTAL'
            : 'VERTICAL',
        horizontalAlign: 'CENTER',
        verticalAlign: 'MIN',
        itemSpacing: 50,
      },
      parentFrame,
    )
    parentFrame.appendChild(frame)

    Object.entries(propValues).forEach(([propValue, nestedVariants]) => {
      renderTest({
        componentSet,
        nestedCombinations: nestedVariants,
        parentFrame: frame,
        currentPath: [...newPath, propValue],
        minWidth,
        minHeight,
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

  const { minWidth, minHeight } = componentSet.children.reduce(
    (acc, component) => {
      const { width, height } = component
      return {
        minWidth: Math.max(acc.minWidth, width ?? 0),
        minHeight: Math.max(acc.minHeight, height ?? 0),
      }
    },
    { minWidth: 0, minHeight: 0 },
  )

  const { multipleVariants } = collectPropsVariants(componentSet)

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

  const nestedCombinations = generateNestedPropCombinations(multipleVariants)
  renderTest({ componentSet, nestedCombinations, parentFrame: rootFrame, currentPath: [], minWidth, minHeight })
}
