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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sectorId = searchParams.get('sectorId')
    const search = searchParams.get('search')

    const whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (sectorId && sectorId !== 'all') {
      whereClause.sectorId = sectorId
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { cpf: { contains: search } },
        { position: { contains: search } },
      ]
    }

    // Buscar funcionários da tabela Employee
    const employees = await db.employee.findMany({
      where: whereClause,
      include: {
        sector: true,
        _count: {
          select: {
            documents: true,
            evaluations: true,
            trainings: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { name: 'asc' }
      ]
    })

    // Adicionar flag de origem para funcionários existentes
    const employeesWithOrigin = employees.map(emp => ({
      ...emp,
      origin: 'RH' // Funcionários da tabela Employee vêm do RH
    }))

    // Usar apenas funcionários da tabela Employee
    const allEmployees = employeesWithOrigin

    // Aplicar filtros de busca nos dados combinados
    let filteredEmployees = allEmployees

    if (search) {
      filteredEmployees = allEmployees.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.cpf.includes(search) ||
        emp.position.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status && status !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status)
    }

    if (sectorId && sectorId !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.sectorId === sectorId)
    }

    // Ordenar resultado final
    filteredEmployees.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'ACTIVE' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(filteredEmployees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos obrigatórios
    const requiredFields = ['cpf', 'name', 'email', 'position', 'sectorId', 'admissionDate', 'salary']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        )
      }
    }

    // Verificar se CPF já existe
    const existingEmployee = await db.employee.findUnique({
      where: { cpf: body.cpf }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this CPF already exists' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingEmail = await db.employee.findUnique({
      where: { email: body.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    // Verificar se o setor existe
    const sector = await db.sector.findUnique({
      where: { id: body.sectorId }
    })

    if (!sector) {
      return NextResponse.json(
        { error: 'Sector not found' },
        { status: 400 }
      )
    }

    // Mapear educationLevel para valores válidos do enum
    const mapEducationLevel = (level: string) => {
      switch (level) {
        case 'ELEMENTARY': return 'ELEMENTARY'
        case 'HIGH_SCHOOL': return 'HIGH_SCHOOL'
        case 'COLLEGE': return 'COLLEGE'
        case 'GRADUATE': return 'GRADUATE'
        case 'POST_GRADUATE': return 'POST_GRADUATE'
        case 'PHD': return 'PHD'
        case 'DOCTORATE': return 'PHD' // Mapear DOCTORATE para PHD
        default: return null
      }
    }

    // Criar o colaborador
    const employee = await db.employee.create({
      data: {
        cpf: body.cpf,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        position: body.position,
        sectorId: body.sectorId,
        admissionDate: new Date(body.admissionDate),
        salary: parseFloat(body.salary),
        employmentType: body.employmentType || 'CLT',
        status: body.status || 'ACTIVE',
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        gender: body.gender || null,
        educationLevel: mapEducationLevel(body.educationLevel),
        maritalStatus: body.maritalStatus || null,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        notes: body.notes || null,
      },
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

    // Criar histórico de admissão
    await db.employeeHistory.create({
      data: {
        employeeId: employee.id,
        type: 'PROMOTION',
        title: 'Admissão',
        description: `Colaborador admitido como ${body.position} no setor ${sector.name}`,
        date: new Date(body.admissionDate),
        oldValues: JSON.stringify({ position: null, salary: null }),
        newValues: JSON.stringify({ position: body.position, salary: parseFloat(body.salary) }),
      }
    })

    // Criar User correspondente automaticamente
    try {
      const hashedPassword = await import('@/lib/auth').then(({ hashPassword }) => hashPassword('123456')) // Senha padrão
      
      await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
          role: 'USER',
          sectorId: body.sectorId,
          approved: true,
          showIdentityCard: true
        }
      })
    } catch (error) {
      console.error('Error creating corresponding user:', error)
      // Não falhar a criação do funcionário se não conseguir criar o usuário
    }

    // Adicionar flag de origem para funcionários criados no RH
    const employeeWithOrigin = {
      ...employee,
      origin: 'RH' // Origem: ADMIN ou RH
    }

    return NextResponse.json(employeeWithOrigin, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}