import { useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { RegisterPage } from '@/pages/RegisterPage'

function App() {
  const [page, setPage] = useState<'home' | 'register'>('home')

  if (page === 'register') {
    return <RegisterPage onBack={() => setPage('home')} />
  }

  return <HomePage onRegister={() => setPage('register')} />
}

export default App
