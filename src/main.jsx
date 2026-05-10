import React from 'react'
import ReactDOM from 'react-dom/client'
import { migrateLegacyLocalStorageKeys } from './utils/migrateLegacyStorageKeys'
import App from './App.jsx'
import './index.css'

migrateLegacyLocalStorageKeys()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)