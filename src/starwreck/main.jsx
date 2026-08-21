import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource/dm-mono/latin-300.css'
import '@fontsource/dm-mono/latin-400.css'
import '../index.css'
import './starwreck.css'
import StarwreckPage from './StarwreckPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StarwreckPage />
  </React.StrictMode>,
)
