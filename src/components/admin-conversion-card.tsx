'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function AdminConversionCard() {
  const { isConnected } = useAccount();
  const amountId = useId();
  const [conversionData, setConversionData] = useState({
    fromChain: 'Ethereum',
    toChain: 'Polygon',
    amount: '',
    fromToken: 'USDT',
    toToken: 'USDC',
  });

  const [isConverting, setIsConverting] = useState(false);

  const chains = [
    { id: 'Ethereum', name: 'Ethereum', color: 'bg-blue-500' },
    { id: 'Polygon', name: 'Polygon', color: 'bg-purple-500' },
    { id: 'BSC', name: 'BSC', color: 'bg-yellow-500' },
    { id: 'Arbitrum', name: 'Arbitrum', color: 'bg-cyan-500' },
  ];

  const tokens = ['USDT', 'USDC'];

  const handleConversion = async () => {
    if (!isConnected) {
      alert('ウォレットを接続してください');
      return;
    }

    if (!conversionData.amount || parseFloat(conversionData.amount) <= 0) {
      alert('有効な金額を入力してください');
      return;
    }

    setIsConverting(true);

    try {
      // TODO: Nexus SDKを使用して実際の変換を実行
      console.log('Converting:', conversionData);

      // モック処理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `変換が完了しました！\n${conversionData.amount} ${conversionData.fromToken} (${conversionData.fromChain}) → ${conversionData.toToken} (${conversionData.toChain})`
      );

      setConversionData({
        ...conversionData,
        amount: '',
      });
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('変換に失敗しました。再度お試しください。');
    } finally {
      setIsConverting(false);
    }
  };


  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2" />
          クロスチェーン変換
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* From Chain */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">変換元チェーン</Label>
            <div className="grid grid-cols-2 gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => setConversionData({ ...conversionData, fromChain: chain.id })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    conversionData.fromChain === chain.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${chain.color}`}></div>
                    <span className="text-sm font-medium">{chain.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* From Token */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">変換元トークン</Label>
            <select
              value={conversionData.fromToken}
              onChange={(e) => setConversionData({ ...conversionData, fromToken: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor={amountId} className="text-sm font-medium text-gray-700 mb-2 block">
              変換金額
            </Label>
            <input
              id={amountId}
              type="number"
              value={conversionData.amount}
              onChange={(e) => setConversionData({ ...conversionData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
              min="0"
              step="0.01"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* To Chain */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">変換先チェーン</Label>
            <div className="grid grid-cols-2 gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => setConversionData({ ...conversionData, toChain: chain.id })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    conversionData.toChain === chain.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${chain.color}`}></div>
                    <span className="text-sm font-medium">{chain.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* To Token */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">変換先トークン</Label>
            <select
              value={conversionData.toToken}
              onChange={(e) => setConversionData({ ...conversionData, toToken: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {tokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          {/* Conversion Preview */}
          {conversionData.amount && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">変換プレビュー</div>
                  <div className="text-xs mt-1">
                    {conversionData.amount} {conversionData.fromToken} ({conversionData.fromChain})
                    → {conversionData.toToken} ({conversionData.toChain})
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ≈ {conversionData.amount} {conversionData.toToken}
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">注意事項</div>
                <ul className="text-xs space-y-1">
                  <li>• 変換には手数料がかかります</li>
                  <li>• 変換には数分から数十分かかる場合があります</li>
                  <li>• 変換は取り消すことができません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConversion}
            disabled={!isConnected || isConverting || !conversionData.amount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                変換中...
              </div>
            ) : !isConnected ? (
              'ウォレットを接続してください'
            ) : (
              '変換を実行'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
