import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource/dm-mono/latin-300.css'
import '@fontsource/dm-mono/latin-400.css'
import '../index.css'
import './sangota.css'
import SangotaPage from './SangotaPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SangotaPage />
  </React.StrictMode>,
)
