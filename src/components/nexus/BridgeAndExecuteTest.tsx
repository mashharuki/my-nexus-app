'use client';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { useNexusSDK } from '@/hooks/useNexusSDK';
import { useWeb3Context } from '@/providers/Web3Provider';
import { UNISWAP_V3_SWAP_ROUTER_ABI } from '@/utils/web3/abi';
import type {
  BridgeAndExecuteParams,
  BridgeAndExecuteResult,
  BridgeAndExecuteSimulationResult,
} from '@avail-project/nexus-core';
import { useCallback, useEffect, useId, useState } from 'react';
import { useAccount } from 'wagmi';

interface BridgeAndExecuteTestProps {
  className?: string;
  selectedToken?: 'USDT' | 'USDC' | null;
}

export default function BridgeAndExecuteTest({
  className,
  selectedToken,
}: BridgeAndExecuteTestProps) {
  const { isConnected, address } = useAccount();
  const { nexusSDK, isInitialized, initializeSDK } = useNexusSDK();
  const { network } = useWeb3Context();
  const id = useId();

  // フォームの状態
  const [formData, setFormData] = useState({
    token: selectedToken || 'USDC',
    amount: '1',
    toChainId: '11155111', // Ethereum
    sourceChains: '84532', // 現在のネットワークに設定
    // contractAddress: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Yearn USDC Vault
    contractAddress: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E', // Sepolia uniswap Swap Router コントラクト
    functionName: 'exactInputSingle', // uniswap Swap Router の swapの関数名
    recipient: '',
  });

  // 実行状態
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BridgeAndExecuteResult | null>(null);
  const [simulation, setSimulation] = useState<BridgeAndExecuteSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // ネットワーク名からチェーンIDを取得
  const getChainIdFromNetwork = useCallback((networkName: string): number | null => {
    const networkMap: { [key: string]: number } = {
      ethereum: 1,
      base: 8453,
      polygon: 137,
      arbitrum: 42161,
      optimism: 10,
      avalanche: 43114,
    };
    return networkMap[networkName.toLowerCase()] || null;
  }, []);

  // 現在のネットワークに基づいてデフォルト値を設定
  useEffect(() => {
    if (network) {
      const currentChainId = getChainIdFromNetwork(network);
      if (currentChainId) {
        setFormData((prev) => ({
          ...prev,
          sourceChains: currentChainId.toString(),
        }));
      }
    }
  }, [network, getChainIdFromNetwork]);

  // selectedTokenが変更された時にフォームを更新
  useEffect(() => {
    if (selectedToken) {
      setFormData((prev) => ({
        ...prev,
        token: selectedToken,
      }));
    }
  }, [selectedToken]);

  // コンポーネント表示時にSDK初期化を自動実行
  useEffect(() => {
    if (isConnected && !isInitialized && !isInitializing) {
      console.log('Bridge & Execute: SDK初期化を開始します...');
      setIsInitializing(true);
      initializeSDK().finally(() => {
        setIsInitializing(false);
      });
    }
  }, [isConnected, isInitialized, isInitializing, initializeSDK]);

  // フォームの更新
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // シミュレーション実行
  const handleSimulate = async () => {
    if (!isInitialized || !nexusSDK) {
      setError('Nexus SDKが初期化されていません');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimulation(null);

    try {
      const params: BridgeAndExecuteParams = {
        token: formData.token as 'USDC' | 'USDT' | 'ETH',
        amount: formData.amount,
        toChainId: parseInt(formData.toChainId, 10) as 1 | 8453 | 137 | 42161 | 10 | 43114,
        sourceChains: formData.sourceChains.split(',').map((id) => parseInt(id.trim(), 10)),
        recipient: (formData.recipient || address) as `0x${string}`,
        execute: {
          contractAddress: formData.contractAddress as `0x${string}`,
          contractAbi: UNISWAP_V3_SWAP_ROUTER_ABI,
          functionName: formData.functionName,
          buildFunctionParams: (_token, amount, _chainId, userAddress) => {
            const tokenIn = "0x07865c6e87b9f70255377e024ace6630c1eaa37f" // USDC address on Ethereum Sepolia
            const decimals = 6; // USDC decimals
            const amountWei = parseFloat(amount) * 10 ** decimals;
            const tokenOut = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0" // USDT address on Ethereum Sepolia
            const fee = 3000;
            const recipient = (formData.recipient || address) as `0x${string}`;
            const amountOutMinimum = parseFloat(amount) * 1 ** decimals;
            const sqrtPriceLimitX96: 0 = 0;
            
            console.log({
              functionParams: [
                tokenIn,
                tokenOut,
                fee,
                recipient,
                amountWei,
                amountOutMinimum,
                sqrtPriceLimitX96,
              ],
            });
            return {
              functionParams: [
                {
                  tokenIn: tokenIn,
                  tokenOut: tokenOut,
                  fee: fee,
                  recipient: recipient,
                  amountIn: amountWei,
                  amountOutMinimum: amountOutMinimum,
                  sqrtPriceLimitX96: sqrtPriceLimitX96,
                }
              ],
            };
          },
          tokenApproval: {
            token: formData.token as 'USDC' | 'USDT' | 'ETH',
            amount: formData.amount,
          },
        },
        waitForReceipt: false,
      };

      const simulationResult = await nexusSDK.simulateBridgeAndExecute(params);
      console.log(simulationResult)
      setSimulation(simulationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シミュレーションに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 実際の実行
  const handleExecute = async () => {
    if (!isInitialized || !nexusSDK) {
      setError('Nexus SDKが初期化されていません');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const params: BridgeAndExecuteParams = {
        token: formData.token as 'USDC' | 'USDT' | 'ETH',
        amount: formData.amount,
        toChainId: parseInt(formData.toChainId, 10) as 1 | 8453 | 137 | 42161 | 10 | 43114,
        sourceChains: formData.sourceChains.split(',').map((id) => parseInt(id.trim(), 10)),
        recipient: (formData.recipient || address) as `0x${string}`,
        execute: {
          contractAddress: formData.contractAddress as `0x${string}`,
          contractAbi: UNISWAP_V3_SWAP_ROUTER_ABI,
          functionName: formData.functionName,
          buildFunctionParams: (_token, amount, _chainId, userAddress) => {
            const tokenIn = "0x07865c6e87b9f70255377e024ace6630c1eaa37f" // USDC address on Ethereum Sepolia
            const decimals = 6; // USDC decimals
            const amountWei = parseFloat(amount) * 10 ** decimals;
            const tokenOut = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0" // USDT address on Ethereum Sepolia
            const fee = 3000;
            const recipient = (formData.recipient || address) as `0x${string}`;
            const amountOutMinimum = parseFloat(amount) * 1 ** decimals;
            const sqrtPriceLimitX96: 0 = 0;
            
            console.log({
              functionParams: [
                tokenIn,
                tokenOut,
                fee,
                recipient,
                amountWei,
                amountOutMinimum,
                sqrtPriceLimitX96,
              ],
            });
            return {
              functionParams: [
                {
                  tokenIn: tokenIn,
                  tokenOut: tokenOut,
                  fee: fee,
                  recipient: recipient,
                  amountIn: amountWei,
                  amountOutMinimum: amountOutMinimum,
                  sqrtPriceLimitX96: sqrtPriceLimitX96,
                }
              ],
            };
          },
          tokenApproval: {
            token: formData.token as 'USDC' | 'USDT' | 'ETH',
            amount: formData.amount,
          },
        },
        waitForReceipt: true,
        requiredConfirmations: 1,
      };

      const result = await nexusSDK.bridgeAndExecute(params);
      console.log(result)
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '実行に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {!isConnected && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">ウォレットを接続してください</p>
          </div>
        )}

        {(!isInitialized || isInitializing) && isConnected && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              {selectedToken
                ? `${selectedToken}用のNexus SDKを初期化中...`
                : 'Nexus SDKを初期化中...'}{' '}
              しばらくお待ちください
            </p>
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {isInitialized && isConnected && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅{' '}
              {selectedToken
                ? `${selectedToken}用のNexus SDK初期化完了！`
                : 'Nexus SDK初期化完了！'}{' '}
              テストを開始できます
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-token`}>トークン</Label>
            <select
              id={`${id}-token`}
              value={formData.token}
              onChange={(e) => handleInputChange('token', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="WETH">WETH</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-amount`}>数量</Label>
            <Input
              id={`${id}-amount`}
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-toChainId`}>宛先チェーンID</Label>
            <Input
              id={`${id}-toChainId`}
              value={formData.toChainId}
              onChange={(e) => handleInputChange('toChainId', e.target.value)}
              placeholder="1 (Ethereum)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-sourceChains`}>送信元チェーンID（カンマ区切り）</Label>
            <Input
              id={`${id}-sourceChains`}
              value={formData.sourceChains}
              onChange={(e) => handleInputChange('sourceChains', e.target.value)}
              placeholder="8453 (Base)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-contractAddress`}>コントラクトアドレス</Label>
            <Input
              id={`${id}-contractAddress`}
              value={formData.contractAddress}
              onChange={(e) => handleInputChange('contractAddress', e.target.value)}
              placeholder="0x..."
            />
            <p className="text-xs text-gray-600">ブリッジ後に実行したいコントラクトのアドレス</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>
                <strong>よく使用されるコントラクト例：</strong>
              </p>
              <p>• Yearn USDC Vault: 0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE</p>
              <p>• Aave USDC Pool: 0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e0F56e</p>
              <p>• Compound USDC: 0xc3d688B66703497DAA19211EEdff47f25384cdc3</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-functionName`}>関数名</Label>
            <Input
              id={`${id}-functionName`}
              value={formData.functionName}
              onChange={(e) => handleInputChange('functionName', e.target.value)}
              placeholder="deposit"
            />
            <p className="text-xs text-gray-600">ブリッジ後に実行したい関数名</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>
                <strong>よく使用される関数例：</strong>
              </p>
              <p>• deposit: 資金を預ける</p>
              <p>• supply: 資金を供給する（Aave）</p>
              <p>• stake: ステーキングする</p>
              <p>• mint: トークンをミントする</p>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${id}-recipient`}>受信者アドレス（空の場合は現在のアドレス）</Label>
            <Input
              id={`${id}-recipient`}
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder={address || '0x...'}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSimulate}
            disabled={!isConnected || !isInitialized || isLoading}
            className="flex-1"
          >
            {isLoading ? 'シミュレーション中...' : 'シミュレーション実行'}
          </Button>
          <Button
            onClick={handleExecute}
            disabled={!isConnected || !isInitialized || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? '実行中...' : '実際に実行'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">エラー: {error}</p>
          </div>
        )}

        {simulation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">シミュレーション結果</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>成功:</strong> {simulation.success ? 'はい' : 'いいえ'}
              </p>
              {simulation.totalEstimatedCost && (
                <p>
                  <strong>推定コスト:</strong> {JSON.stringify(simulation.totalEstimatedCost)}
                </p>
              )}
              {simulation.metadata?.approvalRequired && (
                <p>
                  <strong>承認が必要:</strong> はい
                </p>
              )}
              {simulation.metadata?.bridgeReceiveAmount && (
                <p>
                  <strong>ブリッジ受信数量:</strong> {simulation.metadata.bridgeReceiveAmount}
                </p>
              )}
              {simulation.steps && (
                <div>
                  <p>
                    <strong>ステップ:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4">
                    {simulation.steps.map((step, index) => (
                      <li key={`step-${index}-${JSON.stringify(step)}`}>{JSON.stringify(step)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">実行結果</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>成功:</strong> {result.success ? 'はい' : 'いいえ'}
              </p>
              {result.bridgeSkipped && (
                <p>
                  <strong>ブリッジスキップ:</strong> はい（十分な資金があるため）
                </p>
              )}
              {result.bridgeTransactionHash && (
                <p>
                  <strong>ブリッジトランザクションハッシュ:</strong> {result.bridgeTransactionHash}
                </p>
              )}
              {result.executeTransactionHash && (
                <p>
                  <strong>実行トランザクションハッシュ:</strong> {result.executeTransactionHash}
                </p>
              )}
              {result.approvalTransactionHash && (
                <p>
                  <strong>承認トランザクションハッシュ:</strong> {result.approvalTransactionHash}
                </p>
              )}
              {result.error && (
                <p className="text-red-600">
                  <strong>エラー:</strong> {result.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
