'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number // 0-20 scale (Livraddict style)
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = 'md',
  showValue = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // Convert 0-20 scale to 0-5 stars (each star = 4 points)
  const starsRating = rating / 4
  const displayRating = hoverRating !== null ? hoverRating / 4 : starsRating

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const handleClick = (starIndex: number) => {
    if (readonly || !onChange) return
    // Convert star index (0-4) to 0-20 scale
    // Each star represents 4 points
    const newRating = (starIndex + 1) * 4
    onChange(newRating)
  }

  const handleMouseEnter = (starIndex: number) => {
    if (readonly || !onChange) return
    setHoverRating((starIndex + 1) * 4)
  }

  const handleMouseLeave = () => {
    if (readonly || !onChange) return
    setHoverRating(null)
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1
          const isFilled = displayRating >= starValue
          const isHalfFilled = displayRating >= starValue - 0.5 && displayRating < starValue

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`relative transition-all ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              } ${sizeClasses[size]}`}
              aria-label={`Note ${(index + 1) * 4} sur 20`}
            >
              {/* Background star (empty) */}
              <Star
                className={`absolute inset-0 ${sizeClasses[size]} text-wood-300`}
                fill="none"
                strokeWidth={2}
              />

              {/* Filled star */}
              {isFilled && (
                <Star
                  className={`absolute inset-0 ${sizeClasses[size]} ${
                    hoverRating !== null && !readonly
                      ? 'text-pink-500'
                      : 'text-purple-600'
                  }`}
                  fill="currentColor"
                  strokeWidth={2}
                />
              )}

              {/* Half-filled star */}
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    className={`${sizeClasses[size]} ${
                      hoverRating !== null && !readonly
                        ? 'text-pink-500'
                        : 'text-purple-600'
                    }`}
                    fill="currentColor"
                    strokeWidth={2}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {showValue && (
        <span
          className={`font-semibold ${textSizeClasses[size]} ${
            hoverRating !== null && !readonly ? 'text-pink-700' : 'text-purple-700'
          }`}
        >
          {hoverRating !== null ? hoverRating : rating}/20
        </span>
      )}
    </div>
  )
}

/**
 * Compact star rating display (read-only, no value shown)
 */
export function CompactStarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  return <StarRating rating={rating} readonly size={size} showValue={false} />
}

/**
 * Star rating with label
 */
export function LabeledStarRating({
  rating,
  onChange,
  label = 'Note',
  required = false,
}: {
  rating: number
  onChange?: (rating: number) => void
  label?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-wood-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <StarRating rating={rating} onChange={onChange} size="md" showValue />
      <p className="text-xs text-wood-600">
        Cliquez sur les étoiles pour noter (chaque étoile = 4 points)
      </p>
    </div>
  )
}

