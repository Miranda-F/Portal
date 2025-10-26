#!/usr/bin/env tsx

import { execSync } from 'child_process'
import path from 'path'

const scriptPath = path.join(__dirname, 'create-test-users.ts')

console.log('🚀 Executando script de criação de usuários de teste...\n')

try {
  execSync(`npx tsx "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  })
} catch (error) {
  console.error('❌ Erro ao executar script:', error)
  process.exit(1)
}
