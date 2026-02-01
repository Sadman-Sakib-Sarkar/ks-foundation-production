import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import router from './router'
import './index.css'

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
      }}
    >
      <RouterProvider router={router} />
    </GoogleReCaptchaProvider>
  </React.StrictMode>,
)
