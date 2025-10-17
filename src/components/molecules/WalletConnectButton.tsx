'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function WalletConnectButton() {
  const { isTablet } = useMediaQuery();

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
                      className="bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                      style={{
                        padding: isTablet ? '12px 16px' : '8px 12px',
                        fontSize: isTablet ? '1rem' : '0.75rem',
                        minWidth: isTablet ? '150px' : 'auto',
                        minHeight: isTablet ? '48px' : 'auto',
                      }}
                    >
                      <span className={isTablet ? 'inline' : 'hidden'}>間違ったネットワーク</span>
                      <span className={isTablet ? 'hidden' : 'inline'}>間違ったネットワーク</span>
                    </button>
                  );
                }

                return (
                  <div
                    className="flex items-center"
                    style={{
                      gap: isTablet ? '12px' : '4px',
                    }}
                  >
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center bg-background border border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        gap: isTablet ? '8px' : '4px',
                        padding: isTablet ? '12px 16px' : '8px 12px',
                        fontSize: isTablet ? '1rem' : '0.75rem',
                        minHeight: isTablet ? '48px' : 'auto',
                      }}
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: isTablet ? 20 : 14,
                            height: isTablet ? 20 : 14,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: isTablet ? 4 : 2,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              width={isTablet ? 20 : 14}
                              height={isTablet ? 20 : 14}
                              src={chain.iconUrl}
                              alt={chain.name ?? 'Chain icon'}
                            />
                          )}
                        </div>
                      )}
                      <span className={isTablet ? 'inline' : 'hidden'}>{chain.name}</span>
                      <span className={isTablet ? 'hidden' : 'inline'}>
                        {chain.name?.split(' ')[0] || 'Unknown'}
                      </span>
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 glow-primary truncate"
                      style={{
                        padding: isTablet ? '12px 16px' : '8px 12px',
                        fontSize: isTablet ? '1rem' : '0.75rem',
                        minWidth: isTablet ? '150px' : 'auto',
                        minHeight: isTablet ? '48px' : 'auto',
                        maxWidth: isTablet ? 'none' : '120px',
                      }}
                    >
                      <span className={isTablet ? 'inline' : 'hidden'}>{account.displayName}</span>
                      <span className={isTablet ? 'hidden' : 'inline'}>
                        {account.displayName?.slice(0, 6)}...
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
