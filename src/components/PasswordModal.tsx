import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => void
}

export default function PasswordModal({ isOpen, onClose, onSubmit }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Şifre kontrolünü onSubmit fonksiyonuna bırakıyoruz
      onSubmit(password)
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4"
        >
          <h2 className="text-2xl font-bold mb-4">Şifre Girişi</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 mb-4"
              placeholder="Şifrenizi girin"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 mb-4 text-center">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Kontrol Ediliyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 