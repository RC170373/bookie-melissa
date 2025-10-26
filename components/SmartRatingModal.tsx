'use client'

import { useState, useEffect } from 'react'
import { X, Star, Sparkles, Loader2, Edit2, Check } from 'lucide-react'

interface Question {
  id: string
  question: string
  weight: number
  options: Array<{
    value: number
    label: string
  }>
}

interface SmartRatingModalProps {
  isOpen: boolean
  onClose: () => void
  bookTitle: string
  currentRating?: number | null
  onSave: (rating: number, answers: any, comments: string) => Promise<void>
}

export default function SmartRatingModal({
  isOpen,
  onClose,
  bookTitle,
  currentRating,
  onSave,
}: SmartRatingModalProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')
  const [aiRating, setAiRating] = useState<number | null>(null)
  const [manualRating, setManualRating] = useState<number | null>(currentRating || null)
  const [isManualMode, setIsManualMode] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<'questions' | 'result'>('questions')

  useEffect(() => {
    if (isOpen) {
      fetchQuestions()
      if (currentRating) {
        setManualRating(currentRating)
      }
    }
  }, [isOpen, currentRating])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/rating/analyze')
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/rating/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, comments }),
      })

      const data = await response.json()
      if (response.ok) {
        setAiRating(data.rating)
        setManualRating(data.rating)
        setStep('result')
      }
    } catch (error) {
      console.error('Error analyzing rating:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(manualRating || 0, answers, comments)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error saving rating:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setAnswers({})
    setComments('')
    setAiRating(null)
    setManualRating(null)
    setIsManualMode(false)
    setStep('questions')
  }

  const allQuestionsAnswered = questions.every((q) => answers[q.id] !== undefined)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Notation Intelligente</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">{bookTitle}</p>
        </div>

        <div className="p-6">
          {step === 'questions' ? (
            <>
              {/* Questions */}
              <div className="space-y-6 mb-6">
                <p className="text-gray-700">
                  Répondez à ces questions pour générer une note intelligente basée sur votre ressenti :
                </p>

                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-semibold text-gray-900">{question.question}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {question.options.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() =>
                            setAnswers({ ...answers, [question.id]: option.value })
                          }
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            answers[question.id] === option.value
                              ? 'border-purple-600 bg-purple-50 font-semibold'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            <div className="flex gap-1">
                              {[...Array(option.value)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900">
                  Commentaires (optionnel)
                </h3>
                <p className="text-sm text-gray-600">
                  Partagez vos impressions pour affiner la note grâce à l'analyse de sentiment IA
                </p>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Qu'avez-vous pensé de ce livre ? Qu'avez-vous aimé ou moins aimé ?"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition min-h-[100px]"
                />
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!allQuestionsAnswered || analyzing}
                className="w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Générer la note
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Result */}
              <div className="text-center mb-6">
                <div className="inline-block p-8 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Note générée par l'IA</span>
                  </div>
                  <div className="text-6xl font-bold text-purple-700 mb-2">
                    {aiRating?.toFixed(1)}
                  </div>
                  <div className="text-gray-600">/ 20</div>
                  
                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor((aiRating || 0) / 4)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Cette note a été calculée en fonction de vos réponses et de l'analyse de sentiment de vos commentaires.
                </p>

                {/* Manual Override */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Ajuster manuellement</span>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(!isManualMode)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      {isManualMode ? (
                        <>
                          <Check className="h-4 w-4" />
                          Valider
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4" />
                          Modifier
                        </>
                      )}
                    </button>
                  </div>

                  {isManualMode && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={manualRating || ''}
                        onChange={(e) => setManualRating(parseFloat(e.target.value))}
                        className="w-full p-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-center text-2xl font-bold"
                        placeholder="Note sur 20"
                        aria-label="Note manuelle sur 20"
                      />
                      <p className="text-xs text-gray-600">
                        Note entre 0 et 20 (avec décimale)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('questions')}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || manualRating === null}
                  className="flex-1 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

