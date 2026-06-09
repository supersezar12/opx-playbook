import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AppLoader } from './components/AppLoader.tsx'
import './index.css'

// OPX Playbook Builder — v1.5.2
// Template gallery with live iframe previews
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppLoader>
        <App />
      </AppLoader>
    </ErrorBoundary>
  </React.StrictMode>,
)
