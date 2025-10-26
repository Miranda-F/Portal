import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('📊 Criando dados de exemplo...')

    // Buscar setor padrão
    const sector = await prisma.sector.findFirst()
    
    if (!sector) {
      console.log('❌ Nenhum setor encontrado. Execute create-sectors.ts primeiro.')
      return
    }

    // Criar usuários de exemplo
    const users = [
      {
        name: 'João Silva',
        email: 'joao.silva@pratagy.com.br',
        password: await hashPassword('123456'),
        role: 'USER',
        approved: true,
        sectorId: sector.id
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@pratagy.com.br',
        password: await hashPassword('123456'),
        role: 'USER',
        approved: true,
        sectorId: sector.id
      },
      {
        name: 'Pedro Costa',
        email: 'pedro.costa@pratagy.com.br',
        password: await hashPassword('123456'),
        role: 'USER',
        approved: false,
        sectorId: sector.id
      }
    ]

    for (const user of users) {
      const existing = await prisma.user.findFirst({
        where: { email: user.email }
      })

      if (!existing) {
        await prisma.user.create({
          data: user
        })
        console.log(`✅ Usuário criado: ${user.name}`)
      } else {
        console.log(`⚠️  Usuário já existe: ${user.name}`)
      }
    }

    // Criar eventos de exemplo
    const events = [
      {
        title: 'Reunião de Equipe',
        description: 'Reunião semanal da equipe de desenvolvimento',
        date: new Date('2024-01-15T10:00:00Z'),
        location: 'Sala de Reuniões 1',
        isActive: true
      },
      {
        title: 'Treinamento de Segurança',
        description: 'Treinamento obrigatório sobre segurança no trabalho',
        date: new Date('2024-01-20T14:00:00Z'),
        location: 'Auditório Principal',
        isActive: true
      },
      {
        title: 'Evento de Integração',
        description: 'Evento para integração de novos funcionários',
        date: new Date('2024-01-25T16:00:00Z'),
        location: 'Área de Lazer',
        isActive: true
      }
    ]

    for (const event of events) {
      const existing = await prisma.event.findFirst({
        where: { title: event.title }
      })

      if (!existing) {
        await prisma.event.create({
          data: event
        })
        console.log(`✅ Evento criado: ${event.title}`)
      } else {
        console.log(`⚠️  Evento já existe: ${event.title}`)
      }
    }

    console.log('✅ Dados de exemplo criados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()
