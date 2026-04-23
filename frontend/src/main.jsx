import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const BACKEND = "https://orgmind-4uc6.onrender.com"

function Root() {
  useEffect(() => {
    const ping = () => fetch(`${BACKEND}/ping`)
      .then(() => console.log("Backend pinged ✅"))
      .catch(() => console.warn("Ping failed ⚠️"))

    ping()
    const interval = setInterval(ping, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)