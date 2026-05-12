import React from 'react'
import ReactDOM from 'react-dom/client'
import { migrateLegacyLocalStorageKeys } from './utils/migrateLegacyStorageKeys'
import { STORAGE_KEYS } from './config/storageKeys.js'
import App from './App.jsx'
import './styles/anthropic/fonts/fonts.css'
import './styles/anthropic/base.css'
import './styles/workbench-prd.css'
import './index.css'

migrateLegacyLocalStorageKeys()

/** 每次完整加载站点都从落地页进入（写入在 React 读 localStorage 之前，避免先闪工作台） */
function ensureEntryLandingMode() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.LAB_MODE, JSON.stringify('landing'))
  } catch (e) {
    console.warn('[Thinking Lab] 无法设置入口为 landing', e)
  }
}
ensureEntryLandingMode()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)