"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AssinaturaSucessoPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')

    if (sessionId) {
      window.location.href = `/cadastro?session_id=${encodeURIComponent(sessionId)}`
    } else {
      window.location.href = '/cadastro'
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Loader2 className="size-10 animate-spin text-primary mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">Redirecionando para a criação da sua conta...</p>
    </div>
  )
}
