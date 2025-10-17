import { notFound } from 'next/navigation';
import DonatePageClient from '@/components/donate-page-client';

interface DonatePageProps {
  params: Promise<{ projectId: string }>;
}

// Mock project data
const mockProjects = {
  'project-1': {
    id: 'project-1',
    title: '海のプラスチック汚染を解決する',
    description: '海洋プラスチック汚染の解決に向けた革新的な技術開発と普及活動を支援します。',
    goal: 50000,
    raised: 32450,
    category: 'environment',
    imageUrl: '/api/placeholder/600/400',
    website: 'https://ocean-cleanup.org',
    creator: 'Ocean Cleanup Foundation',
    unifiedAddress: '0x1234567890123456789012345678901234567890',
  },
  'project-2': {
    id: 'project-2',
    title: '教育格差をなくすプロジェクト',
    description: '世界中の子どもたちに質の高い教育を提供するための支援活動です。',
    goal: 100000,
    raised: 67890,
    category: 'education',
    imageUrl: '/api/placeholder/600/400',
    website: 'https://education-for-all.org',
    creator: 'Education Foundation',
    unifiedAddress: '0x2345678901234567890123456789012345678901',
  },
};

export default async function DonatePage({ params }: DonatePageProps) {
  const { projectId } = await params;
  const project = mockProjects[projectId as keyof typeof mockProjects];

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                  <p className="text-lg opacity-90">{project.creator}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{project.description}</p>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">進捗</span>
                    <span className="text-sm font-medium text-purple-600">
                      {((project.raised / project.goal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>${project.raised.toLocaleString()} 寄付済み</span>
                    <span>${project.goal.toLocaleString()} 目標</span>
                  </div>
                </div>

                {/* Project Links */}
                {project.website && (
                  <div className="mb-6">
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      プロジェクトウェブサイト →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Support Tokens */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">サポートトークン</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'USDT', chain: 'Ethereum', address: '0x...1234', balance: '1,234.56' },
                  { name: 'USDC', chain: 'Polygon', address: '0x...5678', balance: '2,345.67' },
                  { name: 'USDT', chain: 'BSC', address: '0x...9012', balance: '3,456.78' },
                ].map((token) => (
                  <div
                    key={`${token.name}-${token.chain}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{token.name}</span>
                      <span className="text-sm text-gray-600">{token.chain}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{token.address}</div>
                    <div className="text-lg font-semibold text-green-600">{token.balance}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">最近の寄付</h2>
              <div className="space-y-4">
                {[
                  {
                    donor: '0x1234...5678',
                    amount: '500 USDT',
                    chain: 'Ethereum',
                    time: '2時間前',
                  },
                  { donor: '0x2345...6789', amount: '250 USDC', chain: 'Polygon', time: '5時間前' },
                  { donor: '0x3456...7890', amount: '100 USDT', chain: 'BSC', time: '1日前' },
                ].map((donation) => (
                  <div
                    key={`${donation.donor}-${donation.amount}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{donation.amount}</div>
                      <div className="text-sm text-gray-600">{donation.donor}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{donation.chain}</div>
                      <div className="text-sm text-gray-500">{donation.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DonatePageClient unifiedAddress={project.unifiedAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}
