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
        cpf: '12345678901',
        name: 'Maria Silva',
        email: 'maria.silva@pratagy.com.br',
        phone: '(11) 9876-5432',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        position: 'Gerente de RH',
        sectorId: sector.id,
        admissionDate: new Date('2020-01-15'),
        salary: 8000.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1985-05-15'),
        gender: 'FEMALE',
        educationLevel: 'COLLEGE',
        maritalStatus: 'MARRIED',
        emergencyContact: 'João Silva',
        emergencyPhone: '(11) 9876-5433'
      },
      {
        cpf: '23456789012',
        name: 'João Santos',
        email: 'joao.santos@pratagy.com.br',
        phone: '(11) 9765-4321',
        address: 'Av. Paulista, 456 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        position: 'Analista de RH',
        sectorId: sector.id,
        admissionDate: new Date('2021-03-20'),
        salary: 5500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1990-08-22'),
        gender: 'MALE',
        educationLevel: 'COLLEGE',
        maritalStatus: 'SINGLE',
        emergencyContact: 'Maria Santos',
        emergencyPhone: '(11) 9765-4322'
      },
      {
        cpf: '34567890123',
        name: 'Ana Costa',
        email: 'ana.costa@pratagy.com.br',
        phone: '(11) 8654-3210',
        address: 'Rua Augusta, 789 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01405-000',
        position: 'Assistente de RH',
        sectorId: sector.id,
        admissionDate: new Date('2022-06-10'),
        salary: 3500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1995-12-03'),
        gender: 'FEMALE',
        educationLevel: 'HIGH_SCHOOL',
        maritalStatus: 'SINGLE',
        emergencyContact: 'José Costa',
        emergencyPhone: '(11) 8654-3211'
      },
      {
        cpf: '45678901234',
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@pratagy.com.br',
        phone: '(11) 7543-2109',
        address: 'Rua Brasil, 1000 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01500-000',
        position: 'Coordenador de Treinamento',
        sectorId: sector.id,
        admissionDate: new Date('2019-09-05'),
        salary: 6500.00,
        employmentType: 'CLT',
        status: 'ON_LEAVE',
        birthDate: new Date('1982-04-18'),
        gender: 'MALE',
        educationLevel: 'GRADUATE',
        maritalStatus: 'MARRIED',
        emergencyContact: 'Paula Oliveira',
        emergencyPhone: '(11) 7543-2110'
      },
      {
        cpf: '56789012345',
        name: 'Fernanda Lima',
        email: 'fernanda.lima@pratagy.com.br',
        phone: '(11) 6432-1098',
        address: 'Rua Vergueiro, 2000 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01600-000',
        position: 'Especialista em Folha',
        sectorId: sector.id,
        admissionDate: new Date('2020-11-12'),
        salary: 4800.00,
        employmentType: 'CLT',
        status: 'INACTIVE',
        birthDate: new Date('1988-07-30'),
        gender: 'FEMALE',
        educationLevel: 'GRADUATE',
        maritalStatus: 'DIVORCED',
        emergencyContact: 'Roberto Lima',
        emergencyPhone: '(11) 6432-1099'
      },
      {
        cpf: '67890123456',
        name: 'Pedro Henrique',
        email: 'pedro.henrique@pratagy.com.br',
        phone: '(11) 5321-0987',
        address: 'Rua da Consolação, 1500 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01700-000',
        position: 'Analista de Treinamento',
        sectorId: sector.id,
        admissionDate: new Date('2023-02-01'),
        salary: 4200.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1993-11-25'),
        gender: 'MALE',
        educationLevel: 'COLLEGE',
        maritalStatus: 'SINGLE',
        emergencyContact: 'Margarida Henrique',
        emergencyPhone: '(11) 5321-0988'
      },
      {
        cpf: '78901234567',
        name: 'Juliana Ferreira',
        email: 'juliana.ferreira@pratagy.com.br',
        phone: '(11) 4210-9876',
        address: 'Rua Haddock Lobo, 1000 - São Paulo/SP',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01800-000',
        position: 'Estagiária de RH',
        sectorId: sector.id,
        admissionDate: new Date('2024-01-15'),
        salary: 1500.00,
        employmentType: 'INTERN',
        status: 'ACTIVE',
        birthDate: new Date('2001-03-18'),
        gender: 'FEMALE',
        educationLevel: 'COLLEGE',
        maritalStatus: 'SINGLE',
        emergencyContact: 'Luiz Ferreira',
        emergencyPhone: '(11) 4210-9877'
      }
    ]

    for (const employee of employees) {
      const existing = await prisma.employee.findFirst({
        where: { 
          OR: [
            { cpf: employee.cpf },
            { email: employee.email }
          ]
        }
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