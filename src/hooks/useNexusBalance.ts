import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, useBalance } from 'wagmi'
// Nexus SDKのインポート
import { NexusSDK } from '@avail-project/nexus-core'

interface TokenBalance {
  chain: string
  token: string
  balance: string
  symbol: string
  decimals: number
  usdValue?: number
  chainId?: number
  contractAddress?: string
  rawBalance?: string
}

interface UnifiedBalance {
  totalUSD: number
  balances: TokenBalance[]
}

// Nexus SDKのインスタンスを作成
const nexusSDK = new NexusSDK({
  // テストネット設定
  network: 'testnet',
  // デバッグモードを有効化
  debug: true
})

// チェーン名のマッピング関数
const getChainName = (chainId: number | string | undefined) => {
  if (!chainId) return 'Unknown'
  
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
    80002: 'Polygon Amoy'
  }
  return chainMap[chainId] || `Chain ${chainId}`
}

export const useNexusBalance = () => {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [unifiedBalance, setUnifiedBalance] = useState<UnifiedBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nexusInitialized, setNexusInitialized] = useState(false)
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null)
  const [walletClientReady, setWalletClientReady] = useState(false)
  
  // 現在のチェーンの残高を取得
  const { data: currentChainBalance } = useBalance({
    address: address,
    chainId: chainId
  })

  const fetchUnifiedBalance = async () => {
    console.log('fetchUnifiedBalance called with:', {
      isConnected,
      address,
      walletClient: !!walletClient,
      chainId
    })
    
    if (!isConnected || !address) {
      setUnifiedBalance(null)
      setError('Please connect your wallet first')
      setLoading(false)
      return
    }
    
    if (!walletClient) {
      setUnifiedBalance(null)
      setError('Wallet client is not ready yet. Please wait a moment and try again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching unified balance for address:', address)
      
      // アドレスが変更された場合、Nexus SDKを再初期化
      const shouldReinitialize = !nexusInitialized || lastConnectedAddress !== address
      
      if (shouldReinitialize) {
        console.log('Initializing Nexus SDK with wallet client...')
        
        // WalletClientをEthereumProvider形式に変換
        const ethereumProvider = {
          ...walletClient,
          on: (event: string, _callback: (...args: any[]) => void) => {
            // イベントリスナーの実装（必要に応じて）
            console.log('Event listener added:', event)
            return ethereumProvider
          },
          removeListener: (event: string, _callback: (...args: any[]) => void) => {
            // イベントリスナーの削除（必要に応じて）
            console.log('Event listener removed:', event)
            return ethereumProvider
          }
        } as any
        
        await nexusSDK.initialize(ethereumProvider)
        setNexusInitialized(true)
        setLastConnectedAddress(address)
        console.log('Nexus SDK initialized successfully for address:', address)
      }
      
      // Nexus SDKを使用して実際の残高を取得
      // 複数のメソッドを試行して最適なデータを取得
      let balances: any = null
      
      try {
        // メソッド1: getUnifiedBalances() - 統合された残高
        balances = await nexusSDK.getUnifiedBalances()
        console.log('Nexus SDK getUnifiedBalances response:', balances)
        console.log('Detailed analysis of each balance entry:')
        balances.forEach((balance: any, index: number) => {
          console.log(`Balance ${index + 1}:`, {
            symbol: balance.symbol,
            balance: balance.balance,
            balanceInFiat: balance.balanceInFiat,
            abstracted: balance.abstracted,
            breakdown: balance.breakdown,
            allKeys: Object.keys(balance)
          })
          
          // breakdown配列の詳細を確認
          if (balance.breakdown && Array.isArray(balance.breakdown)) {
            console.log(`Breakdown for ${balance.symbol}:`, balance.breakdown)
            balance.breakdown.forEach((item: any, breakdownIndex: number) => {
              console.log(`  Breakdown ${breakdownIndex + 1}:`, {
                chain: item.chain,
                chainId: item.chainId,
                chainName: item.chainName,
                network: item.network,
                balance: item.balance,
                symbol: item.symbol,
                allKeys: Object.keys(item)
              })
              
              // chainオブジェクトの詳細を確認
              if (item.chain && typeof item.chain === 'object') {
                console.log(`    Chain object details:`, {
                  chainId: item.chain.chainId,
                  name: item.chain.name,
                  id: item.chain.id,
                  network: item.chain.network,
                  allKeys: Object.keys(item.chain)
                })
              }
            })
          }
        })
        
        
      } catch (unifiedError) {
        console.error('getUnifiedBalances failed:', unifiedError)
        throw unifiedError
      }
      
      // Nexus SDKのレスポンスを処理
      // UserAsset[]形式のレスポンスを処理
      if (balances && Array.isArray(balances) && balances.length > 0) {
        console.log('Raw balances from Nexus SDK:', balances)
        
        // breakdown配列から個別のチェーン別の残高を展開
        const processedBalances: TokenBalance[] = []
        
        balances.forEach((asset: any) => {
          console.log('Processing asset:', asset.symbol)
          
          // breakdown配列がある場合は、各チェーンの残高を個別に処理
          if (asset.breakdown && Array.isArray(asset.breakdown)) {
            asset.breakdown.forEach((breakdownItem: any) => {
              if (parseFloat(breakdownItem.balance) > 0) {
                const chainInfo = breakdownItem.chain
                const chainId = chainInfo?.id || breakdownItem.chainId
                const chainName = chainInfo?.name || breakdownItem.chainName || getChainName(chainId)
                
                processedBalances.push({
                  chain: chainName,
                  token: asset.symbol,
                  balance: breakdownItem.balance,
                  symbol: asset.symbol,
                  decimals: asset.decimals || 18,
                  usdValue: asset.balanceInFiat ? (parseFloat(breakdownItem.balance) / parseFloat(asset.balance)) * asset.balanceInFiat : 0,
                  chainId: chainId,
                  contractAddress: breakdownItem.contractAddress,
                  rawBalance: breakdownItem.rawBalance
                })
              }
            })
          } else {
            // breakdown配列がない場合は、統合された残高を処理
            const chainId = asset.chainId ? parseInt(asset.chainId.toString()) : undefined
            
            processedBalances.push({
              chain: asset.chainName || asset.chain || asset.network || getChainName(chainId) || 'Unknown',
              token: asset.symbol || asset.token || 'Unknown',
              balance: asset.balance || asset.amount || asset.formattedBalance || '0',
              symbol: asset.symbol || 'Unknown',
              decimals: asset.decimals || 18,
              usdValue: asset.usdValue || asset.value || asset.priceUSD || asset.balanceInFiat || 0,
              chainId: chainId,
              contractAddress: asset.contractAddress,
              rawBalance: asset.rawBalance
            })
          }
        })
        
        // 総USD価値を計算
        const totalUSD = processedBalances.reduce((sum, balance) => {
          return sum + (balance.usdValue || 0)
        }, 0)
        
        // 現在のチェーンの残高を追加（重複を避けるため、Nexus SDKに含まれていない場合のみ）
        if (currentChainBalance && chainId) {
          console.log('Checking current chain balance:', {
            chainId,
            symbol: currentChainBalance.symbol,
            balance: currentChainBalance.formatted,
            chainName: getChainName(chainId)
          })
          
          // 現在のチェーンの残高が既にNexus SDKの結果に含まれているかチェック
          const existingEntry = processedBalances.find(b => 
            b.chainId === chainId && b.symbol === currentChainBalance.symbol
          )
          
          if (!existingEntry) {
            // Nexus SDKに含まれていない場合のみ追加
            const currentChainName = getChainName(chainId)
            const currentChainBalanceEntry: TokenBalance = {
              chain: currentChainName,
              token: currentChainBalance.symbol,
              balance: currentChainBalance.formatted,
              symbol: currentChainBalance.symbol,
              decimals: currentChainBalance.decimals,
              usdValue: 0, // USD価値は計算しない
              chainId: chainId,
              contractAddress: undefined,
              rawBalance: currentChainBalance.value.toString()
            }
            
            processedBalances.push(currentChainBalanceEntry)
            console.log('Added current chain balance to list (not found in Nexus SDK)')
          } else {
            console.log('Current chain balance already exists in Nexus SDK results')
          }
        } else {
          console.log('No current chain balance to add:', {
            currentChainBalance: !!currentChainBalance,
            chainId
          })
        }
        
        const unifiedBalanceData: UnifiedBalance = {
          totalUSD,
          balances: processedBalances
        }
        
        setUnifiedBalance(unifiedBalanceData)
      } else {
        // 残高が見つからない場合のフォールバック
        setUnifiedBalance({
          totalUSD: 0,
          balances: []
        })
      }
    } catch (err) {
      console.error('Nexus SDK error:', err)
      
      // エラーの詳細を確認
      let errorMessage = 'Nexus SDK temporarily unavailable, showing demo data'
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Nexus SDK API timeout, showing demo data'
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - Nexus SDK API unavailable, showing demo data'
        } else {
          errorMessage = `Nexus SDK error: ${err.message}, showing demo data`
        }
      }
      
      // Nexus SDKが利用できない場合のフォールバック（モックデータ）
      console.log('Falling back to mock data due to SDK error')
      
      const mockBalance: UnifiedBalance = {
        totalUSD: 1250.75,
        balances: [
          {
            chain: 'Ethereum',
            token: 'ETH',
            balance: '0.5',
            symbol: 'ETH',
            decimals: 18,
            usdValue: 1000
          },
          {
            chain: 'Ethereum',
            token: 'USDC',
            balance: '1000',
            symbol: 'USDC',
            decimals: 6,
            usdValue: 1000
          },
          {
            chain: 'Base',
            token: 'ETH',
            balance: '0.1',
            symbol: 'ETH',
            decimals: 18,
            usdValue: 200
          },
          {
            chain: 'Arbitrum',
            token: 'USDT',
            balance: '500',
            symbol: 'USDT',
            decimals: 6,
            usdValue: 500
          },
          {
            chain: 'Polygon',
            token: 'MATIC',
            balance: '100',
            symbol: 'MATIC',
            decimals: 18,
            usdValue: 50.75
          }
        ]
      }
      
      setUnifiedBalance(mockBalance)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // walletClientの準備状況を監視
  useEffect(() => {
    if (walletClient && isConnected && address) {
      console.log('Wallet client is ready')
      setWalletClientReady(true)
    } else {
      console.log('Wallet client not ready:', { walletClient: !!walletClient, isConnected, address })
      setWalletClientReady(false)
    }
  }, [walletClient, isConnected, address])

  // ウォレット接続状態の変化を監視
  useEffect(() => {
    if (!isConnected || !address) {
      // ウォレットが切断された場合、状態をリセット
      setUnifiedBalance(null)
      setError(null)
      setNexusInitialized(false)
      setLastConnectedAddress(null)
      setWalletClientReady(false)
    }
  }, [isConnected, address])

  return {
    unifiedBalance,
    loading,
    error,
    refetch: fetchUnifiedBalance,
    walletClientReady
  }
}
