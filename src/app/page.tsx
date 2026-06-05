'use client'
import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

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
      } else {
        setResult('No companies extracted. Try a different query.')
      }
    } catch {
      setResult('Something went wrong. Check logs.')
    }
    setLoading(false)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>Aegos Intel — Data Pipeline</p>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>Staging review</h1>
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

      <div style={{ background: '#1A1814', border: '0.5px solid #374151', borderRadius: '12px', padding: '1.5rem' }}>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0' }}>Scraped companies will appear here after a successful run.</p>
      </div>

    </main>
  )
}
