import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Button, Layout, Block } from '@ui'
import { useBackgroundRemoval } from '@app/ml/use-background-removal'
import { createParticleEffect } from '@app/components/particle-effect'

import s from './welcome-screen.module.css'

interface MessageEvent {
  data: {
    pluginMessage: {
      data: {
        hasActiveSelection: boolean
        imageBytes?: Uint8Array
      }
      type?: string
    }
  }
}

const WelcomeScreen = () => {
  const [loading, setLoading] = useState(true)
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null)
  const { removeBackground, isProcessing, error } = useBackgroundRemoval()

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  const onApply = async () => {
    if (!processedImageSrc) return

    try {
      setLoading(true)
      const img = document.querySelector('.resultImage') as HTMLImageElement
      if (img) {
        const effect = createParticleEffect(img)
        effect.start()
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const response = await fetch(processedImageSrc)
      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()
      const imageBytes = new Uint8Array(buffer)

      if (!(imageBytes instanceof Uint8Array)) {
        throw new Error('Failed to convert image to Uint8Array')
      }

      parent.postMessage(
        {
          pluginMessage: {
            type: 'apply-background-removal',
            imageBytes,
          },
        },
        '*',
      )
      setLoading(false)
    } catch (error) {
      console.error('Error in onApply:', error)
    }
  }

  const onRemoveBackground = async () => {
    if (!originalImageSrc) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const img = new Image()
      img.src = originalImageSrc
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const processedData = await removeBackground(imageData)
      ctx.putImageData(processedData, 0, 0)
      const newImageSrc = canvas.toDataURL('image/png')

      const originalImg = document.querySelector(`.${s.image}`) as HTMLImageElement
      if (originalImg) {
        const parent = originalImg.parentElement
        if (parent) {
          const effectContainer = document.createElement('div')
          effectContainer.style.position = 'absolute'
          effectContainer.style.top = '0'
          effectContainer.style.left = '0'
          effectContainer.style.width = '100%'
          effectContainer.style.height = '100%'
          effectContainer.className = 'effectContainer'
          parent.appendChild(effectContainer)

          const effect = createParticleEffect(originalImg)
          effectContainer.appendChild(effect.canvas)
          effect.start()

          await new Promise((resolve) => setTimeout(resolve, 800))

          parent.removeChild(effectContainer)
        }
      }

      setProcessedImageSrc(newImageSrc)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleSelectionMessage = (event: MessageEvent) => {
      event.data.pluginMessage
      setLoading(false)
    }

    window.addEventListener('message', handleSelectionMessage)
    parent.postMessage({ pluginMessage: { type: 'request-images-selection' } }, '*')
    return () => window.removeEventListener('message', handleSelectionMessage)
  }, [])

  useEffect(() => {
    const handleImageMessage = async (event: MessageEvent) => {
      const { data } = event.data.pluginMessage

      if (!data.imageBytes) return

      try {
        if (originalImageSrc) URL.revokeObjectURL(originalImageSrc)

        const blob = new Blob([data.imageBytes], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        setOriginalImageSrc(url)
        setLoading(false)
      } catch (err) {
        console.error('Error loading image:', err)
      }
    }

    window.addEventListener('message', handleImageMessage)
    return () => {
      window.removeEventListener('message', handleImageMessage)
      if (originalImageSrc) URL.revokeObjectURL(originalImageSrc)
      if (processedImageSrc) URL.revokeObjectURL(processedImageSrc)
    }
  }, [originalImageSrc, processedImageSrc])

  return (
    <Layout centered className={s.layout}>
      <Block flex justify="center">
        {error && <div className={s.error}>{error}</div>}
        {originalImageSrc ? (
          <Block flex justify="center" className={cx(isProcessing && s.processing)}>
            <div className={cx(s.imageContainer, processedImageSrc && s.processedImageNoColor)}>
              <img
                className={cx(s.image, processedImageSrc && s.resultImage)}
                src={processedImageSrc || originalImageSrc}
                alt="Selected"
              />
            </div>
          </Block>
        ) : (
          'Select an image'
        )}
      </Block>
      <Block flex vertical gap="16" className={s.licenseInfo} justify="end">
        <Block>
          <div className={s.buttons}>
            <Button onClick={onCancel} type="secondary">
              Cancel
            </Button>
            {!processedImageSrc ? (
              <Button
                onClick={onRemoveBackground}
                className={s.removeBackgroundButton}
                type="primary"
                disabled={isProcessing || !originalImageSrc}
                loading={isProcessing || loading}
              >
                {originalImageSrc ? 'Remove Background' : 'Select an image'}
              </Button>
            ) : (
              <Button
                onClick={onApply}
                type="primary"
                disabled={isProcessing || !processedImageSrc}
                loading={isProcessing || loading}
              >
                Apply
              </Button>
            )}
          </div>
        </Block>
        <Block flex gap="8" justify="between">
          <Block>
            <a className={s.moreTools} href="https://kive.ai" target="_blank" rel="noopener noreferrer">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="16" height="16">
                <g>
                  <rect x="809.8" y="-0.3" width="270" height="270" fill="var(--k-color-text-primary-default)"></rect>
                </g>
                <g>
                  <rect x="-0.1" width="270" height="1080" fill="var(--k-color-text-primary-default)"></rect>
                </g>
                <path
                  d="M697.6,652.1C595.4,550,539.2,414.2,539.2,269.7H269.9c0,447.4,362.6,810,810,810V810.5
	C935.5,810.5,799.7,754.2,697.6,652.1z"
                  fill="var(--k-color-text-primary-default)"
                ></path>
              </svg>
              More tools
            </a>
          </Block>
          <Block>
            This plugin uses RMBG-1.4 model (CreativeML Open RAIL-M License){' '}
            <a href="https://huggingface.co/briaai/RMBG-1.4" target="_blank" rel="noopener noreferrer">
              More details
            </a>
          </Block>
        </Block>
      </Block>
    </Layout>
  )
}

export default WelcomeScreen
