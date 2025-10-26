'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Camera, Loader2, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAvatarUrl(data.user.avatar || '')
        setPreviewUrl(data.user.avatar || '')
        setFullName(data.user.fullName || '')
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    // Créer une preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload l'image
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      // Convertir en base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        
        // Sauvegarder dans le profil
        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatar: base64 }),
        })

        if (response.ok) {
          const data = await response.json()
          setAvatarUrl(data.user.avatar)
          setUser(data.user)
        } else {
          alert('Erreur lors de l\'upload de l\'image')
          setPreviewUrl(avatarUrl)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Erreur lors de l\'upload de l\'image')
      setPreviewUrl(avatarUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        alert('Profil mis à jour avec succès')
      } else {
        alert('Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar: null }),
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl('')
        setPreviewUrl('')
        setUser(data.user)
      } else {
        alert('Erreur lors de la suppression de l\'image')
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Erreur lors de la suppression de l\'image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-library-pattern flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-library-pattern py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <User className="h-8 w-8 text-purple-600" />
            Mon Profil
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et votre photo de profil
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              {!uploading && (
                <button
                  type="button"
                  title="Changer la photo de profil"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              )}

              {/* Loading Overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Cliquez sur l'avatar pour changer votre photo
              <br />
              <span className="text-xs text-gray-500">
                (JPG, PNG, GIF - Max 5MB)
              </span>
            </p>

            {/* Remove Avatar Button */}
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="mt-3 text-sm text-red-600 hover:text-red-700 underline disabled:opacity-50"
              >
                Supprimer la photo
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Le nom d'utilisateur ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

