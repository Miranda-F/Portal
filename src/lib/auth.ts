import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { User } from '@prisma/client'

export type UserSafe = Omit<User, 'password'>

/* ---------------- Password helpers ---------------- */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string | null): Promise<boolean> {
  if (!hashedPassword) return false
  return bcrypt.compare(password, hashedPassword)
}

/* ---------------- User CRUD ---------------- */
export async function getUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } })
}

export async function getUserById(id: string, safe: boolean = false): Promise<User | UserSafe | null> {
  return db.user.findUnique({
    where: { id },
    select: safe
      ? {
          id: true,
          email: true,
          name: true,
          sectorId: true,
          role: true,
          photoUrl: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          showIdentityCard: true,
        }
      : undefined,
  }) as Promise<User | UserSafe | null>
}

export async function getAllUsers(): Promise<UserSafe[]> {
  return db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      sectorId: true,
      role: true,
      photoUrl: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      showIdentityCard: true,
    },
  })
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<UserSafe> {
  return db.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })
}

/* ---------------- Auth ---------------- */
export async function authenticateUser(email: string, password: string): Promise<UserSafe | null> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return null
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null
  // Retorna versão sem senha - sem verificação de aprovação
  const { password: _, ...userSafe } = user
  return userSafe
}