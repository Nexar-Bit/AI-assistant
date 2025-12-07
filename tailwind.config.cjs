/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Automotive Primary: Workshop Blue / Industrial Gray
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Vibrant blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Secondary: Warning Orange / Success Green
        warning: {
          50: '#fff4e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb84d',
          400: '#ffa41a',
          500: '#ff8c00', // Warning orange
          600: '#cc7000',
          700: '#995400',
          800: '#663800',
          900: '#331c00',
        },
        success: {
          50: '#e6f7ed',
          100: '#b3e6c9',
          200: '#80d5a5',
          300: '#4dc481',
          400: '#1ab35d',
          500: '#00a239', // Success green
          600: '#00822d',
          700: '#006221',
          800: '#004215',
          900: '#00210a',
        },
        // Neutral: Dark Grays for Professional Look
        industrial: {
          50: '#f5f5f6',
          100: '#e5e6e8',
          200: '#d1d3d6',
          300: '#b0b3b8',
          400: '#8a8e95',
          500: '#6b6f77', // Medium gray
          600: '#52555c',
          700: '#3f4147',
          800: '#2d2f33', // Dark gray
          900: '#1e1f23', // Very dark
          950: '#0f1012', // Almost black
        },
        // Accent colors - Vibrant cyan
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee', // Vibrant cyan
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Semantic color aliases for clarity
        // Primary-Dark: industrial-950 (#0f1012)
        // Clean-White: industrial-50 (#f5f5f6)
        // Primary-Blue: primary-500 (#0073e6)
        // Tool-Steel: industrial-700 (#3f4147)
        // Workshop-Yellow: warning-400 (#ffa41a)
        // Subtle-Gray: industrial-200 (#d1d3d6) - equivalent to #E5E7EB
        // Error/Alert
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171', // Error red (lighter)
          500: '#ef4444', // Main error red
          600: '#dc2626', // Darker error red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Viewer role color - Purple/Indigo
        viewer: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Viewer purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      boxShadow: {
        'glow': '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(34, 211, 238, 0.2)',
        'glow-warning': '0 0 30px rgba(255, 140, 0, 0.4)',
        'glow-success': '0 0 30px rgba(0, 162, 57, 0.4)',
        'glow-primary': '0 0 40px rgba(59, 130, 246, 0.5)',
        'glow-accent': '0 0 40px rgba(34, 211, 238, 0.5)',
        'industrial': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 115, 230, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 115, 230, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
