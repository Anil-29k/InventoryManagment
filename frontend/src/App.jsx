import { useState } from 'react'
import './App.css'
import InventoryQR from './components/qrCode'
function App() {
  const [count, setCount] = useState(0)

  return (
    <InventoryQR />

  )
}

export default App
