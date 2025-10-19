import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function createAdmin() {
  try {
    const adminEmail = 'admin@pratagy.com.br'
    const adminPassword = 'admin123'
    
    // Verificar se o administrador já existe
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }
    
    // Obter setor TI
    const tiSector = await db.sector.findFirst({
      where: { name: 'TI' }
    })
    
    if (!tiSector) {
      console.error('TI sector not found')
      return
    }
    
    // Criar usuário administrador
    const hashedPassword = await hashPassword(adminPassword)
    
    await db.user.create({
      data: {
        email: adminEmail,
        name: 'Administrator',
        sectorId: tiSector.id,
        password: hashedPassword,
        role: 'ADMIN',
        approved: true,
      }
    })
    
    console.log('Admin user created successfully')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await db.$disconnect()
  }
}

createAdmin()