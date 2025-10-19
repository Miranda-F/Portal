import { db } from '../src/lib/db'

async function createResortPublications() {
  try {
    console.log('Creating resort publications...')

    // Obter categorias
    const categories = await db.newsCategory.findMany({
      where: {
        name: {
          in: ['Comunicados', 'Eventos', 'Notícias', 'Cultura']
        }
      }
    })

    if (categories.length === 0) {
      console.error('Categories not found. Please run create-default-categories.ts first.')
      return
    }

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.id
      return acc
    }, {} as Record<string, string>)

    // Obter usuário administrador
    const adminUser = await db.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (!adminUser) {
      console.error('Admin user not found. Please run create-admin.ts first.')
      return
    }

    // Dados das publicações
    const publications = [
      {
        title: "Novo Sistema de Gestão Integrada",
        summary: "Conheça o novo sistema integrado de gestão que vai revolucionar nossos processos internos.",
        content: `
          <h2>Introdução ao Novo Sistema</h2>
          <p>Estamos entusiasmados em anunciar a implementação do nosso novo sistema de gestão integrada, uma ferramenta completa que vai transformar a forma como gerenciamos nossas operações diárias.</p>
          
          <h3>Principais Benefícios</h3>
          <ul>
            <li><strong>Centralização de informações:</strong> Todos os dados em um único lugar</li>
            <li><strong>Automação de processos:</strong> Redução de tarefas manuais e repetitivas</li>
            <li><strong>Relatórios em tempo real:</strong> Tomada de decisão baseada em dados atualizados</li>
            <li><strong>Integração total:</strong> Conexão entre todos os departamentos</li>
          </ul>
          
          <h3>Funcionalidades Destacadas</h3>
          <p>O novo sistema oferece módulos completos para:</p>
          <ul>
            <li>Gestão de recursos humanos</li>
            <li>Controle financeiro e orçamentário</li>
            <li>Gerenciamento de projetos</li>
            <li>Controle de qualidade e compliance</li>
            <li>Relacionamento com clientes</li>
          </ul>
          
          <h3>Implementação e Treinamento</h3>
          <p>A implementação será realizada em fases, começando pelos departamentos-chave. Ofereceremos treinamentos completos para toda a equipe, garantindo que todos possam aproveitar ao máximo as novas funcionalidades.</p>
          
          <h3>Próximos Passos</h3>
          <p>Fiquem atentos aos comunicados oficiais sobre o cronograma de implementação e às sessões de treinamento exclusivas para cada equipe.</p>
        `,
        slug: "novo-sistema-de-gestao-integrada",
        categoryId: categoryMap['Comunicados'],
        authorId: adminUser.id,
        featured: true,
        priority: 10,
        tags: ["gestão", "tecnologia", "inovação", "sistema", "produtividade"],
        featuredImage: "/resort-conference.jpg"
      },
      {
        title: "Workshop de Inovação e Tecnologia",
        summary: "Participe do nosso workshop exclusivo sobre tendências e inovação na hotelaria com especialistas do mercado.",
        content: `
          <h2>Workshop de Inovação e Tecnologia Hotelaria</h2>
          <p>Convidamos todos os colaboradores para participarem do nosso workshop exclusivo sobre as últimas tendências em tecnologia e inovação para o setor hoteleiro.</p>
          
          <h3>Data e Local</h3>
          <p><strong>Data:</strong> 22 de Setembro de 2024</p>
          <p><strong>Horário:</strong> 09:00 às 17:00</p>
          <p><strong>Local:</strong> Centro de Convenções do Resort</p>
          
          <h3>Palestrantes Confirmados</h3>
          <ul>
            <li><strong>Dr. Carlos Silva:</strong> Especialista em transformação digital no setor hoteleiro</li>
            <li><strong>Dra. Ana Costa:</strong> Consultora de inovação para cadeias hoteleiras internacionais</li>
            <li><strong>Eng. Roberto Santos:</strong> Especialista em IoT e automação predial</li>
          </ul>
          
          <h3>Temas Abordados</h3>
          <ul>
            <li>Inteligência Artificial aplicada à gestão hoteleira</li>
            <li>Internet das Coisas (IoT) para otimização de operações</li>
            <li>Sistemas de gestão energética sustentável</li>
            <li>Experiência do cliente através da tecnologia</li>
            <li>Gestão de dados e business intelligence</li>
          </ul>
          
          <h3>Atividades Práticas</h3>
          <p>O workshop incluirá sessões práticas onde os participantes poderão:</p>
          <ul>
            <li>Testar novas tecnologias em ambiente controlado</li>
            <li>Participar de estudos de caso reais</li>
            <li>Desenvolver projetos de inovação para o resort</li>
            <li>Networking com especialistas e outros profissionais</li>
          </ul>
          
          <h3>Inscrições</h3>
          <p>As inscrições são limitadas e devem ser feitas através do sistema interno. Prioridade será dada aos gerentes de departamento e líderes de equipe.</p>
        `,
        slug: "workshop-de-inovacao-e-tecnologia",
        categoryId: categoryMap['Eventos'],
        authorId: adminUser.id,
        featured: true,
        priority: 8,
        tags: ["workshop", "tecnologia", "inovação", "hotelaria", "treinamento"],
        featuredImage: "/resort-pool.jpg"
      },
      {
        title: "Atualização de Procedimentos Operacionais",
        summary: "Mantenha-se atualizado com as últimas alterações nos procedimentos operacionais e normas de segurança.",
        content: `
          <h2>Atualização dos Procedimentos Operacionais</h2>
          <p>Comunicamos a todas as equipes a atualização dos nossos procedimentos operacionais, visando sempre a excelência em nossos serviços e a segurança de todos.</p>
          
          <h3>Principais Alterações</h3>
          <h4>1. Procedimentos de Segurança</h4>
          <ul>
            <li>Novos protocolos de emergência</li>
            <li>Atualização dos procedimentos de evacuação</li>
            <li>Reforço nas normas de uso de EPIs</li>
            <li>Novos treinamentos obrigatórios</li>
          </ul>
          
          <h4>2. Qualidade em Serviços</h4>
          <ul>
            <li>Novos padrões de atendimento ao cliente</li>
            <li>Protocolos de higiene e limpeza reforçados</li>
            <li>Procedimentos para tratamento de reclamações</li>
            <li>Padrões de qualidade em food & beverage</li>
          </ul>
          
          <h4>3. Operações Diárias</h4>
          <ul>
            <li>Novos checklists operacionais</li>
            <li>Procedimentos de abertura e fechamento</li>
            <li>Gestão de estoques e suprimentos</li>
            <li>Manutenção preventiva de equipamentos</li>
          </ul>
          
          <h3>Cronograma de Implementação</h3>
          <p><strong>Fase 1 (Setembro):</strong> Treinamentos e capacitação</p>
          <p><strong>Fase 2 (Outubro):</strong> Implementação gradual por departamentos</p>
          <p><strong>Fase 3 (Novembro):</strong> Avaliação e ajustes</p>
          
          <h3>Responsabilidades</h3>
          <p>Cada gerente de departamento é responsável por:</p>
          <ul>
            <li>Dividulgar as alterações à sua equipe</li>
            <li>Realizar os treinamentos necessários</li>
            <li>Acompanhar a implementação</li>
            <li>Reportar problemas e sugestões</li>
          </ul>
          
          <h3>Documentação Disponível</h3>
          <p>Todos os documentos atualizados estarão disponíveis no sistema de gestão documental, incluindo manuais, checklists e formulários.</p>
        `,
        slug: "atualizacao-de-procedimentos-operacionais",
        categoryId: categoryMap['Notícias'],
        authorId: adminUser.id,
        featured: false,
        priority: 5,
        tags: ["procedimentos", "segurança", "qualidade", "operações", "atualização"],
        featuredImage: "/resort-spa.jpg"
      },
      {
        title: "Programa de Bem-Estar Corporativo",
        summary: "Descubra as novas iniciativas do nosso programa de bem-estar corporativo focado em saúde e qualidade de vida.",
        content: `
          <h2>Programa de Bem-Estar Corporativo 2024</h2>
          <p>Estamos orgulhosos de lançar nosso novo programa de bem-estar corporativo, desenvolvido para promover a saúde física, mental e emocional de toda nossa equipe.</p>
          
          <h3>Pilares do Programa</h3>
          <h4>1. Saúde Física</h4>
          <ul>
            <li><strong>Academia corporativa:</strong> Acesso gratuito à academia com equipamentos modernos</li>
            <li><strong>Aulas coletivas:</strong> Yoga, pilates, zumba e treinamento funcional</li>
            <li><strong>Avaliações periódicas:</strong> Check-ups de saúde completos</li>
            <li><strong>Nutrição:</strong> Orientação nutricional personalizada</li>
          </ul>
          
          <h4>2. Saúde Mental</h4>
          <ul>
            <li><strong>Apoio psicológico:</strong> Sessões com psicólogos especializados</li>
            <li><strong>Programa de mindfulness:</strong> Meditação e gestão de estresse</li>
            <li><strong>Workshops:</strong> Gestão emocional e equilíbrio vida-trabalho</li>
            <li><strong>Dias de descanso mental:</strong> Atividades de relaxamento</li>
          </ul>
          
          <h4>3. Qualidade de Vida</h4>
          <ul>
            <li><strong>Flexibilidade de horário:</strong> Opções de trabalho flexível</li>
            <li><strong>Dias de home office:</strong> Trabalho remoto quando possível</li>
            <li><strong>Programas de reconhecimento:</strong> Valorização do bem-estar</li>
            <li><strong>Ambiente de trabalho:</strong> Espaços ergonômicos e confortáveis</li>
          </ul>
          
          <h4>4. Desenvolvimento Pessoal</h4>
          <ul>
            <li><strong>Cursos de desenvolvimento:</strong> Habilidades pessoais e profissionais</li>
            <li><strong>Mentoria:</strong> Programas de orientação e crescimento</li>
            <li><strong>Workshops:</strong> Vários temas de interesse pessoal</li>
            <li><strong>Biblioteca corporativa:</strong> Acervo de livros e recursos</li>
          </ul>
          
          <h3>Como Participar</h3>
          <p>A participação é voluntária e gratuita para todos os colaboradores. Inscreva-se através do portal RH ou fale com seu gerente direto.</p>
          
          <h3>Calendário de Atividades</h3>
          <p>O calendário mensal de atividades será divulgado através dos canais internos de comunicação, incluindo:</p>
          <ul>
            <li>Aulas de fitness e yoga</li>
            <li>Sessões de meditação</li>
            <li>Palestras sobre saúde</li>
            <li>Workshops de desenvolvimento pessoal</li>
            <li>Atividades de team building</li>
          </ul>
          
          <h3>Benefícios Esperados</h3>
          <p>Com este programa, esperamos:</p>
          <ul>
            <li>Melhorar a saúde e qualidade de vida da equipe</li>
            <li>Aumentar a satisfação e engajamento no trabalho</li>
            <li>Reduzir o estresse e o absenteísmo</li>
            <li>Promover um ambiente de trabalho positivo</li>
            <li>Fortalecer a cultura organizacional</li>
          </ul>
        `,
        slug: "programa-de-bem-estar-corporativo",
        categoryId: categoryMap['Cultura'],
        authorId: adminUser.id,
        featured: true,
        priority: 7,
        tags: ["bem-estar", "saúde", "qualidade de vida", "cultura", "benefícios"],
        featuredImage: "/resort-lobby.jpg"
      }
    ]

    // Criar publicações
    for (const pubData of publications) {
      const existingPub = await db.newsArticle.findUnique({
        where: { slug: pubData.slug }
      })

      if (existingPub) {
        console.log(`Publication with slug "${pubData.slug}" already exists. Skipping.`)
        continue
      }

      const publication = await db.newsArticle.create({
        data: {
          title: pubData.title,
          summary: pubData.summary,
          content: pubData.content,
          slug: pubData.slug,
          categoryId: pubData.categoryId,
          authorId: pubData.authorId,
          featured: pubData.featured,
          priority: pubData.priority,
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      })

      // Criar tags
      for (const tagName of pubData.tags) {
        await db.newsTag.create({
          data: {
            articleId: publication.id,
            name: tagName
          }
        })
      }

      // Criar imagem em destaque se fornecida
      if (pubData.featuredImage) {
        await db.newsMedia.create({
          data: {
            articleId: publication.id,
            type: 'IMAGE',
            url: pubData.featuredImage,
            title: `Featured image for ${publication.title}`,
            altText: publication.title,
            order: 0
          }
        })
      }

      console.log(`Created publication: "${publication.title}"`)
    }

    console.log('Resort publications created successfully!')
  } catch (error) {
    console.error('Error creating resort publications:', error)
  } finally {
    await db.$disconnect()
  }
}

createResortPublications()