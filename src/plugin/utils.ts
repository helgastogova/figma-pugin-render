export const hasActiveSelection = (): boolean => figma.currentPage.selection.length > 0

export const getImageBytesFromSelection = async (): Promise<Uint8Array[]> => {
  const selectedElements = figma.currentPage.selection.filter((node): node is RectangleNode => {
    if (node.type !== 'RECTANGLE') return false
    if (Array.isArray(node.fills)) {
      return node.fills.some((fill) => fill.type === 'IMAGE' && fill.imageHash !== null)
    }
    return false
  })

  const imageBytesPromises = selectedElements.map(async (node) => {
    if (!Array.isArray(node.fills)) return new Uint8Array()

    const imageFill = node.fills.find((fill) => fill.type === 'IMAGE' && fill.imageHash !== null) as ImagePaint
    const image = figma.getImageByHash(imageFill.imageHash!)
    return image?.getBytesAsync()
  })

  return Promise.all(imageBytesPromises)
}

export interface ImageInfo {
  bytes: Uint8Array
  width: number
  height: number
}

export const uint8ArrayToImageData = async (bytes: Uint8Array): Promise<ImageInfo> => {
  const image = await figma.createImage(bytes)
  const { width, height } = await image.getSizeAsync()
  const imageBytes = await image.getBytesAsync()

  return {
    bytes: imageBytes,
    width,
    height,
  }
}
