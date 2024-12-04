import { CreateUIMessageType } from './types'
import { hasActiveSelection, getImageBytesFromSelection, uint8ArrayToImageData } from './utils'

figma.showUI(__html__, { width: 1000, height: 600, title: 'Kive AI. Remove Background', themeColors: false })

figma.ui.onmessage = async (msg: CreateUIMessageType) => {
  const userHasActiveSelection = hasActiveSelection()

  if (msg.type === 'request-images-selection') {
    const selectedImages = await getImageBytesFromSelection()
    const imageInfo = await uint8ArrayToImageData(selectedImages[0])
    figma.ui.postMessage({
      data: {
        hasActiveSelection: userHasActiveSelection,
        imageBytes: imageInfo.bytes,
      },
    })
  }

  if (msg.type === 'cancel') {
    figma.closePlugin()
  }

  if (msg.type === 'apply-background-removal') {
    try {
      const selectedNode = figma.currentPage.selection[0]
      if (!selectedNode || !('fills' in selectedNode)) {
        throw new Error('Please select an image')
      }

      const newImage = figma.createImage(msg.imageBytes)

      selectedNode.fills = [
        {
          type: 'IMAGE',
          imageHash: newImage.hash,
          scaleMode: 'FILL',
        },
      ]

      figma.closePlugin('Background removed successfully!')
    } catch (error) {
      figma.closePlugin('Failed to apply image: ' + error.message)
    }
  }
}
