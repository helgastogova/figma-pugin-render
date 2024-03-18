import React, { useState } from 'react'

import { Button, Text, Layout } from '@ui'

import s from './welcome-screen.module.css'

const WelcomeScreen = () => {
  const [componentSetsArray, setComponentSets] = useState([])
  const [loading, setLoading] = useState(true)

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
  }

  React.useEffect(() => {
    function handleMessage(event) {
      const { componentSets, type } = event.data.pluginMessage.data
      if (type === 'components') {
        setComponentSets(componentSets)
        setLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)
    parent.postMessage({ pluginMessage: { type: 'request-components' } }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Layout centered className={s.layout}>
      <div>
        <Text className={s.title} centered as="h1" variant="heading/large">
          Hi 👋
        </Text>
        {loading ? (
          <Text centered as="h1" variant="heading/large">
            Loading...
          </Text>
        ) : (
          <div>
            {componentSetsArray?.map((item, i) => {
              return (
                <div key={item.id}>
                  {i + 1}) {item.name}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className={s.buttonContainer}>
        <Button onClick={onCancel} type="secondary">
          Cancel
        </Button>
        <Button onClick={onCreate} type="primary">
          Create
        </Button>
      </div>
    </Layout>
  )
}

export default WelcomeScreen
