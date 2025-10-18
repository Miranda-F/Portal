import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { parse } from 'cookie'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session cookie directly from request
    const cookieHeader = request.headers.get('cookie')
    
    if (!cookieHeader) {
      return NextResponse.json({ error: 'No session cookie found' }, { status: 401 })
    }
    
    const cookies = parse(cookieHeader)
    const token = cookies.access_token
    
    if (!token) {
      return NextResponse.json({ error: 'No session token found' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.id

    // Get the current job posting
    const job = await db.jobPosting.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 })
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active jobs can be marked as filled' }, { status: 400 })
    }

    // Update the job posting status to FILLED
    const updatedJob = await db.jobPosting.update({
      where: { id: jobId },
      data: { status: 'FILLED' }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error filling job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}