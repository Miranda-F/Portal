import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating default news categories...')

  const categories = [
    {
      name: 'Notícias',
      description: 'Notícias e atualizações sobre a empresa',
      color: '#3b82f6',
      icon: 'Newspaper'
    },
    {
      name: 'Eventos',
      description: 'Eventos corporativos e sociais',
      color: '#10b981',
      icon: 'Calendar'
    },
    {
      name: 'Comunicados',
      description: 'Comunicados oficiais e avisos importantes',
      color: '#f59e0b',
      icon: 'Megaphone'
    },
    {
      name: 'Campanhas',
      description: 'Campanhas internas e iniciativas',
      color: '#ef4444',
      icon: 'Target'
    },
    {
      name: 'Cultura',
      description: 'Conteúdo sobre cultura e valores da empresa',
      color: '#8b5cf6',
      icon: 'Heart'
    },
    {
      name: 'Inovação',
      description: 'Novidades e inovações tecnológicas',
      color: '#06b6d4',
      icon: 'Lightbulb'
    }
  ]

  for (const category of categories) {
    try {
      const existingCategory = await prisma.newsCategory.findUnique({
        where: { name: category.name }
      })

      if (!existingCategory) {
        await prisma.newsCategory.create({
          data: category
        })
        console.log(`Created category: ${category.name}`)
      } else {
        console.log(`Category already exists: ${category.name}`)
      }
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error)
    }
  }

  console.log('Default categories created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })