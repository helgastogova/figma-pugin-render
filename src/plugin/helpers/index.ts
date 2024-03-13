import { getLayoutProps, LayoutsProps } from '../layouts'
import { findAndSetStyle } from './colors'

export const createFrame = (props: LayoutsProps, page?: PageNode): FrameNode => {
  const currentPage = (page as PageNode) ?? (figma.currentPage as PageNode)
  const frame: FrameNode = figma.createFrame()

  Object.assign(frame, getLayoutProps(props))
  findAndSetStyle(props.backgroundColor ?? '#EFEFEF', frame)
  const maxY = currentPage.children
    .filter((node): node is FrameNode => node.type === 'FRAME')
    .reduce((max, current) => Math.max(max, current.y + current.height), 0)

  frame.y = maxY + 60
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
}: CreateTextProps): TextNode => {
  const text = figma.createText()

  Object.assign(text, {
    fontName: fontName ?? { family: 'Roboto', style: 'Regular' },
    characters: characters ?? 'Text Block',
    fontSize,
    textAlignHorizontal,
    textAlignVertical,
    textStyleId,
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
