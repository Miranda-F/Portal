"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, Reply, Edit2, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  parentId?: string
  publicationId?: string
  user: {
    id: string
    name: string
    email: string
    photoUrl?: string
  }
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  isReply?: boolean
  publicationId: string
}

export function CommentItem({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  isReply = false,
  publicationId 
}: CommentItemProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submittingReply, setSubmittingReply] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [submittingDelete, setSubmittingDelete] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const canEdit = user?.id === comment.userId || user?.role === "ADMIN"
  const canDelete = user?.id === comment.userId || user?.role === "ADMIN"
  const isAuthenticated = !!user

  const handleReply = async () => {
    if (!replyContent.trim() || !isAuthenticated) return

    try {
      setSubmittingReply(true)
      await onReply(comment.id, replyContent.trim())
      setReplyContent("")
      setShowReplyInput(false)
      setShowReplies(true)
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi publicada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return

    try {
      setSubmittingEdit(true)
      await onEdit(comment.id, editContent.trim())
      setIsEditing(false)
      toast({
        title: "Comentário atualizado",
        description: "Seu comentário foi atualizado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o comentário.",
        variant: "destructive",
      })
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSubmittingDelete(true)
      await onDelete(comment.id)
      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      })
    } finally {
      setSubmittingDelete(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch (error) {
      return "Data inválida"
    }
  }

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.photoUrl} alt={comment.user.name} />
                <AvatarFallback>
                  {getInitials(comment.user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      (editado)
                    </span>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Edite seu comentário..."
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleEdit}
                        disabled={!editContent.trim() || submittingEdit}
                      >
                        {submittingEdit ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditContent(comment.content)
                        }}
                        disabled={submittingEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isReply && (
                    <DropdownMenuItem
                      onClick={() => {
                        setShowReplyInput(!showReplyInput)
                        setShowReplies(true)
                      }}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </DropdownMenuItem>
                  )}
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                      disabled={submittingDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {submittingDelete ? "Excluindo..." : "Excluir"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {!isReply && showReplyInput && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="min-h-[80px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyContent.trim() || submittingReply}
                  >
                    {submittingReply ? "Enviando..." : "Enviar resposta"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyInput(false)
                      setReplyContent("")
                    }}
                    disabled={submittingReply}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-muted-foreground"
              >
                {showReplies 
                  ? `Ocultar ${comment.replies.length} resposta${comment.replies.length > 1 ? 's' : ''}`
                  : `Ver ${comment.replies.length} resposta${comment.replies.length > 1 ? 's' : ''}`
                }
              </Button>
              
              {showReplies && (
                <div className="mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isReply={true}
                      publicationId={publicationId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}