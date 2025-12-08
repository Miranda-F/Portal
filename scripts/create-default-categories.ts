import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDefaultCategories() {
  try {
    console.log('📂 Criando categorias padrão...')

    const categories = [
      {
        name: 'Geral',
        description: 'Categoria geral para documentos diversos',
        color: '#3B82F6'
      },
      {
        name: 'RH',
        description: 'Documentos de recursos humanos',
        color: '#10B981'
      },
      {
        name: 'Financeiro',
        description: 'Documentos financeiros e contábeis',
        color: '#F59E0B'
      },
      {
        name: 'Técnico',
        description: 'Documentos técnicos e manuais',
        color: '#8B5CF6'
      },
      {
        name: 'Administrativo',
        description: 'Documentos administrativos',
        color: '#EF4444'
      }
    ]

    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: category.name }
      })

      if (!existing) {
        await prisma.category.create({
          data: category
        })
        console.log(`✅ Categoria criada: ${category.name}`)
      } else {
        console.log(`⚠️  Categoria já existe: ${category.name}`)
      }
    }

    console.log('✅ Categorias padrão criadas com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultCategories()
