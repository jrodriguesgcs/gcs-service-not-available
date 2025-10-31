import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ActiveCampaign Lost Deals',
  description: 'Track lost deals by out-of-scope country and program',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}