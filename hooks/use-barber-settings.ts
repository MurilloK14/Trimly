"use client"

import { useState, useEffect } from 'react'
import { db, Barbershop } from '@/lib/db/db'

export const DEFAULT_BARBERSHOP = (id: string = "default-shop-id"): Barbershop => ({
  id,
  name: "MK Barber",
  slug: "mk-barber",
  logo_type: "preset",
  logo_preset: "vintage-gold",
  logo_custom: "",
  created_at: new Date().toISOString()
})

export function useBarberSettings(slug?: string) {
  const [settings, setSettings] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      if (slug) {
        // Load target slug (e.g. for customer booking link /agendar/[slug])
        const shop = await db.getBarbershop(slug)
        if (shop) {
          setSettings(shop)
        } else {
          // If slug was not found, return fallback based on slug formatting
          const formattedName = slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          setSettings({
            id: slug,
            name: formattedName,
            slug: slug,
            logo_type: "preset",
            logo_preset: "vintage-gold",
            logo_custom: "",
            created_at: new Date().toISOString()
          })
        }
      } else {
        // Load current active dashboard settings
        const activeSlug = typeof window !== 'undefined'
          ? localStorage.getItem('active_barbershop_slug') || 'mk-barber'
          : 'mk-barber'

        let shop = await db.getBarbershop(activeSlug)
        if (!shop) {
          // Initialize first default shop
          const fallback = DEFAULT_BARBERSHOP()
          await db.saveBarbershop(fallback)
          shop = fallback
        }
        setSettings(shop)
      }
    } catch (e) {
      console.error("Failed to load settings in hook", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()

    const handleUpdate = () => {
      loadSettings()
    }

    window.addEventListener('barber-settings-updated', handleUpdate)
    return () => {
      window.removeEventListener('barber-settings-updated', handleUpdate)
    }
  }, [slug])

  const saveSettings = async (newSettings: Barbershop) => {
    await db.saveBarbershop(newSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_barbershop_slug', newSettings.slug)
    }
    setSettings(newSettings)
    window.dispatchEvent(new Event('barber-settings-updated'))
  }

  return { settings: settings || DEFAULT_BARBERSHOP(), saveSettings, loading }
}
