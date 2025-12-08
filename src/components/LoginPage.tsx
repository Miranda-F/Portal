"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { Sora, Inter, Poppins } from "next/font/google"

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] })
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"] })

export default function LoginPage() {
  const { login } = useAuth()

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")

  // Backgrounds
  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const autoRef = useRef<number | null>(null)
  // Legendas por slide (título + subtítulo)
  const captions = [
    {
      title: "Natureza que inspira",
      subtitle: "Entre mar, rio e Mata Atlântica: um refúgio em meio ao verde",
    },
    {
      title: "Experiências incríveis",
      subtitle: "Piscinas, trilhas e lazer para todas as idades o ano inteiro",
    },
    {
      title: "Sabor e acolhimento",
      subtitle: "Gastronomia regional, hospitalidade e momentos inesquecíveis",
    },
  ]

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const res = await fetch('/api/admin/login-background')
        if (res.ok) {
          const data = await res.json()
          const list: string[] = data.backgroundImages?.length
            ? data.backgroundImages
            : (data.backgroundImageUrl ? [data.backgroundImageUrl] : [])
          // Remover duplicadas (mesma imagem com extensões diferentes) e preferir .webp
          const byBase: Record<string, string> = {}
          for (const url of list) {
            const base = url.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
            const isWebp = /\.webp$/i.test(url)
            const current = byBase[base]
            if (!current) {
              byBase[base] = url
            } else if (isWebp && !/\.webp$/i.test(current)) {
              byBase[base] = url
            }
          }
          const deduped = Array.from(new Set(Object.values(byBase)))
          setImages(deduped)
        }
      } catch {
        // Se falhar, mantém array vazio para não mostrar imagem
      }
    }
    fetchBackgrounds()
  }, [])

  useEffect(() => {
    const start = () => {
      if (autoRef.current) window.clearInterval(autoRef.current)
      if (images.length > 1) {
        autoRef.current = window.setInterval(() => {
          setIndex((i) => (i + 1) % images.length)
        }, 4000)
      }
    }
    start()
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current)
    }
  }, [images])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      sessionStorage.setItem('loginInProgress', 'true')
      await login(email, password)
      sessionStorage.removeItem('loginInProgress')
      window.location.href = '/usuario'
    } catch {
      sessionStorage.removeItem('loginInProgress')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      if (!res.ok) throw new Error()
      setIsSubmitted(true)
    } catch {
      // mantém modal aberto pro usuário tentar novamente
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-[#0b1e33] animate-fade-in relative z-10">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-slide-down">
            <Image
              src="/Logo-p-pratagy.webp"
              alt="Portal do Pratagy"
              width={260}
              height={104}
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-muted-foreground animate-slide-up animation-delay-200">
              Digite seus dados para acessar o portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 animate-slide-up animation-delay-300">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-5 w-5 transition-colors group-focus-within:text-cyan-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@pratagy.com.br"
                  className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-5 w-5 transition-colors group-focus-within:text-cyan-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="pl-12 pr-12 h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground hover:text-cyan-600 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(!!c)}
                  className="h-5 w-5 border-2 border-slate-300 hover:border-slate-400 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600 shadow-sm rounded transition-all"
                />
                <Label htmlFor="remember" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">Salvar informações</Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-sm p-0 h-auto no-underline hover:text-cyan-600 transition-colors"
                onClick={() => { setForgotOpen(true); setIsSubmitted(false); }}
              >
                Esqueci a senha
              </Button>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:-translate-y-0.5 ${sora.className} text-base font-semibold`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Acessar Portal"
              )}
            </Button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; 2024 Grupo Pratagy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Slideshow */}
      <div className="relative hidden md:block h-full w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          {images.length > 0 && (
            <>
              {images.map((src, i) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out will-change-[opacity] ${i === index ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </>
          )}
          {/* Sombreado para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Legendas */}
          <div className="absolute inset-x-0 bottom-0 p-12 z-20">
            <div className="max-w-2xl">
              {(() => {
                const c = captions[index % captions.length]
                return (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className={`text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg ${sora.className}`}>
                      {c.title}
                    </h2>
                    <p className={`text-lg lg:text-xl text-white/90 leading-relaxed max-w-lg drop-shadow-md ${inter.className}`}>
                      {c.subtitle}
                    </p>
                  </div>
                )
              })()}

              {/* Indicadores */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-8">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Ir para slide ${i + 1}`}
                      onClick={() => {
                        setIndex(i)
                        if (autoRef.current) window.clearInterval(autoRef.current)
                        autoRef.current = window.setInterval(() => {
                          setIndex((cur) => (cur + 1) % images.length)
                        }, 4000)
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${i === index ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60 w-4'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Recuperar senha</DialogTitle>
          </DialogHeader>
          {!isSubmitted ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input id="forgot-email" type="email" placeholder="seu.email@pratagy.com.br" className="pl-10 h-11" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Enviando…' : 'Enviar'}</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotOpen(false)}>Cancelar</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <p>Enviamos um link para {forgotEmail}. Verifique sua caixa de entrada.</p>
              <Button variant="outline" onClick={() => setForgotOpen(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


