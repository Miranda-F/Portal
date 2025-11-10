import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

const testUsers = [
  {
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Maria Oliveira',
    email: 'maria.oliveira@empresa.com',
    role: 'USER',
    approved: false
  },
  {
    name: 'João Costa',
    email: 'joao.costa@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Fernanda Lima',
    email: 'fernanda.lima@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Pedro Alves',
    email: 'pedro.alves@empresa.com',
    role: 'USER',
    approved: false
  },
  {
    name: 'Lucia Ferreira',
    email: 'lucia.ferreira@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Rafael Souza',
    email: 'rafael.souza@empresa.com',
    role: 'USER',
    approved: true
  },
  {
    name: 'Camila Rocha',
    email: 'camila.rocha@empresa.com',
    role: 'USER',
    approved: false
  },
  {
    name: 'Diego Martins',
    email: 'diego.martins@empresa.com',
    role: 'USER',
    approved: true
  }
]

async function createTestUsers() {
  try {
    console.log('🚀 Iniciando criação de usuários de teste...')
    
    // Verificar se já existem usuários de teste
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: testUsers.map(user => user.email)
        }
      }
    })

    if (existingUsers.length > 0) {
      console.log('⚠️  Alguns usuários de teste já existem:')
      existingUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`)
      })
      
      const shouldContinue = process.argv.includes('--force')
      if (!shouldContinue) {
        console.log('\n💡 Use --force para recriar os usuários existentes')
        return
      }
    }

    // Buscar um setor para associar os usuários (ou criar um padrão)
    let defaultSector = await prisma.sector.findFirst({
      where: { name: 'Desenvolvimento' }
    })

    if (!defaultSector) {
      defaultSector = await prisma.sector.create({
        data: {
          name: 'Desenvolvimento',
          description: 'Setor de desenvolvimento de software',
          active: true
        }
      })
      console.log('✅ Setor padrão "Desenvolvimento" criado')
    }

    // Criar usuários
    const createdUsers = []
    const password = '123456' // Senha padrão para todos os usuários de teste
    const hashedPassword = await hashPassword(password)

    for (const userData of testUsers) {
      try {
        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        })

        if (existingUser) {
          console.log(`⏭️  Usuário ${userData.name} já existe, pulando...`)
          continue
        }

        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            approved: userData.approved,
            sectorId: defaultSector.id,
            lastLogin: userData.approved ? new Date() : null
          }
        })

        createdUsers.push(user)
        console.log(`✅ Usuário criado: ${user.name} (${user.email}) - ${user.approved ? 'Aprovado' : 'Pendente'}`)
      } catch (error) {
        console.error(`❌ Erro ao criar usuário ${userData.name}:`, error)
      }
    }

    console.log(`\n🎉 Processo concluído!`)
    console.log(`📊 Estatísticas:`)
    console.log(`   - Usuários criados: ${createdUsers.length}`)
    console.log(`   - Aprovados: ${createdUsers.filter(u => u.approved).length}`)
    console.log(`   - Pendentes: ${createdUsers.filter(u => !u.approved).length}`)
    console.log(`\n🔑 Senha padrão para todos os usuários: ${password}`)
    console.log(`\n📧 Emails dos usuários criados:`)
    createdUsers.forEach(user => {
      console.log(`   - ${user.email}`)
    })

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
createTestUsers()
