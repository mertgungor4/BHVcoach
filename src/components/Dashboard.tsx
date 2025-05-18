import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Logout
          </button>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">PUBG Tournament Manager</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/killfeed">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-xl font-bold transition-colors"
            >
              Killfeed
            </motion.button>
          </Link>
          
          <Link href="/lootspot">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-xl font-bold transition-colors"
            >
              Lootspot
            </motion.button>
          </Link>
          
          <Link href="/admin">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-xl font-bold transition-colors"
            >
              Admin Panel
            </motion.button>
          </Link>
          
          <Link href="/dali">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-6 rounded-lg text-xl font-bold transition-colors"
            >
              Dali
            </motion.button>
          </Link>
          
          {/* Add more application buttons here as needed */}
          <div className="w-full bg-gray-800 p-6 rounded-lg text-xl font-bold text-gray-400 text-center">
            Coming Soon
          </div>
          
          <div className="w-full bg-gray-800 p-6 rounded-lg text-xl font-bold text-gray-400 text-center">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  )
} 