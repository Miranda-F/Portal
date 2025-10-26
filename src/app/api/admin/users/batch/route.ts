import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { getClientIP, getUserAgent } from '@/lib/auth-utils'

// pool de conexões p/ operações paralelas
class ConnectionPool {
  private static instance: ConnectionPool
  private connections: any[] = []
  private maxConnections = 10
  private availableConnections: any[] = []

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool()
    }
    return ConnectionPool.instance
  }

  async getConnection() {
    if (this.availableConnections.length > 0) {
      return this.availableConnections.pop()
    }
    
    if (this.connections.length < this.maxConnections) {
      const connection = db
      this.connections.push(connection)
      return connection
    }
    
    // aguarda conexão disponível
    return new Promise((resolve) => {
      const checkAvailable = () => {
        if (this.availableConnections.length > 0) {
          resolve(this.availableConnections.pop())
        } else {
          setTimeout(checkAvailable, 10)
        }
      }
      checkAvailable()
    })
  }

  releaseConnection(connection: any) {
    this.availableConnections.push(connection)
  }
}

// processador de operações em lote c/ pool de threads
class BatchProcessor {
  private pool: ConnectionPool
  private maxConcurrent = 5

  constructor() {
    this.pool = ConnectionPool.getInstance()
  }

  async processBatch<T>(
    items: T[],
    processor: (item: T, connection: any) => Promise<any>,
    batchSize = 10
  ): Promise<{ success: any[], errors: { item: T, error: any }[] }> {
    const results: { success: any[], errors: { item: T, error: any }[] } = { success: [], errors: [] }
    const batches = this.chunkArray(items, batchSize)

    // processa lotes em paralelo c/ limite de concorrência
    const semaphore = new Semaphore(this.maxConcurrent)
    
    const batchPromises = batches.map(async (batch) => {
      await semaphore.acquire()
      try {
        const batchResults = await this.processBatchChunk(batch, processor)
        return batchResults
      } finally {
        semaphore.release()
      }
    })

    const batchResults = await Promise.all(batchPromises)
    
    // consolida resultados
    batchResults.forEach(batchResult => {
      results.success.push(...batchResult.success)
      results.errors.push(...batchResult.errors)
    })

    return results
  }

  private async processBatchChunk<T>(
    batch: T[],
    processor: (item: T, connection: any) => Promise<any>
  ): Promise<{ success: any[], errors: { item: T, error: any }[] }> {
    const results: { success: any[], errors: { item: T, error: any }[] } = { success: [], errors: [] }
    
    // processa itens do lote em paralelo
    const promises = batch.map(async (item) => {
      const connection = await this.pool.getConnection()
      try {
        const result = await processor(item, connection)
        return { success: result, error: null }
      } catch (error) {
        return { success: null, error: { item, error } }
      } finally {
        this.pool.releaseConnection(connection)
      }
    })

    const itemResults = await Promise.all(promises)
    
    itemResults.forEach(result => {
      if (result.success) {
        results.success.push(result.success)
      } else if (result.error) {
        results.errors.push(result.error)
      }
    })

    return results
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size) as T[])
    }
    return chunks
  }
}

