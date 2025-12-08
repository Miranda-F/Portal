"use client"

import { useState } from "react"
import {
    Building2,
    FileText,
    MessageSquare,
    Phone,
    Mail,
    Target,
    Network,
    Settings,
    UserCheck,
    ChevronRight,
    Home,
    ChevronDown,
    ChevronLeft,
    User,
    LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/utils"

interface SidebarItem {
    id: string
    title: string
    icon: React.ReactNode
    href?: string
    badge?: string
    onClick?: () => void
    children?: {
        id: string
        title: string
        description?: string
        icon?: React.ReactNode
        href?: string
        badge?: string
    }[]
}

const getSidebarItems = (onProfileClick?: () => void): SidebarItem[] => [
    {
        id: "home",
        title: "Portal do Colaborador",
        icon: <Home className="h-4 w-4" />,
        href: "/usuario"
    },
    {
        id: "meu-perfil",
        title: "Meu Perfil",
        icon: <User className="h-4 w-4" />,
        href: "/perfil"
    },
    {
        id: "institucional",
        title: "Nossa Empresa",
        icon: <Building2 className="h-4 w-4" />,
        children: [
            {
                id: "sobre",
                title: "Sobre o Pratagy",
                description: "Nossa história",
                icon: <Building2 className="h-4 w-4" />,
                href: "/sobre-pratagy"
            },
            {
                id: "missao",
                title: "Missão e Valores",
                description: "Nossos princípios",
                icon: <Target className="h-4 w-4" />,
                href: "/sobre-pratagy#nossa-identidade"
            },
            {
                id: "organograma",
                title: "Organograma",
                description: "Estrutura organizacional",
                icon: <Network className="h-4 w-4" />,
                href: "/organograma"
            }
        ]
    },
    {
        id: "funcionalidades",
        title: "Módulos",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                id: "qualidade",
                title: "Qualidade",
                description: "Documentos da qualidade",
                icon: <FileText className="h-4 w-4" />,
                href: "/qualidade"
            },
            {
                id: "rh",
                title: "Recursos Humanos",
                description: "Gestão de colaboradores",
                icon: <UserCheck className="h-4 w-4" />,
                href: "/rh"
            },
            {
                id: "admin",
                title: "Painel Administrativo",
                description: "Administração do sistema",
                icon: <Settings className="h-4 w-4" />,
                href: "/admin"
            }
        ]
    },
    {
        id: "fale-conosco",
        title: "Fale Conosco",
        icon: <MessageSquare className="h-4 w-4" />,
        children: [
            {
                id: "contato",
                title: "Contato",
                description: "Informações de contato",
                icon: <Phone className="h-4 w-4" />,
                href: "/contato"
            },
            {
                id: "ouvidoria",
                title: "Ouvidoria",
                description: "Canal de denúncias",
                icon: <Mail className="h-4 w-4" />,
                href: "/ouvidoria"
            }
        ]
    }
]

interface UsuarioSidebarProps {
    className?: string
    onNavigate?: (href: string) => void
    onProfileClick?: () => void
}

