'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  History, FileSignature, FileCheck, FileX, Users, Download, Eye, Edit, 
  CheckCircle, XCircle, Clock, Calendar
} from "lucide-react"
import { Document, DocumentVersion, DocumentApproval, DocumentAccess } from '@/types/document'

interface DocumentHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  versions: DocumentVersion[]
  approvals: DocumentApproval[]
  access: DocumentAccess[]
  loading: boolean
}

export function DocumentHistoryModal({
  isOpen,
  onClose,
  document,
  versions,
  approvals,
  access,
  loading
}: DocumentHistoryModalProps) {
  if (!document) return null

  const getVersionStatusIcon = (status: DocumentVersion['status']) => {
    switch (status) {
      case 'approved':
        return <FileCheck className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <FileX className="h-4 w-4 text-red-500" />
      case 'draft':
        return <FileSignature className="h-4 w-4 text-yellow-500" />
      default:
        return <FileSignature className="h-4 w-4" />
    }
  }

  const getApprovalStatusIcon = (status: DocumentApproval['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getAccessActionIcon = (action: DocumentAccess['action']) => {
    switch (action) {
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'downloaded':
        return <Download className="h-4 w-4 text-green-500" />
      case 'edited':
        return <Edit className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Histórico do Documento</span>
          </DialogTitle>
          <DialogDescription>
            Histórico completo do documento: {document.code} - {document.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Código</p>
                  <p className="text-sm text-muted-foreground">{document.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Versão Atual</p>
                  <p className="text-sm text-muted-foreground">{document.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline">{document.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Setor Responsável</p>
                  <p className="text-sm text-muted-foreground">{document.responsibleSector}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* History Tabs */}
          <Tabs defaultValue="versions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="versions" className="flex items-center space-x-2">
                <FileSignature className="h-4 w-4" />
                <span>Versões</span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4" />
                <span>Aprovações</span>
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Acesso</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Versões</CardTitle>
                  <CardDescription>
                    Todas as versões do documento e suas alterações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Versão</TableHead>
                            <TableHead>Alterações</TableHead>
                            <TableHead>Alterado por</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                Nenhuma versão encontrada
                              </TableCell>
                            </TableRow>
                          ) : (
                            versions.map((version) => (
                              <TableRow key={version.id}>
                                <TableCell className="font-medium">{version.version}</TableCell>
                                <TableCell>{version.changes}</TableCell>
                                <TableCell>{version.changedBy}</TableCell>
                                <TableCell>{new Date(version.changedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    {getVersionStatusIcon(version.status)}
                                    <span>{version.status}</span>
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="approvals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Aprovações</CardTitle>
                  <CardDescription>
                    Solicitações de aprovação e seus status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Versão</TableHead>
                            <TableHead>Solicitado por</TableHead>
                            <TableHead>Aprovador</TableHead>
                            <TableHead>Data Solicitação</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvals.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                Nenhuma aprovação encontrada
                              </TableCell>
                            </TableRow>
                          ) : (
                            approvals.map((approval) => (
                              <TableRow key={approval.id}>
                                <TableCell className="font-medium">{approval.documentVersion}</TableCell>
                                <TableCell>{approval.requestedBy}</TableCell>
                                <TableCell>{approval.approver}</TableCell>
                                <TableCell>{new Date(approval.requestedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    {getApprovalStatusIcon(approval.status)}
                                    <span>{approval.status}</span>
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Acesso</CardTitle>
                  <CardDescription>
                    Registro de acessos e ações realizadas no documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>IP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {access.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                Nenhum registro de acesso encontrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            access.map((accessRecord) => (
                              <TableRow key={accessRecord.id}>
                                <TableCell className="font-medium">{accessRecord.userName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    {getAccessActionIcon(accessRecord.action)}
                                    <span>{accessRecord.action}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(accessRecord.timestamp).toLocaleString()}</TableCell>
                                <TableCell className="text-muted-foreground">{accessRecord.ipAddress || '-'}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}