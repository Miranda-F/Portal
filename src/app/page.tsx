"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading-spinner"
import HomeContent from "@/components/HomeContent"

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="xl" text="Carregando..." />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}