import React, { useState } from 'react'

import { Button, Text, Layout } from '@ui'

import s from './welcome-screen.module.css'

const WelcomeScreen = () => {
  const [componentsArray, setComponents] = useState([])
  const [componentSetsArray, setComponentSets] = useState([])
  const [user, setUser] = useState(null)

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
      const { components, componentSets, type } = event.data.pluginMessage.data
      if (type === 'components') {
        setComponents(components)
        setComponentSets(componentSets)
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
          Hi, {user} 👋
        </Text>
        <div>
          {componentSetsArray?.map((componentSet) => {
            return <div key={componentSet.id}>{componentSet.name}</div>
          })}
        </div>
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
