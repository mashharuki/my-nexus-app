'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

export default function WalletConnectButton() {
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
                      className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 glow-primary"
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
                      className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                    >
                      間違ったネットワーク
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              width={16}
                              height={16}
                              src={chain.iconUrl}
                              alt={chain.name ?? 'Chain icon'}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 glow-primary"
                    >
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
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
