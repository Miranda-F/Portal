import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSectors() {
  try {
    console.log('🏢 Criando setores...')

    const sectors = [
      {
        name: 'Desenvolvimento',
        description: 'Setor responsável pelo desenvolvimento de software e sistemas',
        color: '#3B82F6',
        active: true
      },
      {
        name: 'Recursos Humanos',
        description: 'Setor responsável pela gestão de pessoas e processos administrativos',
        color: '#10B981',
        active: true
      },
      {
        name: 'Financeiro',
        description: 'Setor responsável pela gestão financeira e contábil',
        color: '#F59E0B',
        active: true
      },
      {
        name: 'Marketing',
        description: 'Setor responsável pela comunicação e promoção da empresa',
        color: '#8B5CF6',
        active: true
      },
      {
        name: 'Vendas',
        description: 'Setor responsável pela comercialização de produtos e serviços',
        color: '#EF4444',
        active: true
      },
      {
        name: 'Suporte Técnico',
        description: 'Setor responsável pelo suporte e manutenção técnica',
        color: '#06B6D4',
        active: true
      },
      {
        name: 'Qualidade',
        description: 'Setor responsável pelo controle de qualidade e processos',
        color: '#84CC16',
        active: true
      },
      {
        name: 'Jurídico',
        description: 'Setor responsável pelas questões legais e contratuais',
        color: '#F97316',
        active: true
      }
    ]

    for (const sector of sectors) {
      const existing = await prisma.sector.findFirst({
        where: { name: sector.name }
      })

      if (!existing) {
        await prisma.sector.create({
          data: sector
        })
        console.log(`✅ Setor criado: ${sector.name}`)
      } else {
        console.log(`⚠️  Setor já existe: ${sector.name}`)
      }
    }

    console.log('✅ Setores criados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar setores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSectors()
