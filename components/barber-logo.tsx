"use client"

import { Scissors, Crown, Zap, Flame, Sparkles } from "lucide-react"

export type LogoPreset = 'vintage-gold' | 'modern-dark' | 'neon-barber' | 'royal-crown'

export function BarberLogo({
  name,
  preset = 'vintage-gold',
  customLogo = '',
  logoType = 'preset',
  size = 'md',
  showText = true
}: {
  name: string
  preset?: string
  customLogo?: string
  logoType?: 'preset' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}) {
  const isCustom = logoType === 'custom' && customLogo

  // Logo Icon/Image Render
  const renderLogoGraphic = () => {
    if (isCustom) {
      return (
        <img
          src={customLogo}
          alt={name}
          className={`object-cover rounded-full border border-border bg-secondary/50 shrink-0 ${
            size === 'sm' ? 'size-8' : size === 'md' ? 'size-12' : 'size-20'
          }`}
        />
      )
    }

    const iconSize = size === 'sm' ? 'size-4' : size === 'md' ? 'size-5' : 'size-9'

    switch (preset) {
      case 'vintage-gold':
        return (
          <div className="border-2 border-amber-500/80 rounded-full p-2 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <Scissors className={`${iconSize} text-amber-500`} />
          </div>
        )
      case 'modern-dark':
        return (
          <div className="border border-white/20 rounded-lg p-2 bg-white/5 shrink-0">
            <Sparkles className={`${iconSize} text-white`} />
          </div>
        )
      case 'neon-barber':
        return (
          <div className="border border-fuchsia-500 rounded-xl p-2 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(240,79,240,0.4)] animate-pulse shrink-0">
            <Flame className={`${iconSize} text-fuchsia-500`} />
          </div>
        )
      case 'royal-crown':
        return (
          <div className="border-2 border-yellow-400 rounded-full p-2 bg-gradient-to-b from-yellow-500/20 to-amber-600/20 shadow-[0_0_10px_rgba(234,179,8,0.3)] shrink-0">
            <Crown className={`${iconSize} text-yellow-500`} />
          </div>
        )
      default:
        return (
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Scissors className="size-4 text-primary-foreground" />
          </div>
        )
    }
  }

  // Name Render Styling based on Preset
  const renderName = () => {
    if (!showText) return null

    switch (preset) {
      case 'vintage-gold':
        return (
          <span 
            className="font-rye text-amber-500 uppercase tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'md' ? '1.2rem' : '1.8rem' }}
          >
            {name}
          </span>
        )
      case 'modern-dark':
        return (
          <span 
            className="font-sans font-bold tracking-tight text-white uppercase leading-none"
            style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'md' ? '1.15rem' : '1.75rem' }}
          >
            {name}
          </span>
        )
      case 'neon-barber':
        return (
          <span 
            className="font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 tracking-wide uppercase leading-none drop-shadow-[0_0_8px_rgba(240,79,240,0.6)]"
            style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'md' ? '1.15rem' : '1.75rem' }}
          >
            {name}
          </span>
        )
      case 'royal-crown':
        return (
          <span 
            className="font-playfair font-bold text-yellow-500 tracking-wider leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
            style={{ fontSize: size === 'sm' ? '0.9rem' : size === 'md' ? '1.35rem' : '1.95rem' }}
          >
            {name}
          </span>
        )
      default:
        return (
          <span 
            className="font-semibold text-foreground leading-none"
            style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'md' ? '1.1rem' : '1.6rem' }}
          >
            {name}
          </span>
        )
    }
  }

  return (
    <div className={`flex items-center gap-3 ${size === 'lg' ? 'flex-col justify-center' : ''}`}>
      {renderLogoGraphic()}
      {showText && renderName()}
    </div>
  )
}
