import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAuditLogs() {
  try {
    console.log('📝 Criando logs de auditoria de exemplo...')

    // Buscar usuário admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.log('❌ Nenhum administrador encontrado. Execute create-admin.ts primeiro.')
      return
    }

    // Criar logs de auditoria de exemplo
    const auditLogs = [
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'LOGIN',
        actionType: 'READ',
        description: 'Usuário fez login no sistema',
        entityType: 'User',
        entityId: admin.id,
        entityName: admin.name,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        result: 'SUCCESS'
      },
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'CREATE_USER',
        actionType: 'CREATE',
        description: 'Criou novo usuário',
        entityType: 'User',
        entityId: 'user123',
        entityName: 'João Silva',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        result: 'SUCCESS'
      },
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'UPDATE_SECTOR',
        actionType: 'UPDATE',
        description: 'Atualizou setor',
        entityType: 'Sector',
        entityId: 'sector123',
        entityName: 'Desenvolvimento',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        result: 'SUCCESS'
      }
    ]

    for (const log of auditLogs) {
      await prisma.auditLog.create({
        data: log
      })
    }

    console.log('✅ Logs de auditoria criados com sucesso!')
    console.log('📊 Total de logs:', auditLogs.length)

  } catch (error) {
    console.error('❌ Erro ao criar logs de auditoria:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAuditLogs()
