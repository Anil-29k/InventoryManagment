import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import InventoryQR from './components/qrCode'
function App() {
  const [count, setCount] = useState(0)

  return (
    <InventoryQR />

  )
}

export default App