export function UsuarioSidebar({ className, onNavigate, onProfileClick }: UsuarioSidebarProps) {
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { user, logout } = useAuth()
    const sidebarItems = getSidebarItems(onProfileClick)

    const toggleItem = (itemId: string) => {
        if (isCollapsed) return
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    const handleNavigation = (item: SidebarItem) => {
        if (item.onClick) {
            item.onClick()
        } else if (item.href) {
            if (onNavigate) {
                onNavigate(item.href)
            } else {
                window.location.href = item.href
            }
        }
    }

    const handleChildNavigation = (href?: string) => {
        if (href) {
            if (onNavigate) {
                onNavigate(href)
            } else {
                window.location.href = href
            }
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            // Redirect to login page after successful logout
            window.location.href = '/'
        } catch (error) {
            // Even if logout fails, redirect to login page
            console.error('Logout error:', error)
            window.location.href = '/'
        }
    }

    const getFirstName = (fullName?: string) => {
        if (!fullName) return "Usuário"
        return fullName.split(" ")[0]
    }

    return (
        <TooltipProvider delayDuration={0}>
            <aside className={cn(
                "bg-white dark:bg-slate-900 border-r border-border/40 flex flex-col transition-all duration-300",
                "shadow-sm relative z-50 h-full",
                isCollapsed ? "w-16" : "w-64",
                className
            )}>
                {/* Logo Section - Only show when expanded */}
                {!isCollapsed && (
                    <div className="p-4 border-b border-border/40">
                        <div className="flex justify-center">
                            <img
                                src="/logo-portal-pratagy.png"
                                alt="Portal do Pratagy"
                                className="h-10 w-auto"
                            />
                        </div>
                    </div>
                )}
                {/* Toggle Button */}
                <div className="absolute -right-3 top-6 z-10">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-2 shadow-md hover:shadow-lg transition-all"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronLeft className="h-3 w-3" />
                        )}
                    </Button>
                </div>

                {/* Welcome Card */}
                <div className={cn(
                    "p-4 border-b border-border/40 transition-all duration-300",
                    isCollapsed ? "px-2 pt-6" : "px-4 pt-4"
                )}>
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex justify-center cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm border-2 border-yellow-400 shadow-md">
                                        {user?.name ? getInitials(user.name) : 'U'}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <div className="text-sm">
                                    <p className="font-medium">Bem-vindo(a),</p>
                                    <p className="font-bold">{getFirstName(user?.name)}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-lg border border-border/50">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-base border-2 border-yellow-400 shadow-md flex-shrink-0">
                                {user?.name ? getInitials(user.name) : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Bem-vindo(a),</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {getFirstName(user?.name)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {sidebarItems.map((item) => (
                        <div key={item.id}>
                            {item.children ? (
                                <>
                                    {isCollapsed ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-center h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors"
                                                >
                                                    <div className="text-primary/70">
                                                        {item.icon}
                                                    </div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="flex flex-col gap-1">
                                                <p className="font-semibold">{item.title}</p>
                                                {item.children.map((child) => (
                                                    <Button
                                                        key={child.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start h-auto py-1.5 text-left"
                                                        onClick={() => handleChildNavigation(child.href)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {child.icon}
                                                            <span className="text-xs">{child.title}</span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-between h-auto p-3 text-left font-medium",
                                                    "hover:bg-primary/5 transition-colors",
                                                    expandedItems.includes(item.id) && "bg-primary/5"
                                                )}
                                                onClick={() => toggleItem(item.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-primary/70">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-sm">{item.title}</span>
                                                </div>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 transition-transform text-muted-foreground",
                                                        expandedItems.includes(item.id) && "rotate-180"
                                                    )}
                                                />
                                            </Button>

                                            {expandedItems.includes(item.id) && (
                                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                                                    {item.children.map((child) => (
                                                        <Button
                                                            key={child.id}
                                                            variant="ghost"
                                                            className="w-full justify-start h-auto p-2.5 text-left hover:bg-primary/5 transition-colors"
                                                            onClick={() => handleChildNavigation(child.href)}
                                                        >
                                                            <div className="flex items-start gap-2.5 w-full">
                                                                {child.icon && (
                                                                    <div className="text-primary/60 mt-0.5">
                                                                        {child.icon}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium leading-tight">
                                                                        {child.title}
                                                                    </div>
                                                                    {child.description && (
                                                                        <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                                                                            {child.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {child.badge && (
                                                                    <Badge variant="secondary" className="text-xs shrink-0">
                                                                        {child.badge}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-center h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors"
                                                onClick={() => handleNavigation(item)}
                                            >
                                                <div className="text-primary/70">
                                                    {item.icon}
                                                </div>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors"
                                        onClick={() => handleNavigation(item)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-primary/70">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm">{item.title}</span>
                                            {item.badge && (
                                                <Badge variant="secondary" className="text-xs ml-auto">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </Button>
                                )
                            )}
                        </div>
                    ))}
                </nav>

                {/* Logout Button - Always at the bottom */}
                <div className="p-3 border-t border-border/40">
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-center h-auto p-3 text-left font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Sair</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-auto p-3 text-left font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                            onClick={handleLogout}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm">Sair</span>
                            </div>
                        </Button>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    )
}
