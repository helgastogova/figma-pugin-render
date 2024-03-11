figma.showUI(__html__, { width: 900, height: 800, title: 'Render Components Sets Demo', themeColors: false })

interface CreateUIMessage {
  type: 'render-demo' | 'cancel' | 'request-user-info' | 'request-layout-data'
  message: string
  //   data: ComponentsConfigType
}

figma.ui.onmessage = async (msg: CreateUIMessage) => {
  if (msg.type === 'request-layout-data') {
    // figma.ui.postMessage({ data: { type: 'colorStylesList', colorStyles: localColorStyles } })
  }

  if (msg.type === 'render-demo') {
    try {
    } catch (err) {
    } finally {
      //   figma.closePlugin()
    }
  }
  if (msg.type === 'cancel') {
    figma.closePlugin()
  }
}
