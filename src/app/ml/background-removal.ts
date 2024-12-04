/**
 * Background removal functionality using RMBG-1.4 model
 * Model: briaai/RMBG-1.4
 * License: CreativeML Open RAIL-M
 * Source: https://huggingface.co/briaai/RMBG-1.4
 */

import { AutoModel, AutoProcessor, RawImage, env, PreTrainedModel, Processor } from '@xenova/transformers'

let modelPromise: Promise<{
  model: PreTrainedModel
  processor: Processor
}> | null = null

async function initializeModel() {
  if (modelPromise) return modelPromise

  modelPromise = (async () => {
    try {
      const modelId = 'briaai/RMBG-1.4'

      if (!env?.backends?.onnx?.wasm) {
        throw new Error('ONNX WASM backend is not available.')
      }

      env.backends.onnx.wasm.proxy = false
      env.allowLocalModels = false

      const model = await AutoModel.from_pretrained(modelId, {
        quantized: false,
        progress_callback: (progress) => {
          console.log(`Loading model: ${Math.round(progress.progress * 100)}%`)
        },
      })

      const processor = await AutoProcessor.from_pretrained(modelId)

      return { model, processor }
    } catch (error) {
      modelPromise = null
      throw error
    }
  })()

  return modelPromise
}

export async function removeBgML(imageData: ImageData): Promise<ImageData> {
  try {
    const { model, processor } = await initializeModel()

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2d context')

    ctx.putImageData(imageData, 0, 0)

    // Convert to RawImage
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve!, 'image/png'))
    const image = await RawImage.fromBlob(blob)
    const processedImage = await processor(image)

    // Get prediction from model
    const result = await model({
      input: processedImage.pixel_values,
    })

    // Get mask
    const maskData = await RawImage.fromTensor(result.output[0].mul(255).to('uint8')).resize(
      imageData.width,
      imageData.height,
    )

    // Create new ImageData with applied mask
    const resultData = new Uint8ClampedArray(imageData.data)
    for (let i = 0; i < resultData.length; i += 4) {
      const maskIndex = Math.floor(i / 4)
      resultData[i + 3] = maskData.data[maskIndex]
    }

    return new ImageData(resultData, imageData.width, imageData.height)
  } catch (error) {
    console.error('Error in removeBgML:', error)
    throw error
  }
}
