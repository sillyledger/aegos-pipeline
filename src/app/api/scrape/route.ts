export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

async function searchCompanies(query: string) {
  const response = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'Accept': 'application/json',
      'X-Retain-Images': 'none',
    }
  })
  const data = await response.json()
  console.log('JINA SEARCH RESPONSE:', JSON.stringify(data).slice(0, 500))
  return data.data || []
}

async function readWebsite(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'Accept': 'application/json',
      'X-Retain-Images': 'none',
    }
  })
  const data = await response.json()
  console.log('JINA READER RESPONSE:', JSON.stringify(data).slice(0, 300))
  return data.data?.content || ''
}

async function parseWithGroq(content: string, companyName: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a company data extractor. Extract structured company information from the provided text. Respond only with valid JSON, no markdown, no backticks.'
        },
        {
          role: 'user',
          content: `Extract company information for "${companyName}" from this text and return JSON with these exact fields: company_name, website, sector, country, city, description, founding_year, employee_count. If a field is unknown use null.\n\nText:\n${content.slice(0, 3000)}`
        }
      ]
    })
  })
  const data = await response.json()
  console.log('GROQ RESPONSE:', JSON.stringify(data).slice(0, 500))
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

    console.log('SCRAPE QUERY:', query)
    const results = await searchCompanies(query)
    console.log('RESULTS COUNT:', results.length)
    const saved = []

    for (const result of results.slice(0, 2)) {
      try {
        console.log('PROCESSING:', result.url)
        const content = await readWebsite(result.url)
        console.log('CONTENT LENGTH:', content.length)
        const parsed = await parseWithGroq(content, result.title || query)
        console.log('PARSED:', JSON.stringify(parsed))

        if (!parsed.company_name) continue

        await sql`
          INSERT INTO staged_companies (
            company_name, website, sector, country, city,
            description, founding_year, employee_count,
            source_website, source_news, confidence, raw_content
          ) VALUES (
            ${parsed.company_name},
            ${parsed.website || result.url},
            ${parsed.sector},
            ${parsed.country},
            ${parsed.city},
            ${parsed.description},
            ${parsed.founding_year},
            ${parsed.employee_count},
            true,
            true,
            'medium',
            ${content.slice(0, 5000)}
          )
          ON CONFLICT DO NOTHING
        `
        saved.push(parsed.company_name)
      } catch (e) {
        console.error('Error processing result:', e)
      }
    }

    return NextResponse.json({ success: true, saved })
  } catch (error) {
    console.error('SCRAPE ERROR:', error)
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 })
  }
}
