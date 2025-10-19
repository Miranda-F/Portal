import { db } from '../src/lib/db'

async function createRHSampleData() {
  try {
    console.log('Creating RH sample data...')

    // Buscar setores existentes
    const sectors = await db.sector.findMany()
    if (sectors.length === 0) {
      console.log('No sectors found. Please run create-sectors.ts first.')
      return
    }

    // Buscar usuário admin
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('No admin user found. Please run create-admin.ts first.')
      return
    }

    // Criar colaboradores de exemplo
    const sampleEmployees = [
      {
        cpf: '12345678901',
        name: 'Ana Carolina Silva',
        email: 'ana.silva@pratagy.com.br',
        phone: '(85) 99999-1111',
        address: 'Rua das Flores, 123',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60123-456',
        position: 'Analista de RH',
        sectorId: sectors.find(s => s.name === 'RH')?.id || sectors[0].id,
        admissionDate: new Date('2023-01-15'),
        salary: 3500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1990-05-20'),
        gender: 'FEMALE',
        educationLevel: 'GRADUATE',
        maritalStatus: 'MARRIED',
        emergencyContact: 'José Silva',
        emergencyPhone: '(85) 99999-2222',
        notes: 'Analista sênior com experiência em recrutamento e seleção'
      },
      {
        cpf: '23456789012',
        name: 'Carlos Eduardo Santos',
        email: 'carlos.santos@pratagy.com.br',
        phone: '(85) 99999-3333',
        address: 'Av. Beira Mar, 456',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60123-789',
        position: 'Desenvolvedor Senior',
        sectorId: sectors.find(s => s.name === 'TI')?.id || sectors[0].id,
        admissionDate: new Date('2022-03-10'),
        salary: 5500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1988-08-15'),
        gender: 'MALE',
        educationLevel: 'COLLEGE',
        maritalStatus: 'SINGLE',
        emergencyContact: 'Maria Santos',
        emergencyPhone: '(85) 99999-4444',
        notes: 'Especialista em desenvolvimento web e mobile'
      },
      {
        cpf: '34567890123',
        name: 'Fernanda Oliveira Costa',
        email: 'fernanda.costa@pratagy.com.br',
        phone: '(85) 99999-5555',
        address: 'Rua do Comércio, 789',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60123-012',
        position: 'Coordenadora de Marketing',
        sectorId: sectors.find(s => s.name === 'Marketing')?.id || sectors[0].id,
        admissionDate: new Date('2021-07-20'),
        salary: 4500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1985-12-10'),
        gender: 'FEMALE',
        educationLevel: 'POST_GRADUATE',
        maritalStatus: 'MARRIED',
        emergencyContact: 'Roberto Costa',
        emergencyPhone: '(85) 99999-6666',
        notes: 'MBA em Marketing Digital com 10 anos de experiência'
      },
      {
        cpf: '45678901234',
        name: 'Roberto Pereira Lima',
        email: 'roberto.lima@pratagy.com.br',
        phone: '(85) 99999-7777',
        address: 'Rua Industrial, 321',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60123-345',
        position: 'Gerente de Operações',
        sectorId: sectors.find(s => s.name === 'Operações')?.id || sectors[0].id,
        admissionDate: new Date('2020-02-15'),
        salary: 7500.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1980-03-25'),
        gender: 'MALE',
        educationLevel: 'POST_GRADUATE',
        maritalStatus: 'MARRIED',
        emergencyContact: 'Ana Lima',
        emergencyPhone: '(85) 99999-8888',
        notes: 'Especialista em gestão de operações e logística'
      },
      {
        cpf: '56789012345',
        name: 'Juliana Martins Souza',
        email: 'juliana.souza@pratagy.com.br',
        phone: '(85) 99999-9999',
        address: 'Rua da Economia, 654',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60123-678',
        position: 'Analista Financeiro',
        sectorId: sectors.find(s => s.name === 'Financeiro')?.id || sectors[0].id,
        admissionDate: new Date('2022-09-01'),
        salary: 4000.00,
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: new Date('1992-11-30'),
        gender: 'FEMALE',
        educationLevel: 'GRADUATE',
        maritalStatus: 'SINGLE',
        emergencyContact: 'Carlos Souza',
        emergencyPhone: '(85) 99999-0000',
        notes: 'Especialista em análise financeira e controle orçamentário'
      }
    ]

    // Inserir colaboradores
    const createdEmployees = []
    for (const employeeData of sampleEmployees) {
      const existingEmployee = await db.employee.findUnique({
        where: { cpf: employeeData.cpf }
      })

      if (!existingEmployee) {
        const employee = await db.employee.create({
          data: employeeData
        })
        createdEmployees.push(employee)
        console.log(`Employee created: ${employee.name}`)

        // Criar histórico de admissão
        await db.employeeHistory.create({
          data: {
            employeeId: employee.id,
            type: 'PROMOTION',
            title: 'Admissão',
            description: `Colaborador admitido como ${employeeData.position}`,
            date: new Date(employeeData.admissionDate),
            oldValues: JSON.stringify({ position: null, salary: null }),
            newValues: JSON.stringify({ position: employeeData.position, salary: employeeData.salary }),
          }
        })
      } else {
        console.log(`Employee already exists: ${employeeData.name}`)
      }
    }

    // Criar processos seletivos de exemplo
    const sampleProcesses = [
      {
        title: 'Desenvolvedor Full Stack',
        description: 'Buscamos desenvolvedor full stack com experiência em React, Node.js e bancos de dados.',
        department: 'TI',
        sectorId: sectors.find(s => s.name === 'TI')?.id,
        requirements: 'Experiência com React, Node.js, TypeScript, PostgreSQL. Conhecimento em metodologias ágeis.',
        salaryRange: 'R$ 4.000,00 - R$ 6.000,00',
        openings: 2,
        priority: 'HIGH',
        endDate: new Date('2024-02-15'),
        createdBy: adminUser.id
      },
      {
        title: 'Analista de Marketing Digital',
        description: 'Analista para atuar com marketing digital, redes sociais e campanhas online.',
        department: 'Marketing',
        sectorId: sectors.find(s => s.name === 'Marketing')?.id,
        requirements: 'Experiência com Google Ads, Facebook Ads, SEO, Analytics. Criatividade e habilidades analíticas.',
        salaryRange: 'R$ 3.000,00 - R$ 4.500,00',
        openings: 1,
        priority: 'MEDIUM',
        endDate: new Date('2024-02-10'),
        createdBy: adminUser.id
      },
      {
        title: 'Coordenador de Logística',
        description: 'Coordenador para gerenciar equipe de logística e otimizar processos de distribuição.',
        department: 'Operações',
        sectorId: sectors.find(s => s.name === 'Operações')?.id,
        requirements: 'Experiência em gestão de logística, conhecimento em ERP, liderança de equipe.',
        salaryRange: 'R$ 5.000,00 - R$ 7.000,00',
        openings: 1,
        priority: 'HIGH',
        endDate: new Date('2024-02-20'),
        createdBy: adminUser.id
      }
    ]

    // Inserir processos seletivos
    for (const processData of sampleProcesses) {
      const existingProcess = await db.recruitmentProcess.findFirst({
        where: { title: processData.title }
      })

      if (!existingProcess) {
        const process = await db.recruitmentProcess.create({
          data: processData
        })
        console.log(`Recruitment process created: ${process.title}`)

        // Criar etapas do processo seletivo
        const stages = [
          { name: 'Triagem de Currículos', type: 'SCREENING', order: 1 },
          { name: 'Entrevista Online', type: 'INTERVIEW', order: 2 },
          { name: 'Teste Prático', type: 'PRACTICAL_TEST', order: 3 },
          { name: 'Entrevista Final', type: 'INTERVIEW', order: 4 }
        ]

        for (const stageData of stages) {
          await db.recruitmentStage.create({
            data: {
              processId: process.id,
              ...stageData
            }
          })
        }

        // Criar algumas candidaturas de exemplo
        const sampleApplications = [
          {
            name: 'João da Silva',
            email: 'joao.silva@email.com',
            phone: '(85) 98888-1111',
            cpf: '98765432100',
            address: 'Rua Exemplo, 100',
            education: 'Superior Completo em Ciência da Computação',
            experience: '5 anos de experiência em desenvolvimento web',
            salaryExpectation: 'R$ 5.000,00',
            availability: 'Imediata',
            score: 8.5,
            status: 'UNDER_REVIEW'
          },
          {
            name: 'Maria Santos',
            email: 'maria.santos@email.com',
            phone: '(85) 98888-2222',
            cpf: '87654321098',
            address: 'Rua Teste, 200',
            education: 'MBA em Marketing Digital',
            experience: '3 anos de experiência com marketing digital',
            salaryExpectation: 'R$ 4.000,00',
            availability: '30 dias',
            score: 7.8,
            status: 'INTERVIEW_SCHEDULED'
          }
        ]

        for (const appData of sampleApplications) {
          await db.application.create({
            data: {
              processId: process.id,
              ...appData
            }
          })
        }
      } else {
        console.log(`Recruitment process already exists: ${processData.title}`)
      }
    }

    // Criar avaliações de desempenho de exemplo
    if (createdEmployees.length > 0) {
      const sampleEvaluations = [
        {
          employeeId: createdEmployees[0].id,
          evaluatorId: adminUser.id,
          period: '2024-Q1',
          type: 'QUARTERLY',
          overallScore: 8.5,
          goals: JSON.stringify({
            'Metas estabelecidas': ['Reduzir tempo de recrutamento em 20%', 'Implementar novo sistema de avaliação'],
            'Resultados': ['Tempo reduzido em 25%', 'Sistema implementado com sucesso'],
            'Pontuação': 9.0
          }),
          strengths: 'Ótima comunicação, liderança, capacidade de resolver problemas complexos',
          weaknesses: 'Pode melhorar gestão de tempo em projetos múltiplos',
          feedback: 'Ana tem se destacado como líder do time de RH, demonstrando grande capacidade de organização e inovação nos processos.',
          actionPlan: 'Participar de curso de gestão de projetos, delegar mais tarefas para equipe',
          status: 'COMPLETED'
        },
        {
          employeeId: createdEmployees[1].id,
          evaluatorId: adminUser.id,
          period: '2024-Q1',
          type: 'QUARTERLY',
          overallScore: 9.2,
          goals: JSON.stringify({
            'Metas estabelecidas': ['Desenvolver novo módulo do sistema', 'Mentorar desenvolvedores juniores'],
            'Resultados': ['Módulo entregue antes do prazo', '2 desenvolvedores capacitados'],
            'Pontuação': 9.5
          }),
          strengths: 'Excelente técnico, bom mentor, inovador, pró-ativo',
          weaknesses: 'Pode melhorar documentação de código',
          feedback: 'Carlos é um dos melhores desenvolvedores da equipe, sempre buscando inovação e ajudando os colegas.',
          actionPlan: 'Focar em documentação, compartilhar mais conhecimento técnico',
          status: 'COMPLETED'
        }
      ]

      for (const evalData of sampleEvaluations) {
        const existingEvaluation = await db.performanceEvaluation.findFirst({
          where: {
            employeeId: evalData.employeeId,
            period: evalData.period
          }
        })

        if (!existingEvaluation) {
          await db.performanceEvaluation.create({
            data: evalData
          })
          console.log(`Performance evaluation created for employee ${evalData.employeeId}`)
        }
      }
    }

    // Criar treinamentos de exemplo
    if (createdEmployees.length > 0) {
      const sampleTrainings = [
        {
          employeeId: createdEmployees[0].id,
          title: 'Gestão Avançada de Pessoas',
          description: 'Curso avançado sobre técnicas modernas de gestão de pessoas e liderança.',
          type: 'LEADERSHIP',
          provider: 'Fundação Dom Cabral',
          duration: 40,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-15'),
          cost: 2500.00,
          status: 'COMPLETED',
          score: 9.5,
          feedback: 'Excelente curso, muito aplicável à realidade da empresa.'
        },
        {
          employeeId: createdEmployees[1].id,
          title: 'Arquitetura de Microsserviços',
          description: 'Curso sobre design e implementação de arquiteturas baseadas em microsserviços.',
          type: 'TECHNICAL',
          provider: 'Alura',
          duration: 30,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-01'),
          cost: 800.00,
          status: 'IN_PROGRESS',
          certificateUrl: '/uploads/certificates/arquitetura-microsservicos.pdf'
        },
        {
          employeeId: createdEmployees[2].id,
          title: 'Marketing Digital Avançado',
          description: 'Estratégias avançadas de marketing digital e análise de dados.',
          type: 'BEHAVIORAL',
          provider: 'Google Digital Marketing',
          duration: 20,
          startDate: new Date('2024-01-20'),
          endDate: new Date('2024-02-10'),
          cost: 1200.00,
          status: 'PLANNED'
        }
      ]

      for (const trainingData of sampleTrainings) {
        const existingTraining = await db.employeeTraining.findFirst({
          where: {
            employeeId: trainingData.employeeId,
            title: trainingData.title
          }
        })

        if (!existingTraining) {
          await db.employeeTraining.create({
            data: trainingData
          })
          console.log(`Training created: ${trainingData.title}`)
        }
      }
    }

    // Criar indicadores de RH de exemplo
    const sampleIndicators = [
      {
        type: 'TURNOVER_RATE',
        period: '2024-01',
        value: 2.5,
        target: 3.0,
        unit: '%',
        description: 'Taxa de rotatividade mensal'
      },
      {
        type: 'ABSENTEEISM_RATE',
        period: '2024-01',
        value: 3.2,
        target: 2.5,
        unit: '%',
        description: 'Taxa de absenteísmo mensal'
      },
      {
        type: 'PRODUCTIVITY',
        period: '2024-01',
        value: 94.5,
        target: 90.0,
        unit: '%',
        description: 'Índice de produtividade geral'
      },
      {
        type: 'TRAINING_HOURS',
        period: '2024-01',
        value: 156,
        target: 120,
        unit: 'horas',
        description: 'Horas de treinamento realizadas'
      },
      {
        type: 'SATISFACTION_INDEX',
        period: '2024-01',
        value: 4.2,
        target: 4.0,
        unit: 'pontos',
        description: 'Índice de satisfação dos colaboradores'
      }
    ]

    for (const indicatorData of sampleIndicators) {
      const existingIndicator = await db.hRIndicator.findFirst({
        where: {
          type: indicatorData.type,
          period: indicatorData.period
        }
      })

      if (!existingIndicator) {
        await db.hRIndicator.create({
          data: indicatorData
        })
        console.log(`HR Indicator created: ${indicatorData.type}`)
      }
    }

    console.log('RH sample data created successfully!')
    console.log('\nSummary:')
    console.log(`- Employees: ${createdEmployees.length} created`)
    console.log('- Recruitment processes: 3 created')
    console.log('- Performance evaluations: 2 created')
    console.log('- Trainings: 3 created')
    console.log('- HR Indicators: 5 created')

  } catch (error) {
    console.error('Error creating RH sample data:', error)
  } finally {
    await db.$disconnect()
  }
}

createRHSampleData()