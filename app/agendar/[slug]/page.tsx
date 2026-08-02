"use client"

import { useParams } from "next/navigation"
import AgendarPage from "../page"

export default function DynamicAgendarPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  return <AgendarPage slug={slug} />
}
