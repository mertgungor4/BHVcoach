'use client'

import { useState, useEffect } from 'react'
import PasswordModal from '@/components/PasswordModal'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
    }
  }, [])

  const handlePasswordSubmit = (password: string) => {
    const isValid = password === 'pubg123'
    setIsAuthenticated(isValid)
    setShowPasswordModal(!isValid)
    if (isValid) {
      localStorage.setItem('isAuthenticated', 'true')
    }
  }

  return (
    <>
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />
      {isAuthenticated && <Dashboard />}
    </>
  )
}
