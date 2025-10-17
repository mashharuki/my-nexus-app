'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, QrCode } from 'lucide-react';

interface DonatePageClientProps {
  unifiedAddress: string;
}

export default function DonatePageClient({ unifiedAddress }: DonatePageClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(unifiedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Address Card */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">統一アドレス</h3>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">このアドレスに寄付してください</div>
            <div className="font-mono text-sm break-all text-gray-900 bg-white p-2 rounded border">
              {unifiedAddress}
            </div>
            <Button
              onClick={handleCopyAddress}
              className="w-full mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'コピーしました！' : 'アドレスをコピー'}
            </Button>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">QRコードで簡単寄付</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">プロジェクト統計</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">寄付者数</span>
              <span className="font-semibold text-gray-900">247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均寄付額</span>
              <span className="font-semibold text-gray-900">$131.38</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">残り日数</span>
              <span className="font-semibold text-gray-900">45日</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">完了率</span>
              <span className="font-semibold text-purple-600">64.9%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">サポート方法</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              任意のチェーンから寄付可能
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              低手数料での寄付
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              透明性の高い資金管理
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
