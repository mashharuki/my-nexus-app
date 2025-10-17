'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from 'wagmi';
import { ArrowLeft, Plus, Globe, Target, Users } from 'lucide-react';
import Link from 'next/link';

export default function CreateProjectPage() {
  const { isConnected } = useAccount();
  const titleId = useId();
  const descriptionId = useId();
  const goalId = useId();
  const websiteId = useId();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    category: 'environment',
    imageUrl: '',
    website: '',
  });

  const categories = [
    { id: 'environment', name: '環境保護', icon: Globe },
    { id: 'education', name: '教育', icon: Users },
    { id: 'health', name: '医療・健康', icon: Target },
    { id: 'social', name: '社会問題', icon: Users },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('ウォレットを接続してください');
      return;
    }
    // TODO: Nexus SDKを使用してプロジェクトを作成
    console.log('Creating project:', formData);
    alert('プロジェクトが作成されました！（モック）');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">新しいプロジェクトを作成</h1>
          <p className="text-gray-600">
            CrossDonateでクロスチェーン寄付プロジェクトを開始しましょう
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  プロジェクト詳細
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Title */}
                  <div>
                    <Label htmlFor={titleId} className="text-sm font-medium text-gray-700">
                      プロジェクトタイトル *
                    </Label>
                    <input
                      id={titleId}
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例：海のプラスチック汚染を解決する"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor={descriptionId} className="text-sm font-medium text-gray-700">
                      プロジェクト説明 *
                    </Label>
                    <Textarea
                      id={descriptionId}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 min-h-[120px]"
                      placeholder="プロジェクトの詳細、目標、背景などを説明してください..."
                      required
                    />
                  </div>

                  {/* Goal Amount */}
                  <div>
                    <Label htmlFor={goalId} className="text-sm font-medium text-gray-700">
                      目標金額 (USDT) *
                    </Label>
                    <input
                      id={goalId}
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="10000"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">カテゴリ *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: category.id })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.category === category.id
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <Label htmlFor={websiteId} className="text-sm font-medium text-gray-700">
                      ウェブサイトURL（任意）
                    </Label>
                    <input
                      id={websiteId}
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg"
                  >
                    {isConnected ? 'プロジェクトを作成' : 'ウォレットを接続してください'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">CrossDonateの特徴</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    クロスチェーン寄付対応
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    透明性の高い資金管理
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    低手数料での寄付
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    リアルタイム進捗追跡
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">プロジェクト作成のコツ</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 明確で具体的な目標を設定</li>
                  <li>• 詳細な説明で信頼性を高める</li>
                  <li>• 現実的な目標金額を設定</li>
                  <li>• 定期的な進捗報告を計画</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
