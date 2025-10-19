import { db } from '../src/lib/db'
import { ActionType, ActionResult, RequestSource } from '@prisma/client'

async function createAuditLogs() {
  try {
    console.log('Creating sample audit logs...')

    // Buscar um usuário admin para associar aos logs
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('No admin user found. Creating one first...')
      // Criar um usuário admin se não existir
      const { hashPassword } = await import('../src/lib/auth')
      const hashedPassword = await hashPassword('admin123')
      
      const newAdmin = await db.user.create({
        data: {
          email: 'admin@pratagy.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN',
          approved: true
        }
      })
      
      console.log('Created admin user:', newAdmin.email)
    }

    // Criar logs de auditoria de exemplo
    const sampleLogs = [
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Usuário realizou login no sistema',
        actionType: ActionType.LOGIN,
        description: 'Login bem-sucedido no painel administrativo',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Criou novo usuário',
        actionType: ActionType.CREATE,
        description: 'Criou novo usuário joao.silva@pratagy.com',
        entityType: 'USER',
        entityId: 'user-123',
        entityName: 'João Silva',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS,
        details: JSON.stringify({
          oldValues: null,
          newValues: {
            email: 'joao.silva@pratagy.com',
            name: 'João Silva',
            role: 'USER'
          }
        })
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Atualizou configurações do sistema',
        actionType: ActionType.SETTINGS_CHANGE,
        description: 'Alterou configurações de segurança do sistema',
        entityType: 'SETTINGS',
        entityId: 'settings-1',
        entityName: 'Configurações de Segurança',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS,
        details: JSON.stringify({
          oldValues: { sessionTimeout: 30 },
          newValues: { sessionTimeout: 60 }
        })
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Visualizou relatório de atividades',
        actionType: ActionType.VIEW,
        description: 'Acessou relatório de atividades dos últimos 30 dias',
        entityType: 'REPORT',
        entityId: 'report-1',
        entityName: 'Relatório de Atividades',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Exportou logs de auditoria',
        actionType: ActionType.EXPORT,
        description: 'Exportou logs de auditoria em formato CSV',
        entityType: 'AUDIT_LOG',
        entityId: 'export-1',
        entityName: 'Exportação de Logs',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Tentativa de login falhou',
        actionType: ActionType.LOGIN,
        description: 'Tentativa de acesso com credenciais inválidas',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.FAILURE,
        errorCode: 'INVALID_CREDENTIALS',
        errorMessage: 'Credenciais inválidas'
      },
      {
        userId: adminUser?.id,
        userName: adminUser?.name || 'Administrador',
        userEmail: adminUser?.email || 'admin@pratagy.com',
        userRole: 'ADMIN',
        action: 'Usuário realizou logout',
        actionType: ActionType.LOGOUT,
        description: 'Logout realizado com sucesso',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS
      }
    ]

    // Inserir os logs no banco de dados
    for (const logData of sampleLogs) {
      await db.auditLog.create({
        data: logData
      })
    }

    console.log(`Successfully created ${sampleLogs.length} audit logs`)
    
    // Exibir os logs criados
    const createdLogs = await db.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\nCreated audit logs:')
    createdLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.actionType} - ${log.action} (${log.result})`)
      console.log(`   User: ${log.userName} (${log.userEmail})`)
      console.log(`   Date: ${log.createdAt.toISOString()}`)
      console.log(`   IP: ${log.ipAddress}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error creating audit logs:', error)
  } finally {
    await db.$disconnect()
  }
}

// Executar o script
createAuditLogs()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })