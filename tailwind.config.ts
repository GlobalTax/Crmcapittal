
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

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
			padding: '2rem',
		screens: {
			'xs': '375px',
			'sm': '768px',
			'md': '1024px',
			'lg': '1280px',
			'xl': '1536px',
			'2xl': '1400px'
		}
		},
		extend: {
			fontSize: {
				'xs': ['0.8125rem', { lineHeight: '1.4' }],
				'sm': ['0.9375rem', { lineHeight: '1.5' }],
				'base': ['1rem', { lineHeight: '1.6' }],
				'lg': ['1.125rem', { lineHeight: '1.6' }],
				'xl': ['1.25rem', { lineHeight: '1.6' }],
				'2xl': ['1.5rem', { lineHeight: '1.5' }],
				'3xl': ['1.875rem', { lineHeight: '1.4' }],
			},
			fontFamily: {
				sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				DEFAULT: '6px',
				sm: '4px',
				lg: '8px',
				xl: '12px',
			},
			borderWidth: {
				'0.5': '0.5px',
			},
			boxShadow: {
				sm: '0 2px 6px rgba(0, 0, 0, 0.05)',
			},
			colors: {
				primary: {
					DEFAULT: 'hsl(220, 13%, 42%)',
					hover: 'hsl(220, 13%, 35%)',
					foreground: 'hsl(0, 0%, 100%)'
				},
				neutral: {
					0: 'hsl(0, 0%, 100%)',
					100: 'hsl(220, 9%, 96%)',
					900: 'hsl(220, 9%, 9%)',
				},
				success: {
					DEFAULT: 'hsl(158, 64%, 35%)',
					foreground: 'hsl(0, 0%, 100%)'
				},
				warning: {
					DEFAULT: 'hsl(38, 92%, 48%)',
					foreground: 'hsl(0, 0%, 100%)'
				},
				stage: {
					lead: 'hsl(220, 13%, 42%)',
					'in-progress': 'hsl(38, 92%, 48%)',
					won: 'hsl(158, 64%, 35%)',
					lost: 'hsl(0, 73%, 50%)'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'checkmark': {
					'0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
					'50%': { transform: 'scale(1.2) rotate(-45deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'checkmark': 'checkmark 0.5s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'shake': 'shake 0.5s ease-in-out',
				'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			}
		}
	},
	plugins: [
		tailwindAnimate,
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
	],
} satisfies Config;
