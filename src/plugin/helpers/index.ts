import { getLayoutProps, LayoutsProps } from '../layouts'
import { findAndSetStyle } from './colors'

export const createFrame = (
  props: LayoutsProps,
  page?: PageNode | FrameNode,
  direction: 'right' | 'bottom' = 'bottom',
): FrameNode => {
  const currentPage = (page as PageNode) ?? (figma.currentPage as PageNode)
  const frame: FrameNode = figma.createFrame()

  Object.assign(frame, getLayoutProps(props))

  if (props.backgroundColor) {
    findAndSetStyle(props.backgroundColor, frame)
  }

  if (direction === 'bottom') {
    const maxY = currentPage.children
      .filter((node): node is FrameNode => node.type === 'FRAME')
      .reduce((max, current) => Math.max(max, current.y + current.height), 0)

    frame.y = maxY + 100
  }

  if (direction === 'right') {
    const maxX = currentPage.children
      .filter((node): node is FrameNode => node.type === 'FRAME')
      .reduce((max, current) => Math.max(max, current.x + current.width), 0)

    frame.x = maxX + 100
  }

  currentPage.appendChild(frame)

  return frame
}

const createOneColumnBlock = () => {
  const oneColumnBlock = createFrame({
    name: 'One Column Block',
    direction: 'VERTICAL',
    horizontalAlign: 'MIN',
    verticalAlign: 'MIN',
    autoWidth: true,
    autoHeight: true,
  })

  return oneColumnBlock
}

export const createLayoutBlocks = () => {
  const blocksFrame = createFrame({
    name: 'Blocks',
    direction: 'HORIZONTAL',
    horizontalAlign: 'MIN',
    verticalAlign: 'MIN',
    verticalPadding: 16,
    horizontalPadding: 16,
    itemSpacing: 16,
    borderRadius: 8,
  })

  blocksFrame.resize(1280, 832)

  figma.currentPage.appendChild(blocksFrame)
  blocksFrame.appendChild(createOneColumnBlock())
}

export const getDemoTitle = (text: string): FrameNode => {
  const blocksFrame = createFrame({
    name: `Title / ${text}`,
    direction: 'HORIZONTAL',
    horizontalAlign: 'MIN',
    verticalAlign: 'MIN',
    verticalPadding: 16,
    horizontalPadding: 16,
  })

  blocksFrame.appendChild(
    createText({
      characters: text,
      fontSize: 42,
      fontColor: '#000000',
      fontName: { family: 'Roboto', style: 'Regular' },
    }),
  )

  return blocksFrame
}

interface CreateTextProps {
  name?: string
  characters?: string
  fontSize?: number
  fontColor?: string
  fontName?: { family: string; style: string }
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
  textStyleId?: string
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT'
  layoutAlign?: 'STRETCH' | 'INHERIT'
}

export const createText = ({
  characters,
  fontSize = 14,
  fontColor = '#000000',
  textAlignHorizontal = 'LEFT',
  fontName,
  textAlignVertical = 'TOP',
  textStyleId = '',
  textAutoResize = 'WIDTH_AND_HEIGHT',
  layoutAlign = 'INHERIT',
}: CreateTextProps): TextNode => {
  const text = figma.createText()

  Object.assign(text, {
    fontName: fontName ?? { family: 'Roboto', style: 'Regular' },
    characters: characters ?? 'Text Block',
    fontSize,
    textAlignHorizontal,
    textAlignVertical,
    textStyleId,
    layoutAlign,
  })
  text.textAutoResize = textAutoResize

  findAndSetStyle(fontColor, text)

  return text
}

export function findAllComponents(node: BaseNode, components: ComponentNode[] = []): ComponentNode[] {
  if (node.type === 'COMPONENT') {
    components.push(node as ComponentNode)
  }

  if ('children' in node) {
    for (const child of node.children) {
      findAllComponents(child, components)
    }
  }

  return components
}

export function findComponentByName(name: string, node: BaseNode): ComponentNode | null {
  if (node.name === name) {
    return node as ComponentNode
  }

  if ('children' in node) {
    for (const child of node.children) {
      const found = findComponentByName(name, child)
      if (found) return found
    }
  }
  return null
}

export const findPageByName = (name: 'Component Sets [Demo]') => {
  let pageName = ''
  if (name === 'Component Sets [Demo]') pageName = 'Component Sets [Demo]'
  if (!pageName) return figma.currentPage
  return figma.root.findOne((node) => node.name === pageName) ?? figma.currentPage
}

//
export const hasChildren = (node: BaseNode): node is BaseNode & ChildrenMixin => Boolean(node['children'])

interface MinimalEffectMixin {
  effects: ReadonlyArray<Effect> | PluginAPI['mixed']
  effectStyleId: string | PluginAPI['mixed']
}

export const hasEffects = (node: SceneNode): node is SceneNode & MinimalEffectMixin => Boolean(node['effectStyleId'])
export const hasStrokes = (node: SceneNode): node is SceneNode & MinimalStrokesMixin => Boolean(node['strokes'])
export const hasStrokeStyle = (node: SceneNode): node is SceneNode & MinimalStrokesMixin =>
  Boolean(node['strokeStyleId'])

export const hasFills = (node: SceneNode): node is SceneNode & MinimalFillsMixin => Boolean(node['fills'])

export const hasFillStyles = (node: SceneNode): node is SceneNode & MinimalFillsMixin => Boolean(node['fillStyleId'])

export async function isPublished(styles) {
  const numOfStyles: number = styles.length
  let numOfPublishedStyles: number = 0
  let publishedStatus: string

  //check to see if each style is published
  for await (const item of styles) {
    const style = figma.getStyleById(item.id)
    const published = await style.getPublishStatusAsync()

    //increase the count of published styles
    if (published === 'CURRENT') {
      numOfPublishedStyles++
    }
  }

  //determine if all styles are published, some, or none
  if (numOfPublishedStyles === numOfStyles) {
    publishedStatus = 'all'
  } else if (numOfPublishedStyles >= 1 && numOfPublishedStyles < numOfStyles) {
    publishedStatus = 'some'
  } else {
    publishedStatus = 'none'
  }

  //return the results
  return publishedStatus
}
