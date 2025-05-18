'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PasswordModal from '@/components/PasswordModal'
import { useState, useEffect } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

const ADMIN_MENU_ITEMS = [
  {
    name: 'Takım Yönetimi',
    path: '/admin'
  },
  {
    name: 'Lootspot Yönetimi',
    path: '/admin/lootspot'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
    }
  }, [])

  const handlePasswordSubmit = (password: string) => {
    const isValid = password === 'admin123'
    setIsAuthenticated(isValid)
    setShowPasswordModal(!isValid)
    if (isValid) {
      localStorage.setItem('isAdminAuthenticated', 'true')
    }
  }

  if (!isAuthenticated) {
    return (
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">Admin Panel</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {ADMIN_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === item.path
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {ADMIN_MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 