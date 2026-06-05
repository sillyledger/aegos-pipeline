import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const companies = await sql`
      SELECT id, company_name, website, sector, country, city, 
             description, confidence, status, created_at
      FROM staged_companies
      ORDER BY created_at DESC
    `
    return NextResponse.json({ companies })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { id, status } = await req.json()
    await sql`
      UPDATE staged_companies SET status = ${status} WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
