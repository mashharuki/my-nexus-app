// Nexus SDKのインポート
import { NexusSDK } from '@avail-project/nexus-core';
import { useEffect, useState } from 'react';
import { useAccount, useBalance, useWalletClient, useConnectorClient } from 'wagmi';

interface TokenBalance {
  chain: string;
  token: string;
  balance: string;
  symbol: string;
  decimals: number;
  usdValue?: number;
  chainId?: number;
  contractAddress?: string;
  rawBalance?: string;
}

interface UnifiedBalance {
  totalUSD: number;
  balances: TokenBalance[];
}

// Nexus SDK用の型定義
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => EthereumProvider;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => EthereumProvider;
  [key: string]: unknown;
}

interface NexusBalance {
  symbol: string;
  balance: string;
  balanceInFiat?: number;
  abstracted?: boolean;
  chain?: string;
  chainId?: string | number;
  decimals?: number;
  chainName?: string;
  network?: string;
  token?: string;
  amount?: string;
  formattedBalance?: string;
  usdValue?: number;
  value?: number;
  priceUSD?: number;
  contractAddress?: string;
  rawBalance?: string;
  breakdown?: Array<{
    chain: string | { id: number; name: string; chainId?: number; network?: string };
    balance: string;
    chainId?: string | number;
    chainName?: string;
    network?: string;
    balanceInFiat?: number;
    usdValue?: number;
    symbol?: string;
    contractAddress?: string;
    rawBalance?: string;
  }>;
}

// Nexus SDKのインスタンスを作成
const nexusSDK = new NexusSDK({
  // テストネット設定
  network: 'testnet',
  // デバッグモードを有効化
  debug: true,
});

// チェーン名のマッピング関数
const getChainName = (chainId: number | string | undefined) => {
  if (!chainId) return 'Unknown';

  const chainMap: Record<number | string, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    8453: 'Base',
    84532: 'Base Sepolia',
    42161: 'Arbitrum One',
    421614: 'Arbitrum Sepolia',
    10: 'Optimism',
    11155420: 'Optimism Sepolia',
    137: 'Polygon',
    80002: 'Polygon Amoy',
  };
  return chainMap[chainId] || `Chain ${chainId}`;
};

