import { PrismaClient, Role, ProcedureStatus, ProcedureType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const year = new Date().getFullYear()
  const reset = process.argv.includes('--reset') || process.argv.includes('--force')

  // Ensure seeder user
  const SEED_EMAIL = 'analytics.mock@local.test'
  let user = await prisma.user.findUnique({ where: { email: SEED_EMAIL } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: SEED_EMAIL,
        name: 'Analytics Mock',
        password: 'mock',
        role: Role.ADMIN,
        approved: true,
      },
    })
  }

  // Ensure a sector
  let sector = await prisma.sector.findFirst()
  if (!sector) {
    sector = await prisma.sector.create({
      data: { name: 'Qualidade', description: 'Setor mock para analytics' },
    })
  }

  // Optional reset of previous mock data
  if (reset) {
    await prisma.procedure.deleteMany({ where: { createdById: user.id, title: { startsWith: 'Mock Doc' } } })
  }

  // Helper to create a procedure
  const createProc = async (
    month: number,
    status: ProcedureStatus,
    type: ProcedureType,
    opts?: { expired?: boolean; index?: number }
  ) => {
    const day = Math.min(15 + (opts?.index ?? 0), 28)
    const createdAt = new Date(year, month, day)
    const documentDate = createdAt
    const expiryDate = opts?.expired
      ? new Date(year, month, Math.min(day + 5, 28)) // passado para marcar como expirado quando mapeado
      : new Date(year + 1, month, day)

    // Para expirar, jogamos expiryDate no passado se o mês é anterior ao atual
    if (opts?.expired) {
      expiryDate.setFullYear(year - 1)
    }

    const index = (opts?.index ?? 0) + 1
    const title = `Mock Doc ${year}-${String(month + 1).padStart(2, '0')} #${index}`

    await prisma.procedure.create({
      data: {
        title,
        content: 'Conteúdo mock para testes de analytics',
        type,
        status,
        createdById: user!.id,
        sectorId: sector!.id,
        documentDate,
        expiryDate,
        // createdAt/updatedAt não podem ser setados diretamente com sqlite + Prisma por default
        // portanto, aceitamos os valores automáticos e usamos documentDate/expiryDate para analytics
      },
    })
  }

  // Para cada mês, cria uma combinação de status
  for (let m = 0; m < 12; m++) {
    // Sempre 1 publicado (ativo)
    await createProc(m, 'PUBLISHED', m % 2 === 0 ? 'MANAGEMENT_PROCEDURE' : 'WORK_INSTRUCTION', { index: 0 })
    // Em alguns meses, 1 rascunho (pendente)
    if (m % 3 !== 0) await createProc(m, 'DRAFT', 'MANAGEMENT_PROCEDURE', { index: 1 })
    // Em alguns meses, 1 arquivado (inativo)
    if (m % 4 !== 0) await createProc(m, 'ARCHIVED', 'WORK_INSTRUCTION', { index: 2 })
    // Em alguns meses, um publicado com expiryDate no passado (para virar expirado pelo mapeamento)
    if (m % 2 === 1) await createProc(m, 'PUBLISHED', 'MANAGEMENT_PROCEDURE', { index: 3, expired: true })
  }

  console.log('Mock de procedimentos para analytics criado com sucesso.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


