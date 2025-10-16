import type { Metadata } from 'next'
import '../src/css/globals.css'
import Web3ProviderWrapper from '@/components/Web3ProviderWrapper'
import Header from '@/components/common/header'

export const metadata: Metadata = {
  title: 'CrossDonate',
  description: 'CrossDonate Frontend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Web3ProviderWrapper>
          <div className="min-h-screen bg-background">
            <Header />
            {children}
          </div>
        </Web3ProviderWrapper>
      </body>
    </html>
  )
}
