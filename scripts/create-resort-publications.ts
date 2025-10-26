import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createResortPublications() {
  try {
    console.log('🏖️ Criando publicações do resort...')

    const publications = [
      {
        title: 'Bem-vindos ao Resort Pratagy',
        content: 'Sejam bem-vindos ao nosso resort paradisíaco! Aqui vocês encontrarão conforto, lazer e momentos inesquecíveis.',
        type: 'ANNOUNCEMENT',
        priority: 'HIGH',
        isActive: true,
        publishedAt: new Date()
      },
      {
        title: 'Atividades de Verão',
        content: 'Confira nossa programação especial de verão com atividades aquáticas, esportes e entretenimento para toda a família.',
        type: 'EVENT',
        priority: 'MEDIUM',
        isActive: true,
        publishedAt: new Date()
      },
      {
        title: 'Política de Uso das Piscinas',
        content: 'Para garantir a segurança e bem-estar de todos, seguimos algumas diretrizes importantes no uso das piscinas.',
        type: 'POLICY',
        priority: 'HIGH',
        isActive: true,
        publishedAt: new Date()
      },
      {
        title: 'Menu do Restaurante Principal',
        content: 'Descubra os sabores únicos da nossa cozinha com pratos regionais e internacionais preparados com ingredientes frescos.',
        type: 'INFO',
        priority: 'LOW',
        isActive: true,
        publishedAt: new Date()
      },
      {
        title: 'Horários dos Serviços',
        content: 'Confira os horários de funcionamento de todos os nossos serviços e facilidades.',
        type: 'INFO',
        priority: 'MEDIUM',
        isActive: true,
        publishedAt: new Date()
      }
    ]

    for (const publication of publications) {
      const existing = await prisma.publication.findFirst({
        where: { title: publication.title }
      })

      if (!existing) {
        await prisma.publication.create({
          data: publication
        })
        console.log(`✅ Publicação criada: ${publication.title}`)
      } else {
        console.log(`⚠️  Publicação já existe: ${publication.title}`)
      }
    }

    console.log('✅ Publicações do resort criadas com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar publicações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createResortPublications()
