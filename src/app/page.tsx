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

const SECTORS = ['FinTech','HealthTech','SaaS','E-Commerce','Logistics','CleanTech','AI','Biotech','PropTech','InsurTech','Cybersecurity','Media','Retail','EdTech']
const STAGES = ['Pre-seed','Seed','Series A','Series B','Series C','Growth','Public']
const COUNTRIES = ['Any country','United Kingdom','United States','Germany','France','Singapore','India','Brazil','Nigeria','Australia','Canada','Netherlands','Sweden','UAE','South Africa']

function normalizeCountry(val: string): string {
  const map: Record<string, string> = {
    'uk': 'United Kingdom', 'england': 'United Kingdom', 'britain': 'United Kingdom', 'great britain': 'United Kingdom',
    'us': 'United States', 'usa': 'United States', 'united states of america': 'United States', 'america': 'United States',
    'uae': 'United Arab Emirates', 'emirates': 'United Arab Emirates',
  }
  return map[val.toLowerCase()] || val
}

export default function Home() {
  const [sectors, setSectors] = useState<string[]>([])
  const [stages, setStages] = useState<string[]>([])
  const [country, setCountry] = useState('Any country')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { fetchCompanies() }, [])

  async function fetchCompanies() {
    const res = await fetch('/api/companies')
    const data = await res.json()
    const normalized = (data.companies || []).map((c: Company) => ({
      ...c,
      country: normalizeCountry(c.country || '')
    }))
    setCompanies(normalized)
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  function buildQuery() {
    const parts = []
    if (sectors.length > 0) parts.push(sectors.join(' '))
    if (stages.length > 0) parts.push(stages.join(' '))
    if (city) parts.push(city)
    if (country !== 'Any country') parts.push(country)
    parts.push('startups companies 2024')
    return parts.join(' ')
  }

  async function runScrape() {
    const query = buildQuery()
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
        setResult('No new companies found. Try different filters.')
      }
    } catch {
      setResult('Something went wrong.')
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

  const filtered = companies.filter(c => statusFilter === 'all' || c.status === statusFilter)
  const pending = companies.filter(c => c.status === 'pending').length
  const approved = companies.filter(c => c.status === 'approved').length

  const tagStyle = (active: boolean) => ({
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: `0.5px solid ${active ? '#3864C8' : '#374151'}`,
    background: active ? '#3864C8' : 'transparent',
    color: active ? '#fff' : '#9CA3AF',
    cursor: 'pointer',
    userSelect: 'none' as const,
  })

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>Aegos Intel — Data Pipeline</p>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>Staging review</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending review', value: pending },
          { label: 'Approved', value: approved },
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
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 1rem', fontWeight: '500' }}>Define your scrape target</p>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 8px' }}>Sector</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SECTORS.map(s => (
              <span key={s} style={tagStyle(sectors.includes(s))} onClick={() => toggleItem(sectors, setSectors, s)}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 8px' }}>Stage</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {STAGES.map(s => (
              <span key={s} style={tagStyle(stages.includes(s))} onClick={() => toggleItem(stages, setStages, s)}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 6px' }}>Country</p>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', background: '#0E0D0A', border: '0.5px solid #374151', borderRadius: '8px', padding: '10px 14px', color: '#F9FAFB', fontSize: '13px' }}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 6px' }}>City</p>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. London, Berlin, Lagos" style={{ width: '100%', background: '#0E0D0A', border: '0.5px solid #374151', borderRadius: '8px', padding: '10px 14px', color: '#F9FAFB', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ background: '#0E0D0A', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Generated query</p>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0', fontFamily: 'monospace' }}>{buildQuery()}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={runScrape} disabled={loading} style={{ background: loading ? '#374151' : '#3864C8', color: '#F9FAFB', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
            {loading ? 'Running...' : 'Run scrape'}
          </button>
          {result && <p style={{ fontSize: '13px', color: result.startsWith('✓') ? '#34D399' : '#F87171', margin: 0 }}>{result}</p>}
        </div>
      </div>

      <div style={{ background: '#1A1814', border: '0.5px solid #374151', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#F9FAFB', margin: 0 }}>Staged companies</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all','pending','approved','rejected'].map(f => (
              <span key={f} style={tagStyle(statusFilter === f)} onClick={() => setStatusFilter(f)}>{f}</span>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0', padding: '1.5rem' }}>No companies yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #374151' }}>
                {['Company','Sector','Location','Confidence','Status','Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #374151' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#F9FAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.website}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{c.sector || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', background: '#1E3A2F', color: '#34D399', padding: '3px 10px', borderRadius: '6px' }}>{c.confidence}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: c.status === 'approved' ? '#34D399' : c.status === 'rejected' ? '#F87171' : '#9CA3AF' }}>{c.status}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {c.status !== 'approved' && <button onClick={() => updateStatus(c.id, 'approved')} style={{ fontSize: '12px', background: '#1E3A2F', color: '#34D399', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>}
                      {c.status !== 'rejected' && <button onClick={() => updateStatus(c.id, 'rejected')} style={{ fontSize: '12px', background: '#3A1E1E', color: '#F87171', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>}
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
