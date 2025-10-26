import { BookOpen, Calendar, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function BookClubPage() {
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Club</h1>
        <p className="text-xl text-gray-600">
          Rejoignez notre communauté pour des lectures mensuelles partagées
        </p>
      </div>

      {/* Current Month Selection */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-12">
        <div className="flex items-center space-x-4 mb-4">
          <Calendar className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Sélection du mois</h2>
        </div>
        <p className="text-lg text-indigo-100 mb-6">
          Découvrez le livre sélectionné pour {currentMonth}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="aspect-2/3 bg-linear-to-br from-indigo-400 to-purple-400 rounded flex items-center justify-center mb-4">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <p className="text-center text-sm text-gray-600">Couverture du livre</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-2">À venir...</h3>
            <p className="text-indigo-100 mb-6">
              La sélection du mois sera bientôt annoncée. Restez à l'écoute !
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>Rejoignez des milliers de lecteurs passionnés</span>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5" />
                <span>Participez à des discussions enrichissantes</span>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5" />
                <span>Découvrez de nouveaux livres chaque mois</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Comment ça marche ?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Découvrez</h3>
            <p className="text-gray-600 text-sm">
              Chaque mois, nous sélectionnons un livre pour la communauté
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Lisez</h3>
            <p className="text-gray-600 text-sm">
              Lisez le livre à votre rythme pendant le mois
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-pink-600">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Discutez</h3>
            <p className="text-gray-600 text-sm">
              Partagez vos impressions dans le forum dédié
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Votez</h3>
            <p className="text-gray-600 text-sm">
              Votez pour le prochain livre du mois
            </p>
          </div>
        </div>
      </div>

      {/* Past Selections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Sélections précédentes</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-gray-600">
              Les sélections précédentes du book club seront affichées ici une fois que vous aurez participé à des lectures mensuelles.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Prêt à rejoindre le Book Club ?
        </h2>
        <p className="text-gray-600 mb-6">
          Inscrivez-vous pour recevoir les sélections mensuelles et participer aux discussions
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            S&apos;inscrire
          </Link>
          <Link
            href="/forum"
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition font-medium"
          >
            Aller au forum
          </Link>
        </div>
      </div>
    </div>
  )
}

