"use client"

import { useState, useEffect } from 'react'

export interface BarberSettings {
  name: string
  logoType: 'preset' | 'custom'
  logoPreset: string
  logoCustom: string // base64 data URL
}

export const DEFAULT_SETTINGS: BarberSettings = {
  name: "MK Barber",
  logoType: "preset",
  logoPreset: "vintage-gold",
  logoCustom: ""
}

export function useBarberSettings() {
  const [settings, setSettings] = useState<BarberSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = () => {
      if (typeof window === 'undefined') return
      const stored = localStorage.getItem('barber_settings')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSettings({
            name: parsed.name || DEFAULT_SETTINGS.name,
            logoType: parsed.logoType || DEFAULT_SETTINGS.logoType,
            logoPreset: parsed.logoPreset || DEFAULT_SETTINGS.logoPreset,
            logoCustom: parsed.logoCustom || DEFAULT_SETTINGS.logoCustom
          })
        } catch (e) {
          console.error("Failed to parse settings", e)
        }
      }
      setLoading(false)
    }

    loadSettings()

    const handleUpdate = () => {
      loadSettings()
    }

    window.addEventListener('barber-settings-updated', handleUpdate)
    return () => {
      window.removeEventListener('barber-settings-updated', handleUpdate)
    }
  }, [])

  const saveSettings = (newSettings: BarberSettings) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('barber_settings', JSON.stringify(newSettings))
    setSettings(newSettings)
    window.dispatchEvent(new Event('barber-settings-updated'))
  }

  return { settings, saveSettings, loading }
}
