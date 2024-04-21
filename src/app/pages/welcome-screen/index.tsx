import React, { useState } from 'react'

import { Button, Text, Layout } from '@ui'

import s from './welcome-screen.module.css'

const structure = {
  MainPage: {
    type: 'frame',
    width: 1280,
    height: 'auto',
    direction: 'VERTICAL',
    gap: 20,
    Header: {
      type: 'frame',
      width: 1280,
      height: 100,
      backgroundColor: '#FFFFFF',
      direction: 'HORIZONTAL',
      gap: 10,
    },
    MainContent: {
      type: 'frame',
      width: 1280,
      height: 'auto',
      direction: 'VERTICAL',
      gap: 15,
      CompanyCards: {
        type: 'component',
        name: 'Company Cards',
      },
      MediaBlocks: {
        type: 'component',
        name: 'Media',
      },
      Accordion: {
        type: 'component',
        name: 'Accordeon',
      },
      CommunityTags: {
        type: 'component',
        name: 'Community Tags',
      },
    },
    Sidebar: {
      type: 'frame',
      width: 280,
      height: 'auto',
      direction: 'VERTICAL',
      gap: 10,
      InfoBlock: {
        type: 'component',
        name: 'Title + Description block',
      },
      Chips: {
        type: 'component',
        name: 'Chips',
      },
      DropdownMenu: {
        type: 'component',
        name: 'Dropdown Menu Elements',
      },
    },
    Footer: {
      type: 'frame',
      width: 1280,
      height: 50,
      backgroundColor: '#F0F0F0',
      direction: 'HORIZONTAL',
      gap: 10,
      Links: {
        type: 'component',
        name: 'Link',
      },
      LogoEmailTransition: {
        type: 'component',
        name: 'Logo Email Transition',
      },
    },
  },
  ProfilePage: {
    type: 'frame',
    width: 1280,
    height: 'auto',
    direction: 'VERTICAL',
    gap: 20,
    Header: {
      type: 'frame',
      width: 1280,
      height: 100,
      direction: 'HORIZONTAL',
      gap: 10,
      Logo: {
        type: 'component',
        name: 'Logo',
      },
      Menu: {
        type: 'frame',
        width: 400,
        height: 100,
        direction: 'HORIZONTAL',
        gap: 5,
        MenuItems: {
          type: 'component',
          name: 'Menu Items',
        },
      },
    },
    MainContent: {
      type: 'frame',
      width: 1280,
      height: 'auto',
      direction: 'VERTICAL',
      gap: 15,
      ProfileBlock: {
        type: 'component',
        name: 'Profile',
      },
      SocialMediaIcons: {
        type: 'component',
        name: 'Icon Only Buttons',
      },
      Description: {
        type: 'component',
        name: 'Txt Block',
      },
    },
    Footer: {
      type: 'frame',
      width: 1280,
      height: 50,
      direction: 'HORIZONTAL',
      gap: 10,
    },
  },
}

const WelcomeScreen = () => {
  const [componentSetsArray, setComponentSets] = useState([])
  const [hasSelectedComponents, setHasSelectedComponents] = useState(false)
  const [currentRender, setCurrentRender] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [prompt, setPrompt] = useState('')

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  const text = `это список компонентов которые есть в figma 
  componentSetsArray = ${JSON.stringify({ componentSetsArray })} 
  используя этот список сформируй структуру страниц для запроса 
  ${prompt} – верни объект в формате structure: ${JSON.stringify({ structure })} 
  – у каждого элемента должен быть type = 'component' | 'text' | 'frame',
   ты можешь использовать либо компоненты указанные в списке либо создать 
   использоваться frame, верни только объект без объеяснения. 
   Будь внимателен, либо компоненты которые я тебе сикнула либо  frame
  СТРОГО СООТВЕТСТВУЙ ФОРМАТУ ЧТО Я ТЕБЕ ДАЛА, верни сразу объект без markdown
   и прочего, только объект. Создай осознанный контент, который будет соответствовать 
   запросу. Чтобы страница смотрелось как созданная человеком, повторояй 
   вывод компонентов если требуется`

  const handleSubmit = async (prompt: string) => {
    console.log('prompt', prompt, JSON.stringify({ prompt }))
    try {
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initialPrompt: text }),
      })
      const data = await response.json()
      if (data.choices[0].message.content) {
        parent.postMessage({ pluginMessage: { type: 'generated', data: data.choices[0].message.content } }, '*')
      }
    } catch (error) {
      console.error('Ошибка при запросе к серверу:', error)
    }
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

  React.useEffect(() => {
    function handleMessage(event) {
      const {
        data,
        data: { type },
      } = event.data.pluginMessage
      if (type === 'components') {
        if (data.hasActiveSelection) {
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
      <textarea onChange={(e) => setPrompt(e.target.value)} value={prompt} className={s.textarea}>
        {prompt}
      </textarea>
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
                {hasSelectedComponents && (
                  <div>
                    {componentSetsArray.length > 0
                      ? 'We found these components/components sets in your selection: '
                      : 'We have no found any components/components sets in your selection'}
                  </div>
                )}
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
          <Button desibled={componentSetsArray.length === 0} onClick={onCreate} type="primary">
            Create
          </Button>
          <Button onClick={() => handleSubmit(prompt)} type="primary">
            AI
          </Button>
        </div>
      )}
    </Layout>
  )
}

export default WelcomeScreen
