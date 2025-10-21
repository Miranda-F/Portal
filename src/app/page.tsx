"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading-spinner"
import LoginPage from "@/components/LoginPage"

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="xl" text="Carregando..." />
      </div>
    }>
      <LoginPage />
    </Suspense>
  )
}