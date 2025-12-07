import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthenticatedUser(request: NextRequest) {
  const sessionCookie = getSessionCookieFromNextRequest(request)
  if (!sessionCookie) {
    return null
  }

  const session = await verifySession(sessionCookie)
  if (!session) {
    return null
  }

  return session
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employee = await db.employee.findUnique({
      where: { id: params.id },
      include: {
        sector: true,
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        history: {
          orderBy: { date: 'desc' }
        },
        evaluations: {
          orderBy: { createdAt: 'desc' }
        },
        trainings: {
          orderBy: { startDate: 'desc' }
        },
        careerPlans: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Buscar o colaborador atual
    const currentEmployee = await db.employee.findUnique({
      where: { id: params.id },
      include: { sector: true }
    })

    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Verificar se CPF já existe (se foi alterado)
    if (body.cpf && body.cpf !== currentEmployee.cpf) {
      const existingEmployee = await db.employee.findUnique({
        where: { cpf: body.cpf }
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee with this CPF already exists' },
          { status: 400 }
        )
      }
    }

    // Verificar se email já existe (se foi alterado)
    if (body.email && body.email !== currentEmployee.email) {
      const existingEmail = await db.employee.findUnique({
        where: { email: body.email }
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Verificar se o setor existe (se foi alterado)
    if (body.sectorId && body.sectorId !== currentEmployee.sectorId) {
      const sector = await db.sector.findUnique({
        where: { id: body.sectorId }
      })

      if (!sector) {
        return NextResponse.json(
          { error: 'Sector not found' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    const fieldsToUpdate = [
      'cpf', 'name', 'email', 'phone', 'address', 'position', 'sectorId',
      'admissionDate', 'salary', 'employmentType', 'status', 'birthDate',
      'gender', 'educationLevel', 'maritalStatus', 'emergencyContact',
      'emergencyPhone', 'notes'
    ]

    for (const field of fieldsToUpdate) {
      if (body[field] !== undefined) {
        if (field === 'admissionDate' || field === 'birthDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else if (field === 'salary') {
          updateData[field] = parseFloat(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Atualizar o colaborador
    const updatedEmployee = await db.employee.update({
      where: { id: params.id },
      data: updateData,
      include: {
        sector: true,
        _count: {
          select: {
            documents: true,
            evaluations: true,
            trainings: true,
          }
        }
      }
    })

    // Criar histórico se houve mudanças significativas
    const historyEntries = []
    
    if (body.position && body.position !== currentEmployee.position) {
      historyEntries.push({
        type: 'POSITION_CHANGE',
        title: 'Mudança de Cargo',
        description: `Cargo alterado de ${currentEmployee.position} para ${body.position}`,
        oldValues: JSON.stringify({ position: currentEmployee.position }),
        newValues: JSON.stringify({ position: body.position }),
      })
    }

    if (body.salary && parseFloat(body.salary) !== currentEmployee.salary) {
      historyEntries.push({
        type: 'SALARY_CHANGE',
        title: 'Mudança Salarial',
        description: `Salário alterado de ${currentEmployee.salary} para ${body.salary}`,
        oldValues: JSON.stringify({ salary: currentEmployee.salary }),
        newValues: JSON.stringify({ salary: parseFloat(body.salary) }),
      })
    }

    if (body.sectorId && body.sectorId !== currentEmployee.sectorId) {
      const newSector = await db.sector.findUnique({ where: { id: body.sectorId } })
      historyEntries.push({
        type: 'TRANSFER',
        title: 'Transferência de Setor',
        description: `Transferido do setor ${currentEmployee.sector.name} para ${newSector?.name}`,
        oldValues: JSON.stringify({ sectorId: currentEmployee.sectorId, sectorName: currentEmployee.sector.name }),
        newValues: JSON.stringify({ sectorId: body.sectorId, sectorName: newSector?.name }),
      })
    }

    // Criar entradas de histórico
    for (const entry of historyEntries) {
      await db.employeeHistory.create({
        data: {
          employeeId: params.id,
          ...entry,
          date: new Date(),
        }
      })
    }

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o colaborador existe
    const employee = await db.employee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Excluir o colaborador (isso vai excluir em cascata os documentos, histórico, etc.)
    await db.employee.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}