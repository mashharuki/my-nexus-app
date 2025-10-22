'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/Dialog';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { useNexusSDK } from '@/hooks/useNexusSDK';
import { useAccount } from 'wagmi';
import type { SUPPORTED_CHAINS_IDS } from '@avail-project/nexus-core';

interface BridgeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_TOKENS = ['ETH', 'USDC', 'USDT'] as const;
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 10, name: 'Optimism' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 43114, name: 'Avalanche' },
  { id: 8453, name: 'Base' },
  { id: 534352, name: 'Scroll' },
  { id: 56, name: 'BNB Chain' },
] as const;

export default function BridgeDialog({ isOpen, onOpenChange }: BridgeDialogProps) {
  const { address, isConnected } = useAccount();
  const { nexusSDK, isInitialized, initializeSDK } = useNexusSDK();
  
  // ユニークなIDを生成
  const tokenId = useId();
  const amountId = useId();
  const targetChainId = useId();
 
  const [token, setToken] = useState<(typeof SUPPORTED_TOKENS)[number]>('USDC');
  const [amount, setAmount] = useState('');
  const [targetChain, setTargetChain] = useState<SUPPORTED_CHAINS_IDS>(137);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitializeSDK = async () => {
    if (!isConnected || !address) {
      setError('ウォレットが接続されていません。');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await initializeSDK();
      setSuccess('Nexus SDKが正常に初期化されました。');
    } catch (err) {
      console.error('SDK initialization error:', err);
      setError(`SDK初期化に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('有効な数量を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // SDKが初期化されていない場合は初期化を試行
      if (!isInitialized) {
        await initializeSDK();
      }

      // ブリッジを実行
      const result = await nexusSDK.bridge({
        token,
        amount: parseFloat(amount),
        chainId: targetChain,
      });

      if (result.success) {
        setSuccess(
          `ブリッジが成功しました！${result.explorerUrl ? `トランザクション: ${result.explorerUrl}` : ''}`
        );
        // 成功後、フォームをリセット
        setAmount('');
      } else {
        setError(`ブリッジが失敗しました: ${result.error || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('Bridge error:', err);
      setError(
        `ブリッジ中にエラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setError(null);
    setSuccess(null);
    setAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">トークンブリッジ</DialogTitle>
          <DialogDescription>
            Nexus SDKを使用してトークンを異なるチェーン間でブリッジします。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* トークン選択 */}
          <div className="space-y-2">
            <Label htmlFor={tokenId}>トークン</Label>
            <select
              id={tokenId}
              value={token}
              onChange={(e) => setToken(e.target.value as (typeof SUPPORTED_TOKENS)[number])}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUPPORTED_TOKENS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 数量入力 */}
          <div className="space-y-2">
            <Label htmlFor={amountId}>数量</Label>
            <Input
              id={amountId}
              type="number"
              step="0.000001"
              placeholder="例: 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>

          {/* ターゲットチェーン選択 */}
          <div className="space-y-2">
            <Label htmlFor={targetChainId}>送信先チェーン</Label>
            <select
              id={targetChainId}
              value={targetChain}
              onChange={(e) => setTargetChain(Number(e.target.value) as SUPPORTED_CHAINS_IDS)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} (Chain ID: {chain.id})
                </option>
              ))}
            </select>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* 成功表示 */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* SDK初期化ボタン（必要に応じて） */}
          {!isInitialized && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm mb-2">
                Nexus SDKが初期化されていません。まず初期化を行ってください。
              </p>
              <Button
                onClick={handleInitializeSDK}
                disabled={isInitializing || !isConnected}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isInitializing ? '初期化中...' : 'SDK初期化'}
              </Button>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBridge}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? 'ブリッジ中...' : 'ブリッジ実行'}
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              キャンセル
            </Button>
          </div>

          {/* ステータス情報 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              ウォレット: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '未接続'}
            </p>
            <p>接続状態: {isConnected ? '接続済み' : '未接続'}</p>
            <p>SDK状態: {isInitialized ? '初期化済み' : '未初期化'}</p>
            <p>数量入力: {amount ? `${amount} ${token}` : '未入力'}</p>
            <p>
              ボタン状態:{' '}
              {isLoading
                ? 'ローディング中'
                : !amount || parseFloat(amount) <= 0
                  ? '数量未入力'
                  : '実行可能'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
