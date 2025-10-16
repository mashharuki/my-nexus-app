'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const Web3Provider = dynamic(() => import('@/providers/Web3Provider'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

interface Web3ProviderWrapperProps {
  children: ReactNode
}

export default function Web3ProviderWrapper({ children }: Web3ProviderWrapperProps) {
  return <Web3Provider>{children}</Web3Provider>
}
