import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aegos Pipeline',
  description: 'Aegos Intel data ingestion and staging pipeline',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0E0D0A', color: '#F9FAFB', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
