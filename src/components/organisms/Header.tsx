'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import WalletConnectButton from '@/components/molecules/WalletConnectButton';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-lg glow-primary">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CrossDonate
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
            ホーム
          </Link>
          <Link
            href="/create"
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            プロジェクト作成
          </Link>
          <Link href="#" className="text-sm font-semibold hover:text-primary transition-colors">
            ドキュメント
          </Link>
        </nav>
        <WalletConnectButton />
      </div>
    </header>
  );
}
