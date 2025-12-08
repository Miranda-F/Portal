'use client'

import { Document } from '@/types/document'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Lock,
  Settings,
  FolderOpen,
  FileText
} from 'lucide-react'

interface AccessControlSectionProps {
  allDocuments: Document[]
  user: any
  logout: () => void
}

// Mock data for demonstration
const mockPermissions = [
  { id: '1', folder: '/Documentos/Financeiro', user: 'João Silva', permission: 'full', grantedBy: 'Admin', grantedAt: '2024-01-15' },
  { id: '2', folder: '/Documentos/RH', user: 'Maria Santos', permission: 'edit', grantedBy: 'Admin', grantedAt: '2024-01-20' },
  { id: '3', folder: '/Documentos/Tecnologia', user: 'Pedro Costa', permission: 'view', grantedBy: 'Admin', grantedAt: '2024-02-01' },
  { id: '4', folder: '/Documentos/Comercial', user: 'Ana Oliveira', permission: 'view', grantedBy: 'Admin', grantedAt: '2024-02-10' },
]

const mockAccessLogs = [
  { id: '1', user: 'João Silva', action: 'Acessou documento', resource: 'Contrato-001.pdf', timestamp: '2024-01-15 14:30', ip: '192.168.1.100' },
  { id: '2', user: 'Maria Santos', action: 'Editou pasta', resource: '/Documentos/RH', timestamp: '2024-01-20 09:15', ip: '192.168.1.101' },
  { id: '3', user: 'Pedro Costa', action: 'Visualizou', resource: 'Relatorio-Q1.xlsx', timestamp: '2024-02-01 16:45', ip: '192.168.1.102' },
  { id: '4', user: 'Ana Oliveira', action: 'Tentativa de acesso negado', resource: '/Documentos/Financeiro', timestamp: '2024-02-10 11:20', ip: '192.168.1.103' },
]

export function AccessControlSection({ allDocuments, user, logout }: AccessControlSectionProps) {
  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'full':
        return <Badge className="bg-red-100 text-red-800">Controle Total</Badge>
      case 'edit':
        return <Badge className="bg-blue-100 text-blue-800">Editar</Badge>
      case 'view':
        return <Badge className="bg-green-100 text-green-800">Visualizar</Badge>
      default:
        return <Badge variant="outline">{permission}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Acessou') || action.includes('Visualizou')) return <Eye className="h-4 w-4 text-green-600" />
    if (action.includes('Editou')) return <Edit className="h-4 w-4 text-blue-600" />
    if (action.includes('negado')) return <Lock className="h-4 w-4 text-red-600" />
    return <Settings className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Acesso</h1>
          <p className="text-muted-foreground">
            Gerencie permissões e monitore o acesso aos documentos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissões Ativas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPermissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Em {new Set(mockPermissions.map(p => p.folder)).size} pastas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Hoje</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pastas Protegidas</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Com restrição de acesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Permissões</CardTitle>
              <CardDescription>
                Configure o acesso dos usuários às pastas e documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Gerenciar Pastas
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerenciar Documentos
                  </Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Permissão
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pasta</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Concedido por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.folder}</TableCell>
                      <TableCell>{permission.user}</TableCell>
                      <TableCell>{getPermissionBadge(permission.permission)}</TableCell>
                      <TableCell>{permission.grantedBy}</TableCell>
                      <TableCell>{new Date(permission.grantedAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Acesso</CardTitle>
              <CardDescription>
                Monitore todas as atividades de acesso aos documentos e pastas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar logs..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  Exportar Logs
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAccessLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span>{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}