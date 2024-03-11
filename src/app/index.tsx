import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'

import './styles/variables.css'
import './styles/global.css'

const rootElement = document.getElementById('react-page')

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
} else {
  console.error('Root element not found')
}
