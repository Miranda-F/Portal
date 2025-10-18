import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminApproved() {
  try {
    // Verificar se o usuário admin existe
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pratagy.com.br' }
    })

    if (!adminUser) {
      console.log('Usuário admin não encontrado. Criando novo usuário admin...')
      
      const { hashPassword } = await import('../lib/auth')
      const hashedPassword = await hashPassword('admin123')
      
      const newAdminUser = await prisma.user.create({
        data: {
          email: 'admin@pratagy.com.br',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN',
          approved: true,
        },
      })
      
      console.log('Novo usuário admin criado:', {
        id: newAdminUser.id,
        email: newAdminUser.email,
        name: newAdminUser.name,
        role: newAdminUser.role,
        approved: newAdminUser.approved,
      })
    } else {
      console.log('Usuário admin encontrado:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        approved: adminUser.approved,
      })
      
      // Se o campo approved for null ou undefined, atualizar para true
      if (adminUser.approved === null || adminUser.approved === undefined) {
        const updatedAdminUser = await prisma.user.update({
          where: { email: 'admin@pratagy.com.br' },
          data: { approved: true },
        })
        
        console.log('Usuário admin atualizado:', {
          id: updatedAdminUser.id,
          email: updatedAdminUser.email,
          name: updatedAdminUser.name,
          role: updatedAdminUser.role,
          approved: updatedAdminUser.approved,
        })
      } else if (!adminUser.approved) {
        const updatedAdminUser = await prisma.user.update({
          where: { email: 'admin@pratagy.com.br' },
          data: { approved: true },
        })
        
        console.log('Usuário admin ativado:', {
          id: updatedAdminUser.id,
          email: updatedAdminUser.email,
          name: updatedAdminUser.name,
          role: updatedAdminUser.role,
          approved: updatedAdminUser.approved,
        })
      } else {
        console.log('Usuário admin já está com approved=true')
      }
    }
    
    console.log('You can now login with:')
    console.log('Email: admin@pratagy.com.br')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error updating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminApproved()