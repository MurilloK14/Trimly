"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { db } from "@/lib/db/db"
import type { Barbershop } from "@/lib/db/db"

export const DEFAULT_BARBERSHOP = (id: string = "default-shop-id"): Barbershop => ({
  id,
  name: "Trimly",
  slug: "mk-barber",
  logo_type: "preset",
  logo_preset: "vintage-gold",
  logo_custom: "",
  logo_position: "center",
  created_at: new Date().toISOString(),
})

interface BarberSettingsContextValue {
  settings: Barbershop
  loading: boolean
  saveSettings: (newSettings: Barbershop) => Promise<void>
}

const BarberSettingsContext = createContext<BarberSettingsContextValue>({
  settings: DEFAULT_BARBERSHOP(),
  loading: true,
  saveSettings: async () => {},
})

export function BarberSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Barbershop>(DEFAULT_BARBERSHOP())
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const activeSlug =
        typeof window !== "undefined"
          ? localStorage.getItem("active_barbershop_slug") || "mk-barber"
          : "mk-barber"

      let shop = await db.getBarbershop(activeSlug)
      if (!shop) {
        const fallback = DEFAULT_BARBERSHOP()
        await db.saveBarbershop(fallback)
        shop = fallback
      }
      setSettings(shop)
    } catch (e) {
      console.error("Failed to load barber settings", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = useCallback(async (newSettings: Barbershop) => {
    await db.saveBarbershop(newSettings)
    if (typeof window !== "undefined") {
      localStorage.setItem("active_barbershop_slug", newSettings.slug)
    }
    setSettings(newSettings)
  }, [])

  return (
    <BarberSettingsContext.Provider value={{ settings, loading, saveSettings }}>
      {children}
    </BarberSettingsContext.Provider>
  )
}

export function useBarberSettings(slug?: string) {
  const ctx = useContext(BarberSettingsContext)

  const [externalSettings, setExternalSettings] = useState<Barbershop | null>(null)
  const [externalLoading, setExternalLoading] = useState(!!slug)

  useEffect(() => {
    if (!slug) return
    setExternalLoading(true)
    db.getBarbershop(slug)
      .then((shop) => {
        if (shop) {
          setExternalSettings(shop)
        } else {
          const formattedName = slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
          setExternalSettings({
            id: slug,
            name: formattedName,
            slug,
            logo_type: "preset",
            logo_preset: "vintage-gold",
            logo_custom: "",
            logo_position: "center",
            created_at: new Date().toISOString(),
          })
        }
      })
      .finally(() => setExternalLoading(false))
  }, [slug])

  if (slug) {
    return {
      settings: externalSettings || DEFAULT_BARBERSHOP(slug),
      loading: externalLoading,
      saveSettings: ctx.saveSettings,
    }
  }

  return ctx
}
