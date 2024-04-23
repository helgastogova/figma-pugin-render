export type UIMessageType = 'render-demo' | 'cancel' | 'request-user-info' | 'request-components'

export interface CreateUIMessageType {
  type: UIMessageType
  data?: {
    generateOnNewPage?: boolean
    generatePrimitives?: boolean
    generateTokens?: boolean
    selectedToRenderComponents?: Array<ComponentNode | ComponentSetNode>
  }
}