// semáforo p/ controlar concorrência
class Semaphore {
  private permits: number
  private waiting: (() => void)[] = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve)
    })
  }

  release(): void {
    this.permits++
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()
      if (resolve) {
        this.permits--
        resolve()
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { operations, action } = await request.json()

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ error: 'Invalid operations' }, { status: 400 })
    }

    if (operations.length > 100) {
      return NextResponse.json({ error: 'Too many operations (max 100)' }, { status: 400 })
    }

    const processor = new BatchProcessor()
    let results

    switch (action) {
      case 'approve':
        results = await processor.processBatch(
          operations,
          async (operation, connection) => {
            const { userId, approved } = operation
            
            // Buscar usuário e funcionário em paralelo
            const [user, employee] = await Promise.all([
              connection.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true, approved: true }
              }),
              connection.employee.findFirst({
                where: { 
                  email: {
                    in: await connection.user.findUnique({
                      where: { id: userId },
                      select: { email: true }
                    }).then(user => user ? [user.email] : [])
                  }
                },
                select: { id: true, status: true, email: true }
              })
            ])

            if (!user) {
              throw new Error('User not found')
            }

            // Usar transação para operações relacionadas
            return await connection.$transaction(async (tx) => {
              // Atualizar usuário
              const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { approved },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                  approved: true,
                  updatedAt: true,
                },
              })

              // Atualizar funcionário se existir
              if (employee) {
                const newStatus = approved ? 'ACTIVE' : 'INACTIVE'
                
                await Promise.all([
                  tx.employee.update({
                    where: { id: employee.id },
                    data: { status: newStatus }
                  }),
                  tx.employeeHistory.create({
                    data: {
                      employeeId: employee.id,
                      type: 'OTHER',
                      title: approved ? 'Ativação em Lote' : 'Desativação em Lote',
                      description: `Funcionário ${approved ? 'ativado' : 'desativado'} em operação em lote`,
                      date: new Date(),
                      oldValues: JSON.stringify({ status: employee.status }),
                      newValues: JSON.stringify({ status: newStatus }),
                    }
                  })
                ])
              }

              return updatedUser
            })
          },
          5 // Processar 5 usuários por lote
        )
        break

      case 'delete':
        results = await processor.processBatch(
          operations,
          async (operation, connection) => {
            const { userId } = operation
            
            // Buscar usuário
            const user = await connection.user.findUnique({
              where: { id: userId },
              select: { id: true, email: true, name: true }
            })

            if (!user) {
              throw new Error('User not found')
            }

            // Usar transação para deleção
            return await connection.$transaction(async (tx) => {
              // Deletar funcionário se existir
              try {
                const employee = await tx.employee.findFirst({
                  where: { email: user.email }
                })
                
                if (employee) {
                  await tx.employee.delete({
                    where: { id: employee.id }
                  })
                }
              } catch (error) {
                console.error('Error deleting employee:', error)
                // Continuar mesmo se falhar ao deletar funcionário
              }

              // Deletar usuário
              await tx.user.delete({
                where: { id: userId }
              })

              return { id: userId, name: user.name, email: user.email }
            })
          },
          3 // Processar 3 usuários por lote (deleção é mais pesada)
        )
        break

      case 'update_role':
        results = await processor.processBatch(
          operations,
          async (operation, connection) => {
            const { userId, role } = operation
            
            const updatedUser = await connection.user.update({
              where: { id: userId },
              data: { role },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
              },
            })

            return updatedUser
          },
          10 // Processar 10 usuários por lote
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Registrar log de auditoria para operação em lote
    await db.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        userRole: session.role,
        action: `BATCH_${action.toUpperCase()}`,
        actionType: 'UPDATE',
        description: `Operação em lote: ${action} - ${results.success.length} sucessos, ${results.errors.length} erros`,
        entityType: 'User',
        entityId: 'batch',
        entityName: 'Batch Operation',
        ipAddress: getClientIP(request) || 'unknown',
        userAgent: getUserAgent(request) || 'unknown',
        result: results.errors.length === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        details: JSON.stringify({
          totalOperations: operations.length,
          successful: results.success.length,
          failed: results.errors.length,
          action,
          errors: results.errors.map(e => ({
            userId: e.item.userId,
            error: e.error.message
          }))
        }),
      }
    })

    return NextResponse.json({
      success: true,
      results: {
        total: operations.length,
        successful: results.success.length,
        failed: results.errors.length,
        success: results.success,
        errors: results.errors.map(e => ({
          userId: e.item.userId,
          error: e.error.message
        }))
      }
    })

  } catch (error) {
    console.error('Error processing batch operations:', error)
    
    // Registrar erro nos logs de auditoria
    try {
      const session = await verifySession(getSessionCookie(request) || '')
      if (session) {
        await db.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            userRole: session.role,
            action: 'BATCH_OPERATION_FAILED',
            actionType: 'UPDATE',
            description: `Falha na operação em lote`,
            entityType: 'User',
            entityId: 'batch',
            ipAddress: getClientIP(request) || 'unknown',
            userAgent: getUserAgent(request) || 'unknown',
            result: 'FAILURE',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          }
        })
      }
    } catch (logError) {
      console.error('Error logging audit event:', logError)
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
