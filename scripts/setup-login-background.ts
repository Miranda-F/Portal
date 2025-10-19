import { db } from '../src/lib/db'

async function setupLoginBackground() {
  try {
    // Verificar se já existe uma configuração
    const existingSetting = await db.setting.findUnique({
      where: { key: 'login_background_image' }
    })

    if (existingSetting) {
      console.log('Login background setting already exists:', existingSetting.value)
      return
    }

    // Usar uma das imagens existentes
    const backgroundImageUrl = '/uploads/login-background/login-background-1755913285560.jpg'

    // Criar a configuração
    const setting = await db.setting.create({
      data: {
        key: 'login_background_image',
        value: backgroundImageUrl
      }
    })

    console.log('Login background setting created successfully:', setting.value)
  } catch (error) {
    console.error('Error setting up login background:', error)
  } finally {
    await db.$disconnect()
  }
}

setupLoginBackground()