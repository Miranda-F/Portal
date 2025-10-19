import { db } from '../src/lib/db'

async function createSampleData() {
  try {
    // Criar algumas publicações de exemplo
    const publications = [
      {
        title: "Procedimento de Gestão da Qualidade - Atualização 2024",
        content: `Este documento descreve os procedimentos atualizados para gestão da qualidade na organização.

Objetivos:
- Manter a conformidade com as normas ISO 9001
- Melhorar continuamente os processos internos
- Garantir a satisfação dos clientes

Procedimentos:
1. Avaliação de processos trimestral
2. Análise de indicadores de desempenho
3. Ações corretivas e preventivas
4. Treinamento da equipe

Responsáveis: Gerência de Qualidade
Validade: 12 meses`,
        type: "REPORT",
        createdById: "admin-user-id" // Isso precisa ser substituído por um ID real
      },
      {
        title: "Relatório de Inspeção - Área de Produção",
        content: `Relatório de inspeção realizada na área de produção em 15/01/2024.

Itens inspecionados:
- Equipamentos de segurança: OK
- Condições de trabalho: OK
- Procedimentos operacionais: ATENÇÃO
- Documentação: OK

Não conformidades encontradas:
1. Alguns EPIs não estão sendo utilizados corretamente
2. Procedimentos não atualizados em alguns postos de trabalho

Ações recomendadas:
- Treinamento imediato sobre uso de EPIs
- Atualização dos procedimentos até 30/01/2024`,
        type: "INSPECTION",
        createdById: "admin-user-id"
      },
      {
        title: "Análise Estratificada de Acidentes de Trabalho",
        content: `Análise estratificada dos acidentes de trabalho ocorridos no último semestre.

Período analisado: Julho/2023 - Dezembro/2023

Estratificação por tipo:
- Quedas: 35%
- Lesões por esforço repetitivo: 25%
- Acidentes com máquinas: 20%
- Outros: 20%

Estratificação por setor:
- Produção: 45%
- Manutenção: 30%
- Almoxarifado: 15%
- Administrativo: 10%

Medidas propostas:
- Intensificar treinamentos de segurança
- Melhorar sinalização de áreas de risco
- Implementar pausas ativas`,
        type: "REPORT",
        createdById: "admin-user-id"
      },
      {
        title: "Comunicado: Novo Sistema de Gestão Documental",
        content: `Prezados colaboradores,

Informamos a implementação do novo sistema de gestão documental da empresa.

A partir de 01/02/2024, todos os documentos deverão ser registrados no novo sistema digital.

Principais benefícios:
- Centralização de documentos
- Fácil acesso e consulta
- Controle de versões automatizado
- Maior segurança das informações

Treinamentos serão realizados nas seguintes datas:
- Setor Produção: 05/02/2024
- Setor Administrativo: 06/02/2024
- Setor Manutenção: 07/02/2024

Para dúvidas, entrar em contato com o departamento de TI.`,
        type: "ANNOUNCEMENT",
        createdById: "admin-user-id"
      }
    ]

    // Criar algumas vagas de exemplo
    const jobs = [
      {
        title: "Analista de Qualidade Pleno",
        description: "Buscamos um Analista de Qualidade para fortalecer nossa equipe de gestão da qualidade. O profissional será responsável por monitorar processos, analisar dados e implementar melhorias.",
        department: "Qualidade",
        email: "rh@pratagy.com.br",
        phone: "(85) 99999-8888",
        requirements: "Experiência com normas ISO, conhecimento em ferramentas da qualidade, Excel avançado.",
        salary: "R$ 3.500,00 - R$ 4.500,00",
        location: "Fortaleza - CE",
        type: "FULL_TIME",
        createdById: "admin-user-id"
      },
      {
        title: "Estágio em Engenharia de Produção",
        description: "Oportunidade de estágio para estudantes de Engenharia de Produção. O estagiário terá contato com processos produtivos e projetos de melhoria contínua.",
        department: "Produção",
        email: "estagios@pratagy.com.br",
        requirements: "Estudante de Engenharia de Produção, disponibilidade 20h semanais.",
        salary: "R$ 800,00 + VT + VR",
        location: "Fortaleza - CE",
        type: "INTERNSHIP",
        createdById: "admin-user-id"
      },
      {
        title: "Técnico de Segurança do Trabalho",
        description: "Profissional para atuar na implementação e manutenção do programa de segurança do trabalho, realizando inspeções e treinamentos.",
        department: "Segurança",
        email: "seguranca@pratagy.com.br",
        phone: "(85) 99999-7777",
        requirements: "Técnico de Segurança do Trabalho ativo, experiência com NRs.",
        salary: "R$ 2.800,00 - R$ 3.500,00",
        location: "Fortaleza - CE",
        type: "FULL_TIME",
        createdById: "admin-user-id"
      }
    ]

    // Criar alguns eventos de exemplo
    const events = [
      {
        title: "Treinamento: ISO 9001:2015",
        description: "Treinamento completo sobre os requisitos da norma ISO 9001:2015 e sua aplicação na organização.",
        date: "2024-02-15T09:00:00.000Z",
        time: "09:00",
        location: "Auditório Principal",
        maxAttendees: 50,
        createdById: "admin-user-id"
      },
      {
        title: "Workshop: Melhoria Contínua",
        description: "Workshop prático sobre ferramentas de melhoria contínua e metodologias lean.",
        date: "2024-02-20T14:00:00.000Z",
        time: "14:00",
        location: "Sala de Treinamento A",
        maxAttendees: 30,
        createdById: "admin-user-id"
      },
      {
        title: "Reunião Mensal de Segurança",
        description: "Reunião mensal para discussão de assuntos relacionados à segurança do trabalho e prevenção de acidentes.",
        date: "2024-02-10T08:00:00.000Z",
        time: "08:00",
        location: "Sala de Reuniões",
        maxAttendees: 25,
        createdById: "admin-user-id"
      }
    ]

    // Buscar um usuário admin para usar como createdById
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('Nenhum usuário admin encontrado. Execute o script create-admin.ts primeiro.')
      return
    }

    // Atualizar os createdById com o ID real do admin
    const updatedPublications = publications.map(p => ({ ...p, createdById: adminUser.id }))
    const updatedJobs = jobs.map(j => ({ ...j, createdById: adminUser.id }))
    const updatedEvents = events.map(e => ({ ...e, createdById: adminUser.id }))

    // Inserir os dados
    for (const publication of updatedPublications) {
      await db.publication.create({
        data: publication
      })
      console.log(`Publicação criada: ${publication.title}`)
    }

    for (const job of updatedJobs) {
      await db.jobPosting.create({
        data: job
      })
      console.log(`Vaga criada: ${job.title}`)
    }

    for (const event of updatedEvents) {
      await db.event.create({
        data: event
      })
      console.log(`Evento criado: ${event.title}`)
    }

    console.log('Dados de exemplo criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error)
  } finally {
    await db.$disconnect()
  }
}

createSampleData()