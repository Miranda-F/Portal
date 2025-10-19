import { db } from '../src/lib/db'

async function createSectors() {
  try {
    const sectors = [
      { name: 'TI', description: 'Tecnologia da Informação' },
      { name: 'RH', description: 'Recursos Humanos' },
      { name: 'Financeiro', description: 'Departamento Financeiro' },
      { name: 'Marketing', description: 'Marketing e Vendas' },
      { name: 'Operações', description: 'Operações e Logística' },
      { name: 'Jurídico', description: 'Departamento Jurídico' },
      { name: 'Comercial', description: 'Comercial e Negócios' },
    ]

    for (const sector of sectors) {
      const existingSector = await db.sector.findUnique({
        where: { name: sector.name }
      })

      if (!existingSector) {
        await db.sector.create({
          data: sector
        })
        console.log(`Setor criado: ${sector.name}`)
      } else {
        console.log(`Setor já existe: ${sector.name}`)
      }
    }

    console.log('Setores criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar setores:', error)
  } finally {
    await db.$disconnect()
  }
}

createSectors()