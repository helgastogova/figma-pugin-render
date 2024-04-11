import React, { useState } from 'react'

import { Button, Text, Layout } from '@ui'

import s from './welcome-screen.module.css'

const WelcomeScreen = () => {
  const [componentSetsArray, setComponentSets] = useState([])
  const [hasSelectedComponents, setHasSelectedComponents] = useState(false)
  const [currentRender, setCurrentRender] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  const onCreate = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'render-demo',
        },
      },
      '*',
    )
    setCreating(true)
  }

  // const onAutolayout = () => {
  //   parent.postMessage(
  //     {
  //       pluginMessage: {
  //         type: 'autolayout',
  //       },
  //     },
  //     '*',
  //   )
  // }

  React.useEffect(() => {
    function handleMessage(event) {
      const {
        data,
        data: { type },
      } = event.data.pluginMessage
      if (type === 'components') {
        if (data.selectedComponents.length) {
          setComponentSets(data.selectedComponents)
          setHasSelectedComponents(true)
        } else {
          setComponentSets([...data.componentSets, ...data.standaloneComponentSets])
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
    // return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Layout centered className={s.layout}>
      <div>
        {creating ? (
          <Text centered as="h1" variant="heading/large">
            Creating...
          </Text>
        ) : (
          <>
            {loading ? (
              <Text centered as="h1" variant="heading/large">
                Loading...
              </Text>
            ) : (
              <div>
                {hasSelectedComponents && <div>We found these components/components sets in your selection: </div>}
                {currentRender
                  ? currentRender
                  : componentSetsArray?.map((item, i) => {
                      return (
                        <div key={`${item.id}_${i}`}>
                          {i + 1}) {item.name}
                        </div>
                      )
                    })}
              </div>
            )}
          </>
        )}
      </div>
      {!loading && !creating && (
        <div className={s.buttonContainer}>
          <Button onClick={onCancel} type="secondary">
            Cancel
          </Button>
          <Button onClick={onCreate} type="primary">
            Create
          </Button>
          {/* <Button onClick={onAutolayout} type="primary">
            AUTOLAYOUT
          </Button> */}
        </div>
      )}
    </Layout>
  )
}

export default WelcomeScreen
