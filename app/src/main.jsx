import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LucideProvider } from 'lucide-react'
import './styles/tokens.css'
import './index.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import App from './App.jsx'
import { ICON_SIZE, ICON_STROKE } from './components/icons.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LucideProvider size={ICON_SIZE} strokeWidth={ICON_STROKE}>
        <App />
      </LucideProvider>
    </BrowserRouter>
  </StrictMode>,
)
