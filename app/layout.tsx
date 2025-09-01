import type { Metadata } from 'next'
import './globals.css'
import AuthWrapper from '@/components/auth.wrapper'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'ZenFinance',
  description: '',
  generator: '<Mattera-dev>',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans`}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  )
}
