export type UIMessageType = 'render-demo' | 'cancel' | 'request-user-info' | 'request-components'

export interface CreateUIMessageType {
  type: UIMessageType
  message: string
}
