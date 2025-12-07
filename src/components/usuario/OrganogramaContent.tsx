"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Sora } from "next/font/google"

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })

export function OrganogramaContent() {
    return (
        <div>
            {/* Título da Seção */}
            <div className="text-center mb-10 animate-fade-in-up">
                <h2 className={`text-3xl font-bold text-slate-900 dark:text-white mb-4 ${sora.className}`}>
                    Organograma
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Estrutura organizacional do Resort Pratagy
                </p>
            </div>

            {/* Card do Organograma */}
            <Card className="p-8 md:p-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 max-w-4xl mx-auto rounded-[32px] animate-fade-in-up animation-delay-100">
                <CardContent className="text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">OR</span>
                        </div>
                    </div>
                    <h3 className={`text-2xl font-bold text-slate-900 dark:text-white mb-4 ${sora.className}`}>
                        Organograma em Desenvolvimento
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        A estrutura organizacional completa do Resort Pratagy estará disponível em breve. Esta seção exibirá o organograma detalhado com todos os departamentos e posições da nossa equipe.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
