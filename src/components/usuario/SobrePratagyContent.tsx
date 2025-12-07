"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sora } from "next/font/google"
import { ChevronRight, Edit, Save, X } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })

// Conteúdo padrão
const DEFAULT_CONTENT = {
    historia: `<p>O Resort Pratagy nasceu do sonho de criar um refúgio paradisíaco que combinasse o melhor da natureza com o conforto e sofisticação que nossos hóspedes merecem. Desde a nossa fundação, temos nos dedicado a oferecer experiências únicas que criam memórias duradouras.</p>
<p>Localizado em uma das praias mais deslumbrantes do Nordeste brasileiro, nosso resort foi projetado para harmonizar luxo e sustentabilidade, respeitando o meio ambiente local enquanto proporciona o máximo em conforto e entretenimento.</p>
<p>Ao longo dos anos, transformamos desafios em oportunidades e continuamos a evoluir, sempre mantendo nosso compromisso com a excelência e a satisfação dos nossos hóspedes.</p>`
}

export function SobrePratagyContentEditable() {
    const [activeSection, setActiveSection] = useState<'historia' | 'identidade' | 'organograma'>('historia')
    const [isEditing, setIsEditing] = useState(false)
    const [historiaContent, setHistoriaContent] = useState(DEFAULT_CONTENT.historia)
    const { user } = useAuth()
    const { toast } = useToast()

    // Verificar se o usuário é admin
    const isAdmin = user?.role === 'ADMIN'

    // Carregar conteúdo salvo do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sobre-pratagy-historia')
        if (saved) {
            setHistoriaContent(saved)
        }
    }, [])

    const handleSave = () => {
        // Salvar no localStorage (em produção, seria uma API call)
        localStorage.setItem('sobre-pratagy-historia', historiaContent)
        setIsEditing(false)
        toast({
            title: "Conteúdo salvo!",
            description: "As alterações foram salvas com sucesso.",
        })
    }

    const handleCancel = () => {
        // Restaurar conteúdo salvo
        const saved = localStorage.getItem('sobre-pratagy-historia')
        if (saved) {
            setHistoriaContent(saved)
        } else {
            setHistoriaContent(DEFAULT_CONTENT.historia)
        }
        setIsEditing(false)
    }

    return (
        <div>
            {/* Título da Página com Imagem de Fundo */}
            <div className="relative mb-16 rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up">
                {/* Imagem de fundo */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: "url('/resort-background.jpg')" }}
                />

                {/* Overlay para melhorar a legibilidade do texto */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

                {/* Conteúdo do card */}
                <div className="relative z-10 text-center p-16 md:p-24">
                    <h1 className={`text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg ${sora.className}`}>
                        Sobre o Resort Pratagy
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-md font-light">
                        Conheça a história, os valores e o compromisso que fazem do Resort Pratagy um destino único e inesquecível.
                    </p>
                </div>
            </div>

            {/* Breadcrumb de Navegação */}
            <nav className="mb-12 animate-fade-in-up animation-delay-100" aria-label="Navegação de seções">
                <div className="flex items-center justify-center space-x-4 text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-full border border-white/20 inline-flex mx-auto w-full max-w-fit">
                    <button
                        onClick={() => setActiveSection('historia')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeSection === 'historia'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <span>Sobre o Pratagy</span>
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    <button
                        onClick={() => setActiveSection('identidade')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeSection === 'identidade'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <span>Missão, Visão e Valores</span>
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    <button
                        onClick={() => setActiveSection('organograma')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeSection === 'organograma'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <span>Organograma</span>
                    </button>
                </div>
            </nav>

            {/* Conteúdo Condicional das Seções */}
            <div className="mb-16">
                {/* Seção Nossa História */}
                {activeSection === 'historia' && (
                    <div className="mb-16 animate-fade-in-up animation-delay-200">
                        <div className="text-center mb-10">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <h2 className={`text-3xl font-bold text-slate-900 dark:text-white ${sora.className}`}>
                                    Nossa História
                                </h2>
                                {isAdmin && !isEditing && (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Editar
                                    </Button>
                                )}
                            </div>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Conheça a jornada do Resort Pratagy desde sua fundação até se tornar um dos principais resorts do Nordeste brasileiro
                            </p>
                        </div>

                        <Card className="p-8 md:p-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 max-w-4xl mx-auto rounded-[32px]">
                            <CardContent className="space-y-6">
                                {isEditing ? (
                                    <>
                                        <RichTextEditor
                                            content={historiaContent}
                                            onChange={setHistoriaContent}
                                            placeholder="Digite a história do Resort Pratagy..."
                                            editable={true}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                className="gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                Salvar
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="prose prose-base dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: historiaContent }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Seção Nossa Identidade - Missão, Visão e Valores */}
                {activeSection === 'identidade' && (
                    <div className="mb-16 animate-fade-in-up animation-delay-200" id="nossa-identidade">
                        <div className="text-center mb-10">
                            <h2 className={`text-3xl font-bold text-slate-900 dark:text-white mb-4 ${sora.className}`}>
                                Nossa Identidade
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Conheça os pilares que guiam o Resort Pratagy, com os cards Missão, Visão e Valores
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                )}

                {/* Seção Organograma (Placeholder) */}
                {activeSection === 'organograma' && (
                    <div className="mb-16 animate-fade-in-up animation-delay-200">
                        <div className="text-center mb-10">
                            <h2 className={`text-3xl font-bold text-slate-900 dark:text-white mb-4 ${sora.className}`}>
                                Organograma
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Estrutura organizacional do Resort Pratagy
                            </p>
                        </div>

                        <Card className="p-8 md:p-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl border-white/20 dark:border-slate-800 max-w-4xl mx-auto rounded-[32px]">
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
                )}
            </div>
        </div>
    )
}
