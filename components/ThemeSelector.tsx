'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Leaf, Snowflake, Flower, Flame } from 'lucide-react';

type Theme = 'light' | 'dark' | 'autumn' | 'winter' | 'spring' | 'summer';

const themes = [
  { id: 'light' as Theme, name: 'Clair', icon: Sun, color: 'text-yellow-600' },
  { id: 'dark' as Theme, name: 'Sombre', icon: Moon, color: 'text-purple-400' },
  { id: 'autumn' as Theme, name: 'Automne', icon: Leaf, color: 'text-orange-600' },
  { id: 'winter' as Theme, name: 'Hiver', icon: Snowflake, color: 'text-blue-500' },
  { id: 'spring' as Theme, name: 'Printemps', icon: Flower, color: 'text-green-500' },
  { id: 'summer' as Theme, name: 'Été', icon: Flame, color: 'text-amber-500' },
];

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  const CurrentIcon = themes.find(t => t.id === currentTheme)?.icon || Sun;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-wood-100 hover:bg-wood-200 transition-colors border border-wood-300"
        aria-label="Changer de thème"
      >
        <CurrentIcon className="h-5 w-5 text-wood-700" />
        <span className="hidden md:inline text-sm font-medium text-wood-800">Thème</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu des thèmes */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-wood-200 z-50 overflow-hidden">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-wood-600 uppercase tracking-wider">
                Choisir un thème
              </p>
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isActive = currentTheme === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all
                      ${isActive 
                        ? 'bg-purple-100 text-purple-900 font-medium' 
                        : 'hover:bg-wood-50 text-wood-800'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : theme.color}`} />
                    <span className="flex-1 text-left">{theme.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

