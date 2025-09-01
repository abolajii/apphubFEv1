/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/abolaji-ux-kit/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 15px 35px 0 rgba(31, 38, 135, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
  // Ensure all classes are preserved in production
  safelist: [
    // Gradient classes
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',
    'from-blue-50',
    'from-blue-100',
    'from-slate-50',
    'from-gray-50',
    'from-purple-50',
    'from-white',
    'via-white',
    'via-transparent',
    'to-purple-50',
    'to-gray-50',
    'to-gray-100',
    'to-blue-50',
    'to-blue-100',
    'to-transparent',
    // Z-index classes
    'z-10',
    'z-15',
    'z-20',
    'z-50',
    'z-9999',
    // Animation classes
    'transition-all',
    'duration-300',
    'hover:shadow-xl',
    'hover:-translate-y-1',
    'hover:scale-105',
    // Color variants for badges
    'bg-red-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'text-red-600',
    'text-yellow-600',
    'text-green-600',
    'text-blue-600',
    // Border colors
    'border-blue-200',
    'border-slate-200',
    'border-gray-300',
  ],
}
