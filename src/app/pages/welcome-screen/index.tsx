import React, { useState } from 'react'
import { ComponentsList } from './components/components-list'
import { Button, Text, Layout, Checkbox } from '@ui'
import { Loader } from './components/loader'

import s from './welcome-screen.module.css'

const WelcomeScreen = () => {
  const [componentsArray, setComponentsArray] = useState([])
  const [hasSelectedComponents, setHasSelectedComponents] = useState(false)
  const [currentRender, setCurrentRender] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedToRenderComponents, setSelectedToRenderComponents] = useState([])
  const [generateOnNewPage, setGenerateOnNewPage] = useState(true)
  const [generatePrimitives, setGeneratePrimitives] = useState(false)
  const [generateTokens, setGenerateTokens] = useState(false)

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  const onCreate = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'render-demo',
          data: { generateOnNewPage, generatePrimitives, generateTokens, selectedToRenderComponents },
        },
      },
      '*',
    )
    setCreating(true)
  }

  React.useEffect(() => {
    function handleMessage(event) {
      const {
        data,
        data: { type },
      } = event.data.pluginMessage
      if (type === 'components') {
        if (data.hasActiveSelection) {
          setComponentsArray(data.selectedComponents)
          setSelectedToRenderComponents(data.selectedComponents)
          setHasSelectedComponents(true)
        } else {
          setComponentsArray([...data.componentSets, ...data.standaloneComponentSets])
          setSelectedToRenderComponents([...data.componentSets, ...data.standaloneComponentSets])
          setHasSelectedComponents(false)
        }
        setLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)
    parent.postMessage({ pluginMessage: { type: 'request-components' } }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  React.useEffect(() => {
    function handleMessage(event) {
      const {
        data,
        data: { type },
      } = event.data.pluginMessage
      if (type === 'currentRender') {
        setCurrentRender(data.name)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Layout centered className={s.layout}>
      <div>
        {creating ? (
          <>
            <Loader />
            <Text centered as="h1" variant="heading/large">
              Creating...
            </Text>
          </>
        ) : (
          <>
            {loading ? (
              <Loader />
            ) : (
              <ComponentsList
                hasSelectedComponents={hasSelectedComponents}
                componentsArray={componentsArray}
                currentRender={currentRender}
                onCheckboxChange={setSelectedToRenderComponents}
                selectedToRenderComponents={selectedToRenderComponents}
              />
            )}
          </>
        )}
      </div>
      {!loading && !creating && (
        <div className={s.buttonContainer}>
          <div className={s.settings}>
            <Checkbox
              label="Generate on new page"
              checked={generateOnNewPage}
              onChange={() => setGenerateOnNewPage(!generateOnNewPage)}
            />
            {/*  <Checkbox
              label="Generate Primitives"
              checked={generatePrimitives}
              onChange={() => setGeneratePrimitives(!generatePrimitives)}
            />
            <Checkbox
              label="Generate Tockens"
              checked={generateTokens}
              onChange={() => setGenerateTokens(!generateTokens)}
            /> */}
          </div>
          <div>
            <Button onClick={onCancel} type="secondary">
              Cancel
            </Button>

            <Button
              desibled={selectedToRenderComponents?.length === 0 && !generatePrimitives && !generateTokens}
              onClick={onCreate}
              type="primary"
            >
              {getButtonLabel(selectedToRenderComponents, componentsArray, generateTokens, generatePrimitives)}
            </Button>
          </div>
        </div>
      )}
    </Layout>
  )
}

const getButtonLabel = (selectedToRenderComponents, componentsArray, generateTokens, generatePrimitives) => {
  if (selectedToRenderComponents?.length === componentsArray?.length)
    return `Generate all (${selectedToRenderComponents?.length})`

  if (selectedToRenderComponents?.length === 0) {
    if (generatePrimitives && generateTokens) return 'Generate Primitives and Local variables'
    if (generatePrimitives && !generateTokens) return 'Generate Primitives'
    if (generateTokens && !generatePrimitives) return 'Local variables'
    return 'Select some components'
  }

  return `Generate ${selectedToRenderComponents?.length} ${selectedToRenderComponents?.length > 1 ? 'components' : 'component'}`
}

export default WelcomeScreen
