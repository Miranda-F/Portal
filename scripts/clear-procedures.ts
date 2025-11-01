import { db } from '../src/lib/db'

async function clearProcedures() {
  try {
    console.log('🗑️ Limpando todos os documentos (procedures) do banco...')
    
    // Deletar todos os documentos
    const result = await db.procedure.deleteMany({})
    
    console.log(`✅ ${result.count} documento(s) deletado(s) com sucesso!`)
    
  } catch (error: any) {
    console.error('❌ Erro ao limpar documentos:', error.message)
    throw error
  } finally {
    await db.$disconnect()
  }
}

clearProcedures()
  .then(() => {
    console.log('✨ Limpeza concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })


