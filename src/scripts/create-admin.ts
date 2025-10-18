import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const hashedPassword = await hashPassword('admin123')
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@pratagy.com.br',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        approved: true,
      },
    })
    
    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      approved: adminUser.approved,
    })
    
    console.log('You can now login with:')
    console.log('Email: admin@pratagy.com.br')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()