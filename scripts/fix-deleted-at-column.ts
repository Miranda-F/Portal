import { db } from '../src/lib/db'

async function fixDeletedAtColumn() {
  try {
    console.log('🔧 Corrigindo coluna deletedAt...')
    
    // Limpar todos os valores inválidos (timestamps numéricos ou strings não-ISO)
    await db.$executeRawUnsafe(`
      UPDATE Procedure 
      SET deletedAt = NULL 
      WHERE deletedAt IS NOT NULL 
      AND deletedAt NOT LIKE '%-%-%T%:%:%';
    `)
    
    console.log('✅ Valores inválidos limpos!')
    console.log('⚠️ SQLite armazena DateTime como TEXT no formato ISO 8601.')
    console.log('📝 O Prisma gerencia a conversão automaticamente quando usamos new Date().')
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
  } finally {
    await db.$disconnect()
  }
}

fixDeletedAtColumn()

