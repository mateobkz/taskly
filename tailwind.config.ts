import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "#FFFFFF",
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          DEFAULT: "#14B8A6",
          foreground: "#FFFFFF",
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: "#A78BFA",
          foreground: "#FFFFFF",
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        gold: {
          DEFAULT: "#FBBF24",
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#64748B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)"
          },
          "100%": {
            opacity: "0",
            transform: "translateY(10px)"
          }
        },
        "pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.5",
            transform: "scale(1.1)"
          }
        },
        "scale": {
          "0%": {
            transform: "scale(0.95)"
          },
          "100%": {
            transform: "scale(1)"
          }
        },
        "slide-in": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(0)"
          }
        },
        "slide-out": {
          "0%": {
            transform: "translateX(0)"
          },
          "100%": {
            transform: "translateX(-100%)"
          }
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%"
          },
          "50%": {
            backgroundPosition: "100% 50%"
          },
          "100%": {
            backgroundPosition: "0% 50%"
          }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale": "scale 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
        "gradient-shift": "gradient-shift 3s ease infinite"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'auth-pattern': "url('/auth-pattern.svg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;