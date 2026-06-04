export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>Aegos Intel — Data Pipeline</p>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>Staging review</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Pending review', value: '0' },
          { label: 'Approved today', value: '0' },
          { label: 'Sources active', value: '3' },
          { label: 'Pushed to Aegos', value: '0' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#1A1814', borderRadius: '8px', padding: '1rem', border: '0.5px solid #374151' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '500', margin: '0', color: '#F9FAFB' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#1A1814', border: '0.5px solid #374151', borderRadius: '12px', padding: '1.5rem' }}>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0' }}>No companies in staging yet. Run the scraper to get started.</p>
      </div>

    </main>
  )
}
