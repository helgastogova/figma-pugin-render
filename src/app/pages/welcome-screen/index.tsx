import React, { useState } from 'react'

import { Button, Text, Layout } from '@ui'

import s from './welcome-screen.module.css'

const WelcomeScreen = () => {
  const [user, setUser] = useState(null)

  const onCreate = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'create-ui',
          //   data: state,
        },
      },
      '*',
    )
  }

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  React.useEffect(() => {
    function handleMessage(event) {
      const msg = event.data.pluginMessage.data
      if (msg.type === 'user-info') {
        setUser(msg.name)
      }
    }

    window.addEventListener('message', handleMessage)
    parent.postMessage({ pluginMessage: { type: 'request-user-info' } }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  return (
    <Layout centered className={s.layout}>
      <div>
        <Text className={s.title} centered as="h1" variant="heading/large">
          Hi, {user} 👋
        </Text>
      </div>
      <div className={s.buttonContainer}>
        <Button onClick={onCancel} type="secondary">
          Cancel
        </Button>
        <Button onClick={onCreate} type="primary">
          Skip and create
        </Button>
      </div>
    </Layout>
  )
}

export default WelcomeScreen
