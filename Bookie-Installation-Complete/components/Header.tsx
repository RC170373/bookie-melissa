'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, Menu, X, Search, User, LogOut, Plus } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { ThemeSelector } from './ThemeSelector'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const client = createClient()

  // Check user session
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await client.auth.getUser()
      setUser(user)
    }
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await client.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="glass-purple sticky top-0 z-50 border-b border-purple-300/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="book-spine p-2 rounded-lg hover-lift animate-float">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text group-hover:scale-105 transition-transform">
              Bookie
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/" className="px-3 py-2 text-wood-800 hover:text-purple-700 transition-all font-medium rounded-lg hover:bg-purple-50/50 hover:scale-105">
              Accueil
            </Link>
            <Link href="/bibliomania" className="px-3 py-2 text-wood-800 hover:text-purple-700 transition-all font-medium rounded-lg hover:bg-purple-50/50 hover:scale-105">
              Ma Bibliothèque
            </Link>
            <Link href="/calendar" className="px-3 py-2 text-wood-800 hover:text-green-700 transition-all font-medium rounded-lg hover:bg-green-50/50 hover:scale-105">
              Calendrier
            </Link>
            <Link href="/sagas" className="px-3 py-2 text-wood-800 hover:text-indigo-700 transition-all font-medium rounded-lg hover:bg-indigo-50/50 hover:scale-105">
              Sagas
            </Link>
            <Link href="/authors" className="px-3 py-2 text-wood-800 hover:text-pink-700 transition-all font-medium rounded-lg hover:bg-pink-50/50 hover:scale-105">
              Auteurs
            </Link>
            <Link href="/stats" className="px-3 py-2 text-wood-800 hover:text-orange-700 transition-all font-medium rounded-lg hover:bg-orange-50/50 hover:scale-105">
              Statistiques
            </Link>
            <Link href="/challenges" className="px-3 py-2 text-wood-800 hover:text-pink-700 transition-all font-medium rounded-lg hover:bg-pink-50/50 hover:scale-105">
              Défis
            </Link>
            <Link href="/achievements" className="px-3 py-2 text-wood-800 hover:text-yellow-700 transition-all font-medium rounded-lg hover:bg-yellow-50/50 hover:scale-105">
              Achievements
            </Link>
            <Link href="/discover" className="px-3 py-2 text-wood-800 hover:text-green-700 transition-all font-medium rounded-lg hover:bg-green-50/50 hover:scale-105">
              Découverte
            </Link>
          </nav>

          {/* Search and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSelector />

            <Link href="/quick-add" className="p-2 text-wood-700 hover:text-green-700 transition-all rounded-lg hover:bg-green-50/50 hover:scale-110" title="Ajout Rapide">
              <Plus className="h-5 w-5" />
            </Link>
            <Link href="/search" className="p-2 text-wood-700 hover:text-purple-700 transition-all rounded-lg hover:bg-purple-50/50 hover:scale-110" title="Recherche">
              <Search className="h-5 w-5" />
            </Link>

            {user && <NotificationBell />}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 text-wood-800 hover:text-purple-700 transition font-medium group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover border-2 border-purple-200 group-hover:border-purple-400 transition"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-200 to-pink-200 flex items-center justify-center border-2 border-purple-200 group-hover:border-purple-400 transition">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  <span>Profil</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-wood-800 hover:text-pink-700 transition font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-wood-800 hover:text-purple-700 transition-all font-medium rounded-lg hover:bg-purple-50/50 hover:scale-105"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-wood-700 hover:text-purple-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-200">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-wood-800 hover:text-purple-700 transition font-medium">
                Home
              </Link>
              <Link href="/bibliomania" className="text-wood-800 hover:text-purple-700 transition font-medium">
                My Library
              </Link>
              <Link href="/calendar" className="text-wood-800 hover:text-green-700 transition font-medium">
                Calendar
              </Link>
              <Link href="/sagas" className="text-wood-800 hover:text-indigo-700 transition font-medium">
                Sagas
              </Link>
              <Link href="/authors" className="text-wood-800 hover:text-pink-700 transition font-medium">
                Authors
              </Link>
              <Link href="/statistics" className="text-wood-800 hover:text-purple-700 transition font-medium">
                Statistics
              </Link>
              <Link href="/challenges" className="text-wood-800 hover:text-pink-700 transition font-medium">
                Challenges
              </Link>

              {user ? (
                <>
                  <Link href="/profile" className="text-wood-800 hover:text-purple-700 transition font-medium">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-left text-wood-800 hover:text-pink-700 transition font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-wood-800 hover:text-purple-700 transition font-medium">
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-center font-medium shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

