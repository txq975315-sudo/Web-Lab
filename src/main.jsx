import React from 'react'
import ReactDOM from 'react-dom/client'
import { migrateLegacyLocalStorageKeys } from './utils/migrateLegacyStorageKeys'
import App from './App.jsx'
import './styles/anthropic/fonts/fonts.css'
import './styles/anthropic/base.css'
import './styles/workbench-prd.css'
import './index.css'

migrateLegacyLocalStorageKeys()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)