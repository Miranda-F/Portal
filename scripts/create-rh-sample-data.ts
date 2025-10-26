import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createRHSampleData() {
  try {
    console.log('👥 Criando dados de exemplo do RH...')

    // Buscar setor padrão
    const sector = await prisma.sector.findFirst()
    
    if (!sector) {
      console.log('❌ Nenhum setor encontrado. Execute create-sectors.ts primeiro.')
      return
    }

    const employees = [
      {
        name: 'Maria Silva',
        email: 'maria.silva@pratagy.com.br',
        position: 'Gerente de RH',
        department: 'Recursos Humanos',
        hireDate: new Date('2020-01-15'),
        salary: 8000.00,
        status: 'ACTIVE',
        sectorId: sector.id
      },
      {
        name: 'João Santos',
        email: 'joao.santos@pratagy.com.br',
        position: 'Analista de RH',
        department: 'Recursos Humanos',
        hireDate: new Date('2021-03-20'),
        salary: 5500.00,
        status: 'ACTIVE',
        sectorId: sector.id
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@pratagy.com.br',
        position: 'Assistente de RH',
        department: 'Recursos Humanos',
        hireDate: new Date('2022-06-10'),
        salary: 3500.00,
        status: 'ACTIVE',
        sectorId: sector.id
      },
      {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@pratagy.com.br',
        position: 'Coordenador de Treinamento',
        department: 'Recursos Humanos',
        hireDate: new Date('2019-09-05'),
        salary: 6500.00,
        status: 'ON_LEAVE',
        sectorId: sector.id
      },
      {
        name: 'Fernanda Lima',
        email: 'fernanda.lima@pratagy.com.br',
        position: 'Especialista em Folha',
        department: 'Recursos Humanos',
        hireDate: new Date('2020-11-12'),
        salary: 4800.00,
        status: 'INACTIVE',
        sectorId: sector.id
      }
    ]

    for (const employee of employees) {
      const existing = await prisma.employee.findFirst({
        where: { email: employee.email }
      })

      if (!existing) {
        await prisma.employee.create({
          data: employee
        })
        console.log(`✅ Funcionário criado: ${employee.name}`)
      } else {
        console.log(`⚠️  Funcionário já existe: ${employee.name}`)
      }
    }

    console.log('✅ Dados de exemplo do RH criados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar dados do RH:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRHSampleData()
