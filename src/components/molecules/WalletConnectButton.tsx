'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function WalletConnectButton() {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex items-center">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="bg-gradient-to-r from-primary to-accent text-white px-4 tablet:px-12 py-2 tablet:py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 glow-primary"
                      style={{
                        minWidth: isTablet ? '150px' : 'auto',
                        minHeight: isTablet ? '48px' : 'auto',
                        fontSize: isTablet ? '1rem' : '0.75rem',
                      }}
                    >
                      ウォレットを接続
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-red-600 transition-colors"
                    >
                      <span className="hidden sm:inline">間違ったネットワーク</span>
                      <span className="sm:hidden">ネットワーク</span>
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-1 sm:gap-3">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center gap-1 sm:gap-2 bg-background border border-border px-2 sm:px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors text-xs sm:text-sm"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 14,
                            height: 14,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 2,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              width={14}
                              height={14}
                              src={chain.iconUrl}
                              alt={chain.name ?? 'Chain icon'}
                            />
                          )}
                        </div>
                      )}
                      <span className="hidden sm:inline">{chain.name}</span>
                      <span className="sm:hidden">{chain.name?.split(' ')[0] || 'Unknown'}</span>
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-r from-primary to-accent text-white px-2 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 glow-primary truncate max-w-[120px] sm:max-w-none"
                    >
                      <span className="hidden sm:inline">
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </span>
                      <span className="sm:hidden">
                        {account.displayName?.slice(0, 6)}...
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
