'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="px-4 py-2 flex gap-x-4 text-black justify-between items-center border-b border-gray-300">
      <nav className="flex flex-row">
        <Image src="/avail-logo.svg" alt="Avail Logo" width={120} height={40} />
      </nav>

      <div className="flex items-center gap-x-4">
        <ConnectButton />
      </div>
    </header>
  );
}
