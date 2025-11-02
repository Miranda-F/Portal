import { db } from '../src/lib/db'

async function addDeletedAtColumn() {
  try {
    // SQLite não suporta ALTER TABLE ADD COLUMN IF NOT EXISTS de forma direta
    // Vamos tentar adicionar e ignorar se já existir
    await db.$executeRawUnsafe(`
      ALTER TABLE Procedure ADD COLUMN deletedAt TEXT;
    `)
    console.log('✅ Coluna deletedAt adicionada com sucesso!')
  } catch (error: any) {
    if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
      console.log('ℹ️ Coluna deletedAt já existe no banco')
    } else {
      console.error('❌ Erro ao adicionar coluna:', error.message)
      throw error
    }
  } finally {
    await db.$disconnect()
  }
}

addDeletedAtColumn()


