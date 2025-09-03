import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import './styles/tailwind.css'

const el = document.getElementById('app')
const hasInertiaSSR = !!(el && el.dataset && el.dataset.page)

if (hasInertiaSSR) {
  createInertiaApp({
    resolve: (name) => {
      const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
      return pages[`./pages/${name}.jsx`].default
    },
    setup({ el, App, props }) {
      const root = createRoot(el)
      root.render(<App {...props} />)
    },
    progress: { color: '#3A5ACF' },
  })
} else {
  // Fallback SPA render for local dev without backend.
  import('./pages/AuthPage.jsx').then(({ default: AuthPage }) => {
    const root = createRoot(el)
    root.render(<AuthPage />)
  })
}
