import type { Metadata } from 'next';
import '../src/themes/styles/globals.css';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import Web3ProviderWrapper from '@/components/providers/Web3ProviderWrapper';

export const metadata: Metadata = {
  title: 'CrossDonate',
  description: 'CrossDonate Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Web3ProviderWrapper>
          <div className="min-h-screen bg-background">
            <Header />
            {children}
            <Footer />
          </div>
        </Web3ProviderWrapper>
      </body>
    </html>
  );
}
