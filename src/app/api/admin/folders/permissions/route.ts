import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthUser(request: NextRequest) {
    const token = getSessionCookieFromNextRequest(request)
    if (!token) return null

    const session = await verifySession(token)
    if (!session) return null

    return { userId: session.userId, userRole: session.role }
}

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request)
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const path = searchParams.get('path')

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 })
        }

        // Buscar metadados da pasta e permissões
        // Se não existir, retorna padrão (inherit: true, permissions: [])
        const folderMetadata = await db.folderMetadata.findUnique({
            where: { path },
            include: {
                permissions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoUrl: true,
                                role: true,
                                sector: {
                                    select: { name: true }
                                }
                            }
                        },
                        sector: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!folderMetadata) {
            // Retorna estado padrão para pasta nova/sem config
            return NextResponse.json({
                path,
                inheritPermissions: true,
                permissions: []
            })
        }

        return NextResponse.json(folderMetadata)

    } catch (error) {
        console.error('Error fetching folder permissions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request)
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Apenas ADMIN ou quem tem permissão de ADMIN na pasta (TODO) pode alterar
        if (authUser.userRole !== 'ADMIN') {
            // TODO: Implementar verificação de permissão de pasta para não-admins
            // Por enquanto, apenas ADMIN global pode gerenciar permissões
            return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
        }

        const body = await request.json()
        const { path, action, userId, sectorId, permission, permissionId, targetType } = body

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 })
        }

        // Garantir que a pasta existe no banco
        let folder = await db.folderMetadata.findUnique({ where: { path } })

        if (!folder) {
            folder = await db.folderMetadata.create({
                data: {
                    path,
                    inheritPermissions: true
                }
            })
        }
  

        if (action === 'add' && ((targetType === 'USER' && userId) || (targetType === 'SECTOR' && (sectorId || permissionId)))) {
            // Para atualização de permissão existente, precisamos encontrar o userId ou sectorId correto
            let actualUserId = userId
            let actualSectorId = sectorId
            
            // Se temos permissionId mas não userId/sectorId, precisamos buscar a permissão existente
            if (permissionId && !userId && !sectorId) {
                const existingPermission = await db.folderPermission.findUnique({
                    where: { id: permissionId }
                })
                
                if (existingPermission) {
                    actualUserId = existingPermission.userId
                    actualSectorId = existingPermission.sectorId
                }
            }
            
            // Upsert permission
            const updatedPermission = await db.folderPermission.upsert({
                where: targetType === 'USER' ? {
                    folderId_userId: {
                        folderId: folder.id,
                        userId: actualUserId
                    }
                } : {
                    folderId_sectorId: {
                        folderId: folder.id,
                        sectorId: actualSectorId
                    }
                },
                create: {
                    folderId: folder.id,
                    ...(targetType === 'USER' ? { userId: actualUserId } : { sectorId: actualSectorId }),
                    type: permission,
                    targetType
                },
                update: {
                    type: permission
                }
            })
            
            // Buscar a permissão atualizada com os dados relacionados
            const permissionWithRelations = await db.folderPermission.findUnique({
                where: { id: updatedPermission.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            photoUrl: true,
                            role: true,
                            sector: {
                                select: { name: true }
                            }
                        }
                    },
                    sector: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })
            
            return NextResponse.json(permissionWithRelations)
        }

        if (action === 'remove' && permissionId && targetType) {
            // Verificar se a permissão existe antes de remover
            const existingPermission = await db.folderPermission.findFirst({
                where: {
                    id: permissionId,
                    folderId: folder.id,
                    targetType: targetType
                }
            })
            
            if (!existingPermission) {
                return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 })
            }
            
            const deleteResult = await db.folderPermission.deleteMany({
                where: {
                    folderId: folder.id,
                    id: permissionId,
                    targetType: targetType
                }
            })
            
            if (deleteResult.count === 0) {
                return NextResponse.json({ error: 'Nenhuma permissão foi removida' }, { status: 400 })
            }
            
            return NextResponse.json({ success: true, deletedCount: deleteResult.count })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Error updating folder permissions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
