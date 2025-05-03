import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Goal Tracker',
  description: 'Track your goals and progress with ease',
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