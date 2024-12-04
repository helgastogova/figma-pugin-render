import { useCallback, useState } from 'react'
import { removeBgML } from './background-removal'

export const useBackgroundRemoval = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeBackground = useCallback(async (imageData: ImageData) => {
    try {
      setIsProcessing(true)
      setError(null)
      return await removeBgML(imageData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove background'
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    removeBackground,
    isProcessing,
    error,
  }
}
