import { getLayoutProps, LayoutsProps } from '../layouts'
import { findAndSetStyle } from './colors'

export const createFrame = (
  props: LayoutsProps,
  page?: PageNode | FrameNode,
  direction: 'right' | 'bottom' = 'bottom',
  renderArea?: 'center',
): FrameNode => {
  const currentPage = (page as PageNode) ?? (figma.currentPage as PageNode)
  const frame: FrameNode = figma.createFrame()

  Object.assign(frame, getLayoutProps(props))

  props.backgroundColor ? findAndSetStyle(props.backgroundColor, frame) : (frame.fills = [])

  if (renderArea === 'center') {
    const selectedArea = figma.currentPage.selection[0]

    if (selectedArea) {
      frame.x = selectedArea.x + selectedArea.width + 100
      frame.y = selectedArea.y
    } else {
      frame.x = figma.viewport.center.x - frame.width / 2
      frame.y = figma.viewport.center.y - frame.height / 2
    }
  } else {
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
  }
  currentPage.appendChild(frame)

  return frame
}

export const getDemoTitle = (text: string): TextNode => {
  return createText({
    characters: text,
    fontSize: 42,
    fontColor: '#000000',
    fontName: { family: 'Roboto', style: 'Regular' },
  })
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

export async function isPublished(styles) {
  const numOfStyles: number = styles.length
  let numOfPublishedStyles: number = 0
  let publishedStatus: string

  for await (const item of styles) {
    const style = figma.getStyleById(item.id)
    const published = await style.getPublishStatusAsync()

    if (published === 'CURRENT') {
      numOfPublishedStyles++
    }
  }
  if (numOfPublishedStyles === numOfStyles) {
    publishedStatus = 'all'
  } else if (numOfPublishedStyles >= 1 && numOfPublishedStyles < numOfStyles) {
    publishedStatus = 'some'
  } else {
    publishedStatus = 'none'
  }

  return publishedStatus
}
