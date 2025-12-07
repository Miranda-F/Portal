"use client"

import * as React from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

export function NotificationToggle() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Bem-vindo ao Portal',
      message: 'Seja bem-vindo ao Portal do Pratagy! Explore todos os recursos disponíveis.',
      timestamp: '2024-01-15T10:30:00',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Novo Evento Disponível',
      message: 'Um novo evento corporativo foi agendado para próxima semana.',
      timestamp: '2024-01-14T15:45:00',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Atualização do Sistema',
      message: 'O sistema foi atualizado com novas funcionalidades de segurança.',
      timestamp: '2024-01-13T09:00:00',
      read: true,
      type: 'info'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Agora'
    } else if (diffInHours < 24) {
      return `Há ${diffInHours}h`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-1.5" />
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative text-gray-300 border-gray-500/30 hover:bg-white/10 hover:text-white hover:border-white/50 bg-gray-800/20"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start w-full gap-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h5>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end w-full mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}