export const useNexusBalance = () => {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: connectorClient } = useConnectorClient();
  const [unifiedBalance, setUnifiedBalance] = useState<UnifiedBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nexusInitialized, setNexusInitialized] = useState(false);
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null);
  const [walletClientReady, setWalletClientReady] = useState(false);

  // 現在のチェーンの残高を取得
  const { data: currentChainBalance } = useBalance({
    address: address,
    chainId: chainId,
  });

  const fetchUnifiedBalance = async (retryCount = 0) => {

    if (!isConnected || !address) {
      setUnifiedBalance(null);
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // walletClientまたはconnectorClientを取得する関数
    const getWalletClient = async (): Promise<any> => {
      let attempts = 0;
      const maxAttempts = 30; // 3秒間待機
      
      while (attempts < maxAttempts) {
        const client = walletClient || connectorClient;
        if (client) {
          return client;
        }
        
        // window.ethereumに直接アクセスを試行
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          return (window as any).ethereum;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 最後の手段としてwindow.ethereumを返す
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        return (window as any).ethereum;
      }
      
      return null;
    };

    // クライアントを取得
    const clientToUse = await getWalletClient();
    
    if (!clientToUse) {
      // リトライ回数が3回未満の場合は再試行
      if (retryCount < 3) {
        setTimeout(() => {
          fetchUnifiedBalance(retryCount + 1);
        }, 1000);
        return;
      }
      
      // 最大リトライ回数に達した場合はフォールバック
      setUnifiedBalance({
        totalUSD: 0,
        balances: [],
      });
      setError('Wallet client is not ready yet. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    try {
      // アドレスが変更された場合、Nexus SDKを再初期化
      const shouldReinitialize = !nexusInitialized || lastConnectedAddress !== address;

      if (shouldReinitialize) {

        // 使用するクライアントを決定（既に取得済みのclientToUseを使用）
        if (!clientToUse) {
          throw new Error('No wallet client available for initialization');
        }
        
        // WalletClientをEthereumProvider形式に変換
        let ethereumProvider: EthereumProvider;
        
        if (clientToUse === (window as any).ethereum) {
          // window.ethereumを直接使用する場合
          ethereumProvider = {
            ...clientToUse,
            request: clientToUse.request.bind(clientToUse) as EthereumProvider['request'],
            on: (_event: string, _callback: (...args: unknown[]) => void) => {
              return ethereumProvider;
            },
            removeListener: (_event: string, _callback: (...args: unknown[]) => void) => {
              return ethereumProvider;
            },
          };
        } else {
          // Wagmiクライアントを使用する場合
          ethereumProvider = {
            ...clientToUse,
            request: clientToUse.request.bind(clientToUse) as EthereumProvider['request'],
            on: (_event: string, _callback: (...args: unknown[]) => void) => {
              return ethereumProvider;
            },
            removeListener: (_event: string, _callback: (...args: unknown[]) => void) => {
              return ethereumProvider;
            },
          };
        }

        await nexusSDK.initialize(ethereumProvider);
        setNexusInitialized(true);
        setLastConnectedAddress(address);
      }

      // Nexus SDKを使用して実際の残高を取得
      // 複数のメソッドを試行して最適なデータを取得
      let balances: NexusBalance[] | null = null;

      try {
        // メソッド1: getUnifiedBalances() - 統合された残高
        balances = await nexusSDK.getUnifiedBalances();
      } catch (unifiedError) {
        console.error('getUnifiedBalances failed:', unifiedError);
        throw unifiedError;
      }

      // Nexus SDKのレスポンスを処理
      // UserAsset[]形式のレスポンスを処理
      if (balances && Array.isArray(balances) && balances.length > 0) {
        // breakdown配列から個別のチェーン別の残高を展開
        const processedBalances: TokenBalance[] = [];

        balances.forEach((asset: NexusBalance) => {

          // breakdown配列がある場合は、各チェーンの残高を個別に処理
          if (asset.breakdown && Array.isArray(asset.breakdown)) {
            asset.breakdown.forEach((breakdownItem) => {
              if (parseFloat(breakdownItem.balance) > 0) {
                const chainInfo = breakdownItem.chain;
                const chainId =
                  (typeof chainInfo === 'object' ? chainInfo?.id : undefined) ||
                  breakdownItem.chainId;
                const chainName =
                  (typeof chainInfo === 'object' ? chainInfo?.name : chainInfo) ||
                  breakdownItem.chainName ||
                  getChainName(chainId);

                processedBalances.push({
                  chain: chainName,
                  token: asset.symbol,
                  balance: breakdownItem.balance,
                  symbol: asset.symbol,
                  decimals: asset.decimals || 18,
                  usdValue: asset.balanceInFiat
                    ? (parseFloat(breakdownItem.balance) / parseFloat(asset.balance)) *
                      asset.balanceInFiat
                    : 0,
                  chainId: typeof chainId === 'string' ? parseInt(chainId, 10) : chainId,
                  contractAddress: breakdownItem.contractAddress,
                  rawBalance: breakdownItem.rawBalance,
                });
              }
            });
          } else {
            // breakdown配列がない場合は、統合された残高を処理
            const chainId = asset.chainId ? parseInt(asset.chainId.toString(), 10) : undefined;

            processedBalances.push({
              chain:
                asset.chainName ||
                asset.chain ||
                asset.network ||
                getChainName(chainId) ||
                'Unknown',
              token: asset.symbol || asset.token || 'Unknown',
              balance: asset.balance || asset.amount || asset.formattedBalance || '0',
              symbol: asset.symbol || 'Unknown',
              decimals: asset.decimals || 18,
              usdValue: asset.usdValue || asset.value || asset.priceUSD || asset.balanceInFiat || 0,
              chainId: chainId,
              contractAddress: asset.contractAddress,
              rawBalance: asset.rawBalance,
            });
          }
        });

        // 総USD価値を計算
        const totalUSD = processedBalances.reduce((sum, balance) => {
          return sum + (balance.usdValue || 0);
        }, 0);

        // 現在のチェーンの残高を追加（重複を避けるため、Nexus SDKに含まれていない場合のみ）
        if (currentChainBalance && chainId) {
          // 現在のチェーンの残高が既にNexus SDKの結果に含まれているかチェック
          const existingEntry = processedBalances.find(
            (b) => b.chainId === chainId && b.symbol === currentChainBalance.symbol
          );

          if (!existingEntry) {
            // Nexus SDKに含まれていない場合のみ追加
            const currentChainName = getChainName(chainId);
            const currentChainBalanceEntry: TokenBalance = {
              chain: currentChainName,
              token: currentChainBalance.symbol,
              balance: currentChainBalance.formatted,
              symbol: currentChainBalance.symbol,
              decimals: currentChainBalance.decimals,
              usdValue: 0, // USD価値は計算しない
              chainId: chainId,
              contractAddress: undefined,
              rawBalance: currentChainBalance.value.toString(),
            };

            processedBalances.push(currentChainBalanceEntry);
          }
        }

        const unifiedBalanceData: UnifiedBalance = {
          totalUSD,
          balances: processedBalances,
        };

        setUnifiedBalance(unifiedBalanceData);
      } else {
        // 残高が見つからない場合のフォールバック
        setUnifiedBalance({
          totalUSD: 0,
          balances: [],
        });
      }
    } catch (err) {
      console.error('Nexus SDK error:', err);

      // エラーの詳細を確認
      let errorMessage = 'Nexus SDK temporarily unavailable, showing demo data';
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Nexus SDK API timeout, showing demo data';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - Nexus SDK API unavailable, showing demo data';
        } else {
          errorMessage = `Nexus SDK error: ${err.message}, showing demo data`;
        }
      }

      // Nexus SDKが利用できない場合のフォールバック（モックデータ）

      const mockBalance: UnifiedBalance = {
        totalUSD: 1250.75,
        balances: [
          {
            chain: 'Ethereum',
            token: 'ETH',
            balance: '0.5',
            symbol: 'ETH',
            decimals: 18,
            usdValue: 1000,
          },
          {
            chain: 'Ethereum',
            token: 'USDC',
            balance: '1000',
            symbol: 'USDC',
            decimals: 6,
            usdValue: 1000,
          },
          {
            chain: 'Base',
            token: 'ETH',
            balance: '0.1',
            symbol: 'ETH',
            decimals: 18,
            usdValue: 200,
          },
          {
            chain: 'Arbitrum',
            token: 'USDT',
            balance: '500',
            symbol: 'USDT',
            decimals: 6,
            usdValue: 500,
          },
          {
            chain: 'Polygon',
            token: 'MATIC',
            balance: '100',
            symbol: 'MATIC',
            decimals: 18,
            usdValue: 50.75,
          },
        ],
      };

      setUnifiedBalance(mockBalance);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // walletClientの準備状況を監視
  useEffect(() => {
    const clientToUse = walletClient || connectorClient;
    const windowEthereum = typeof window !== 'undefined' ? !!(window as any).ethereum : false;
    
    // window.ethereumが利用可能な場合も準備完了とする
    if ((clientToUse || windowEthereum) && isConnected && address) {
      setWalletClientReady(true);
    } else {
      setWalletClientReady(false);
    }
  }, [walletClient, connectorClient, isConnected, address, chainId]);

  // ウォレット接続状態の変化を監視
  useEffect(() => {
    if (!isConnected || !address) {
      // ウォレットが切断された場合、状態をリセット
      setUnifiedBalance(null);
      setError(null);
      setNexusInitialized(false);
      setLastConnectedAddress(null);
      setWalletClientReady(false);
    }
  }, [isConnected, address]);

  return {
    unifiedBalance,
    loading,
    error,
    refetch: fetchUnifiedBalance,
    walletClientReady,
  };
};
