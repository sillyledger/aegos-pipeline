'use client'
import { useState, useEffect } from 'react'

type Company = {
  id: string
  company_name: string
  website: string
  sector: string
  country: string
  city: string
  description: string
  confidence: string
  status: string
  created_at: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => { fetchCompanies() }, [])

  async function fetchCompanies() {
    const res = await fetch('/api/companies')
    const data = await res.json()
    setCompanies(data.companies || [])
  }

  async function runScrape() {
    if (!query) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (data.saved?.length > 0) {
        setResult(`✓ Saved ${data.saved.length} companies: ${data.saved.join(', ')}`)
        fetchCompanies()
      } else {
        setResult('No companies extracted. Try a different query.')
      }
    } catch {
      setResult('Something went wrong. Check logs.')
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/companies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    fetchCompanies()
  }

  const pending = companies.filter(c => c.status === 'pending')
  const approved = companies.filter(c => c.status === 'approved')

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>Aegos Intel — Data Pipeline</p>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>Staging review</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending review', value: pending.length },
          { label: 'Approved', value: approved.length },
          { label: 'Sources active', value: 3 },
          { label: 'Total scraped', value: companies.length },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1A1814', borderRadius: '8px', padding: '1rem', border: '0.5px solid #374151' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#1A1814', border: '0.5px solid #374151', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px' }}>Run a scrape</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runScrape()}
            placeholder="e.g. fintech startups Germany 2024"
            style={{ flex: 1, background: '#0E0D0A', border: '0.5px solid #374151', borderRadius: '8px', padding: '10px 14px', color: '#F9FAFB', fontSize: '14px' }}
          />
          <button
            onClick={runScrape}
            disabled={loading}
            style={{ background: loading ? '#374151' : '#3864C8', color: '#F9FAFB', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Running...' : 'Run scrape'}
          </button>
        </div>
        {result && (
          <p style={{ fontSize: '13px', color: result.startsWith('✓') ? '#34D399' : '#F87171', margin: '12px 0 0' }}>{result}</p>
        )}
      </div>

      <div style={{ background: '#1A1814', border: '0.5px solid #374151', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid #374151' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#F9FAFB', margin: 0 }}>Staged companies</p>
        </div>
        {companies.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0', padding: '1.5rem' }}>No companies yet. Run a scrape to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #374151' }}>
                {['Company', 'Sector', 'Country', 'Confidence', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #374151' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#F9FAFB' }}>{c.company_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>{c.website}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{c.sector || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{c.country || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', background: '#1E3A2F', color: '#34D399', padding: '3px 10px', borderRadius: '6px' }}>{c.confidence}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', color: c.status === 'approved' ? '#34D399' : c.status === 'rejected' ? '#F87171' : '#9CA3AF' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {c.status !== 'approved' && (
                        <button onClick={() => updateStatus(c.id, 'approved')} style={{ fontSize: '12px', background: '#1E3A2F', color: '#34D399', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                      )}
                      {c.status !== 'rejected' && (
                        <button onClick={() => updateStatus(c.id, 'rejected')} style={{ fontSize: '12px', background: '#3A1E1E', color: '#F87171', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </main>
  )
}
