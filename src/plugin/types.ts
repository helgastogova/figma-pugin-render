export type UIMessageType = 'remove-background' | 'cancel' | 'request-images-selection' | 'apply-background-removal'

export interface CreateUIMessageType {
  type: UIMessageType
  data?: {
    selectedElements?: Array<ComponentNode | ComponentSetNode>
  }
  imageBytes?: Uint8Array
}
