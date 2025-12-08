"use client"

import { Card } from "@/components/ui/card"
import { Sora } from "next/font/google"

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })

export function MissaoValoresContent() {
    return (
        <div>
            {/* Título da Seção */}
            <div className="text-center mb-10 animate-fade-in-up">
                <h2 className={`text-3xl font-bold text-slate-900 dark:text-white mb-4 ${sora.className}`}>
                    Nossa Identidade
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Conheça os pilares que guiam o Resort Pratagy, com os cards Missão, Visão e Valores
                </p>
            </div>

            {/* Cards de Missão, Visão e Valores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up animation-delay-100">
                {/* Missão */}
                <Card className="text-center p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">M</span>
                    </div>
                    <h3 className={`font-bold text-xl mb-4 text-slate-900 dark:text-white ${sora.className}`}>Missão</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                        Proporcionar experiências memoráveis e únicas, superando as expectativas dos nossos hóspedes através de um serviço excepcional, conforto e hospitalidade genuína em um paraíso tropical.
                    </p>
                </Card>

                {/* Visão */}
                <Card className="text-center p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-green-600 dark:text-green-400 font-bold text-2xl">V</span>
                    </div>
                    <h3 className={`font-bold text-xl mb-4 text-slate-900 dark:text-white ${sora.className}`}>Visão</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                        Ser reconhecido como o principal resort de luxo do Nordeste brasileiro, referência em excelência de serviços, sustentabilidade e inovação na hospitalidade.
                    </p>
                </Card>

                {/* Valores */}
                <Card className="text-center p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-2xl">V</span>
                    </div>
                    <h3 className={`font-bold text-xl mb-4 text-slate-900 dark:text-white ${sora.className}`}>Valores</h3>
                    <div className="text-left space-y-3">
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-0">Excelência:</span>
                            <span className="text-muted-foreground">Buscar sempre o melhor em tudo o que fazemos.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-0">Integridade:</span>
                            <span className="text-muted-foreground">Agir com ética e transparência.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-0">Inovação:</span>
                            <span className="text-muted-foreground">Criar soluções criativas e sustentáveis.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-0">Respeito:</span>
                            <span className="text-muted-foreground">Valorizar pessoas e o meio ambiente.</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
