import Link from 'next/link'
import { BookOpen, Facebook, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bookie</span>
            </div>
            <p className="text-sm">
              Le réseau social pour tous les amoureux de la lecture. Gérez votre bibliothèque en ligne,
              discutez en toute convivialité et découvrez de nouveaux livres.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-indigo-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-4">Communauté</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/forum" className="hover:text-indigo-400 transition">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/book-club" className="hover:text-indigo-400 transition">
                  Book Club
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-purple-400 transition">
                  Défis de lecture
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-indigo-400 transition">
                  Nous soutenir
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-indigo-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-indigo-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-indigo-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-indigo-400 transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Bookie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

