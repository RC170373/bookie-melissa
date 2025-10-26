'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, Droplets, Eye } from 'lucide-react'

interface WeatherData {
  temp: number
  feels_like: number
  humidity: number
  description: string
  main: string // Clear, Clouds, Rain, Snow, Drizzle, Thunderstorm, Mist, etc.
  icon: string
  city: string
  wind_speed: number
  visibility: number
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      // Get user's location
      if (!navigator.geolocation) {
        setError('La géolocalisation n\'est pas supportée par votre navigateur')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Fetch weather from Open-Meteo API (100% FREE, NO API KEY REQUIRED!)
            // Open-Meteo is an open-source weather API
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
            )

            if (!response.ok) {
              throw new Error('Impossible de récupérer la météo')
            }

            const data = await response.json()

            // Get city name from reverse geocoding using Nominatim (OpenStreetMap - also free!)
            let city = 'Votre ville'
            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                  headers: {
                    'User-Agent': 'Bookie-App/1.0'
                  }
                }
              )
              if (geoResponse.ok) {
                const geoData = await geoResponse.json()
                city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || 'Votre ville'
              }
            } catch (geoError) {
              console.warn('Geocoding failed, using default city name:', geoError)
              // Continue with default city name
            }

            // Map WMO weather codes to weather conditions
            const weatherCode = data.current.weather_code
            const weatherCondition = getWeatherCondition(weatherCode)

            setWeather({
              temp: Math.round(data.current.temperature_2m),
              feels_like: Math.round(data.current.apparent_temperature),
              humidity: data.current.relative_humidity_2m,
              description: weatherCondition.description,
              main: weatherCondition.main,
              icon: weatherCondition.icon,
              city: city,
              wind_speed: data.current.wind_speed_10m,
              visibility: 10, // Open-Meteo doesn't provide visibility, default to 10km
            })
            setLoading(false)

            // Dispatch custom event for weather change (for animations)
            window.dispatchEvent(new CustomEvent('weatherChange', {
              detail: { weather: weatherCondition.main }
            }))
          } catch (err) {
            console.error('Weather fetch error:', err)
            setError('Erreur lors de la récupération de la météo')
            setLoading(false)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setError('Impossible d\'obtenir votre position')
          setLoading(false)
        }
      )
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Erreur lors de la récupération de la météo')
      setLoading(false)
    }
  }

  // Map WMO Weather codes to conditions
  // https://open-meteo.com/en/docs
  const getWeatherCondition = (code: number) => {
    if (code === 0) return { main: 'Clear', description: 'ciel dégagé', icon: '01d' }
    if (code <= 3) return { main: 'Clouds', description: 'nuageux', icon: '02d' }
    if (code <= 49) return { main: 'Clouds', description: 'brouillard', icon: '50d' }
    if (code <= 59) return { main: 'Drizzle', description: 'bruine', icon: '09d' }
    if (code <= 69) return { main: 'Rain', description: 'pluie', icon: '10d' }
    if (code <= 79) return { main: 'Snow', description: 'neige', icon: '13d' }
    if (code <= 84) return { main: 'Rain', description: 'averses', icon: '09d' }
    if (code <= 99) return { main: 'Thunderstorm', description: 'orage', icon: '11d' }
    return { main: 'Clear', description: 'ciel dégagé', icon: '01d' }
  }

  const getWeatherIcon = (main: string) => {
    switch (main) {
      case 'Clear':
        return <Sun className="h-8 w-8 text-yellow-400" />
      case 'Clouds':
        return <Cloud className="h-8 w-8 text-gray-400" />
      case 'Rain':
        return <CloudRain className="h-8 w-8 text-blue-400" />
      case 'Drizzle':
        return <CloudDrizzle className="h-8 w-8 text-blue-300" />
      case 'Snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />
      case 'Thunderstorm':
        return <CloudRain className="h-8 w-8 text-purple-400" />
      default:
        return <Cloud className="h-8 w-8 text-gray-400" />
    }
  }

  const getWeatherGradient = (main: string) => {
    switch (main) {
      case 'Clear':
        return 'from-yellow-400 to-orange-400'
      case 'Clouds':
        return 'from-gray-400 to-gray-500'
      case 'Rain':
        return 'from-blue-400 to-blue-600'
      case 'Drizzle':
        return 'from-blue-300 to-blue-400'
      case 'Snow':
        return 'from-blue-100 to-blue-300'
      case 'Thunderstorm':
        return 'from-purple-500 to-indigo-600'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="paper-texture rounded-xl p-4 shadow-lg animate-pulse">
        <div className="h-24 bg-wood-200 rounded"></div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="paper-texture rounded-xl p-4 shadow-lg">
        <p className="text-sm text-wood-600">{error || 'Météo indisponible'}</p>
      </div>
    )
  }

  return (
    <div className="paper-texture rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`bg-gradient-to-br ${getWeatherGradient(weather.main)} rounded-lg p-4 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-90">{weather.city}</p>
            <p className="text-3xl font-bold">{weather.temp}°C</p>
            <p className="text-xs opacity-75">Ressenti {weather.feels_like}°C</p>
          </div>
          <div className="flex flex-col items-center">
            {getWeatherIcon(weather.main)}
            <p className="text-xs mt-1 capitalize">{weather.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs opacity-90 border-t border-white/20 pt-3">
          <div className="flex items-center space-x-1">
            <Droplets className="h-3 w-3" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind className="h-3 w-3" />
            <span>{weather.wind_speed} m/s</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{weather.visibility} km</span>
          </div>
        </div>
      </div>
    </div>
  )
}

