'use client'

import { useEffect, useState } from 'react'

export default function WeatherAnimation() {
  const [weather, setWeather] = useState<string>('Clear')

  useEffect(() => {
    // Listen for weather changes
    const handleWeatherChange = (event: CustomEvent) => {
      setWeather(event.detail.weather)
    }

    window.addEventListener('weatherChange', handleWeatherChange as EventListener)

    return () => {
      window.removeEventListener('weatherChange', handleWeatherChange as EventListener)
    }
  }, [])

  const renderAnimation = () => {
    switch (weather) {
      case 'Rain':
      case 'Drizzle':
        return <RainAnimation />
      case 'Snow':
        return <SnowAnimation />
      case 'Clear':
        return <SunAnimation />
      case 'Clouds':
        return <CloudsAnimation />
      case 'Thunderstorm':
        return <ThunderstormAnimation />
      default:
        return null
    }
  }

  const getBackgroundOverlay = () => {
    switch (weather) {
      case 'Rain':
      case 'Drizzle':
        return 'bg-gradient-to-b from-gray-400/10 via-blue-400/5 to-transparent'
      case 'Snow':
        return 'bg-gradient-to-b from-blue-100/20 via-white/10 to-transparent'
      case 'Clear':
        return 'bg-gradient-to-b from-yellow-100/15 via-orange-50/10 to-transparent'
      case 'Clouds':
        return 'bg-gradient-to-b from-gray-300/15 via-gray-200/10 to-transparent'
      case 'Thunderstorm':
        return 'bg-gradient-to-b from-gray-700/20 via-gray-600/10 to-transparent'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {renderAnimation()}
      {/* Background overlay for better visibility */}
      <div className={`absolute inset-0 transition-all duration-1000 ${getBackgroundOverlay()}`} />
    </div>
  )
}

// Rain Animation
function RainAnimation() {
  const raindrops = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5,
  }))

  return (
    <div className="absolute inset-0">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-1 h-16 bg-gradient-to-b from-blue-500/80 to-transparent animate-rain"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-100vh);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0.3;
          }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </div>
  )
}

// Snow Animation
function SnowAnimation() {
  const snowflakes = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 5,
    size: 6 + Math.random() * 10,
  }))

  return (
    <div className="absolute inset-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/90 shadow-lg animate-snow"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes snow {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(50px);
            opacity: 0.5;
          }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}</style>
    </div>
  )
}

// Sun Animation (rays)
function SunAnimation() {
  return (
    <div className="absolute top-10 right-10">
      <div className="relative w-40 h-40">
        {/* Sun rays */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-24 bg-gradient-to-t from-yellow-400/60 to-transparent origin-bottom animate-sun-ray"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 22.5}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        {/* Sun circle */}
        <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-400/50 to-orange-400/50 animate-pulse shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 0 100px rgba(251, 191, 36, 0.3)',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes sun-ray {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -100%) rotate(var(--rotation)) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -100%) rotate(var(--rotation)) scale(1.3);
          }
        }
        .animate-sun-ray {
          animation: sun-ray 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Clouds Animation
function CloudsAnimation() {
  const clouds = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 40,
    delay: Math.random() * 10,
    duration: 20 + Math.random() * 20,
    size: 0.5 + Math.random() * 0.5,
  }))

  return (
    <div className="absolute inset-0">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute animate-cloud"
          style={{
            top: `${cloud.top}%`,
            animationDelay: `${cloud.delay}s`,
            animationDuration: `${cloud.duration}s`,
            transform: `scale(${cloud.size})`,
          }}
        >
          <svg width="100" height="50" viewBox="0 0 100 50" className="opacity-20">
            <ellipse cx="25" cy="35" rx="25" ry="15" fill="currentColor" className="text-gray-400" />
            <ellipse cx="45" cy="25" rx="30" ry="20" fill="currentColor" className="text-gray-400" />
            <ellipse cx="70" cy="30" rx="25" ry="15" fill="currentColor" className="text-gray-400" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        @keyframes cloud {
          0% {
            transform: translateX(-100px) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(20px);
          }
        }
        .animate-cloud {
          animation: cloud linear infinite;
        }
      `}</style>
    </div>
  )
}

// Thunderstorm Animation
function ThunderstormAnimation() {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 200)
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0">
      <RainAnimation />
      {flash && (
        <div className="absolute inset-0 bg-white/30 animate-flash" />
      )}
      <style jsx>{`
        @keyframes flash {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-flash {
          animation: flash 0.2s ease-in-out;
        }
      `}</style>
    </div>
  )
}

