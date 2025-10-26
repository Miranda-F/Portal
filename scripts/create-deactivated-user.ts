import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createDeactivatedUser() {
  try {
    console.log('👤 Criando usuário desativado...')

    // Buscar setor padrão
    const sector = await prisma.sector.findFirst()
    
    if (!sector) {
      console.log('❌ Nenhum setor encontrado. Execute create-sectors.ts primeiro.')
      return
    }

    // Criar usuário desativado
    const user = await prisma.user.create({
      data: {
        name: 'Usuário Desativado',
        email: 'desativado@pratagy.com.br',
        password: await hashPassword('123456'),
        role: 'USER',
        approved: false, // Usuário não aprovado
        sectorId: sector.id
      }
    })

    console.log('✅ Usuário desativado criado com sucesso!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Senha: 123456')
    console.log('👤 Nome:', user.name)
    console.log('❌ Status: Desativado (não aprovado)')
    console.log('🏢 Setor:', sector.name)

  } catch (error) {
    console.error('❌ Erro ao criar usuário desativado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDeactivatedUser()
