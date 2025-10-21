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
      } catch {}
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
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
      {/* Fullscreen background slideshow */}
      <div className="absolute inset-0 -z-10">
        {images.length === 0 && (
          <Image src="/resort-background.jpg" alt="Background" fill className="object-cover" />
        )}
        {images.length > 0 && (
          <>
            {images.map((src, i) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out will-change-[opacity] ${i === index ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            ))}
          </>
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative w-full max-w-5xl rounded-[28px] shadow-2xl bg-white/90 backdrop-blur-sm dark:bg-[#0b1e33] overflow-hidden grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] border border-white/20">
        {/* Left - Card */}
        <div className="p-6 md:p-10 lg:p-12 max-w-md w-full">
          {/* Logo principal no topo do card */}
          <div className="flex justify-center mb-8">
            <Image src="/Logo-p-pratagy.webp" alt="Portal do Pratagy" width={260} height={104} className="h-20 md:h-24 w-auto object-contain" />
          </div>

          <h1 className={`text-[28px] md:text-[32px] font-extrabold text-center mb-2 tracking-tight ${sora.className}`}>Entrar</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">Digite seus dados para acessar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="ml-2 md:ml-3">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="email" type="email" placeholder="seu.email@pratagy.com.br" className="pl-10 h-11 rounded-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="ml-2 md:ml-3">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Senha" className="pl-10 pr-10 h-11 rounded-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-0 h-full px-2 hover:bg-transparent focus-visible:ring-0 focus:outline-none" onClick={() => setShowPassword((v) => !v)}>
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
                  className="h-5 w-5 border-2 border-black/50 hover:border-black/70 data-[state=checked]:bg-black data-[state=checked]:border-black shadow-sm"
                />
                <Label htmlFor="remember" className="text-xs md:text-sm">Salvar informações</Label>
              </div>
              <Button type="button" variant="link" className="text-xs md:text-sm p-0 h-auto no-underline hover:no-underline focus-visible:ring-0 focus:outline-none text-foreground/80 hover:text-foreground" onClick={() => { setForgotOpen(true); setIsSubmitted(false); }}>Esqueci a senha</Button>
            </div>

            <Button type="submit" className={`w-full h-11 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white ${sora.className}`} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>

        {/* Right - Slideshow */}
        <div className="relative hidden md:block min-h-[560px] p-1 md:p-1 lg:p-2">
          <div className="relative h-full rounded-2xl overflow-hidden">
            {/* Right panel shows the same image, aligned to the right to "completar" o fundo */}
            {images.length === 0 && (
              <Image src="/resort-background.jpg" alt="Background right" fill className="object-cover" />
            )}
            {images.length > 0 && (
              <>
                {images.map((src, i) => (
                  <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out will-change-[opacity] pointer-events-none ${i === index ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      backgroundImage: `url(${src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: i === 2 ? 'calc(100% + 80px) center' : 'right center'
                    }}
                  />
                ))}
              {/* Gradiente sutil no rodapé para legibilidade do texto */}
              <div className="absolute inset-x-0 bottom-0 h-20 md:h-24 bg-gradient-to-t from-black/45 via-black/20 to-transparent pointer-events-none" />
              {/* Legenda do slide atual (sem fundo, mais acima) */}
              <div className={`absolute inset-x-0 px-3 md:px-4 ${index === 0 ? 'bottom-20 md:bottom-28' : 'bottom-14 md:bottom-20'}`}>
                {(() => {
                  const c = captions[index % captions.length]
                  return (
                    <div className={`mx-auto max-w-[90%] text-center`}>
                      <div className={`text-white text-base md:text-lg lg:text-xl font-semibold leading-tight ${poppins.className} ${(index === 0 || index === 1) ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''}`}>
                        {c.title}
                      </div>
                      <div className={`mt-1 text-white/95 text-xs md:text-sm lg:text-base leading-relaxed ${inter.className} ${(index === 0 || index === 1) ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''}`}>
                        {c.subtitle}
                      </div>
                    </div>
                  )
                })()}
              </div>
              </>
            )}
            {/* Indicadores do carrossel */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                 {images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ir para slide ${i + 1}`}
                     onClick={() => {
                       setIndex(i)
                       // reinicia autoplay após interação
                       if (autoRef.current) window.clearInterval(autoRef.current)
                       autoRef.current = window.setInterval(() => {
                         setIndex((cur) => (cur + 1) % images.length)
                       }, 4000)
                     }}
                    className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60 ${
                      i === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70 w-2.5'
                    }`}
                  />
                ))}
              </div>
            )}
            {/* Grupo Pratagy Logos centralizado e maior */}
            <div className="absolute inset-x-0 top-6 flex justify-center">
              <Image src={encodeURI('/Grupo Pratagy Logos.png')} alt="Grupo Pratagy Logos" width={420} height={120} className="h-20 md:h-24 w-auto object-contain drop-shadow" />
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
      {/* keyframes for bubbles */}
      <style jsx global>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-120vh) scale(1.15); }
        }
      `}</style>
    </div>
  )
}


