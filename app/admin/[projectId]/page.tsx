import { notFound } from 'next/navigation';
import AdminConversionCard from '@/components/admin-conversion-card';

interface AdminPageProps {
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
  },
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { projectId } = await params;
  const project = mockProjects[projectId as keyof typeof mockProjects];

  if (!project) {
    notFound();
  }

  // Mock chain balances
  const chainBalances = [
    { chain: 'Ethereum', token: 'USDT', balance: 12345.67, usdValue: 12345.67 },
    { chain: 'Polygon', token: 'USDC', balance: 8765.43, usdValue: 8765.43 },
    { chain: 'BSC', token: 'USDT', balance: 5432.1, usdValue: 5432.1 },
    { chain: 'Arbitrum', token: 'USDC', balance: 2109.87, usdValue: 2109.87 },
  ];

  // Mock transaction history
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      amount: '500 USDT',
      chain: 'Ethereum',
      timestamp: '2024-01-15 14:30:00',
      status: 'completed',
    },
    {
      id: '2',
      type: 'convert',
      amount: '1000 USDT → USDC',
      from: 'Ethereum',
      to: 'Polygon',
      timestamp: '2024-01-15 10:15:00',
      status: 'completed',
    },
    {
      id: '3',
      type: 'withdraw',
      amount: '2000 USDC',
      chain: 'Polygon',
      timestamp: '2024-01-14 16:45:00',
      status: 'completed',
    },
    {
      id: '4',
      type: 'deposit',
      amount: '750 USDT',
      chain: 'BSC',
      timestamp: '2024-01-14 09:20:00',
      status: 'completed',
    },
  ];

  const totalBalance = chainBalances.reduce((sum, chain) => sum + chain.usdValue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">プロジェクト管理ダッシュボード</h1>
          <p className="text-gray-600">{project.title} - 資金管理と変換操作</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-sm font-medium text-gray-600 mb-1">総寄付額</h3>
                <p className="text-3xl font-bold text-gray-900">${totalBalance.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% 今月</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-medium text-gray-600 mb-1">チェーン数</h3>
                <p className="text-3xl font-bold text-gray-900">{chainBalances.length}</p>
                <p className="text-sm text-blue-600 mt-1">アクティブ</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="text-sm font-medium text-gray-600 mb-1">完了率</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {((project.raised / project.goal) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 mt-1">目標達成まで</p>
              </div>
            </div>

            {/* Chain Balances */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold">チェーン別残高</h2>
                <p className="opacity-90">各ブロックチェーンの現在の残高</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chainBalances.map((chain) => (
                    <div
                      key={chain.chain}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              chain.chain === 'Ethereum'
                                ? 'bg-blue-500'
                                : chain.chain === 'Polygon'
                                  ? 'bg-purple-500'
                                  : chain.chain === 'BSC'
                                    ? 'bg-yellow-500'
                                    : 'bg-cyan-500'
                            }`}
                          ></div>
                          <span className="font-semibold text-gray-900">{chain.chain}</span>
                        </div>
                        <span className="text-sm text-gray-600">{chain.token}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {chain.balance.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        ≈ ${chain.usdValue.toLocaleString()} USD
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Controls */}
            <AdminConversionCard />

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold">取引履歴</h2>
                <p className="opacity-90">最近の入金・変換・引き出し履歴</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイプ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        チェーン
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tx.type === 'deposit'
                                ? 'bg-green-100 text-green-800'
                                : tx.type === 'convert'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {tx.type === 'deposit'
                              ? '入金'
                              : tx.type === 'convert'
                                ? '変換'
                                : '引き出し'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tx.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.type === 'convert' ? `${tx.from} → ${tx.to}` : tx.chain}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            完了
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">プロジェクト情報</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">プロジェクト名</div>
                  <div className="font-semibold text-gray-900">{project.title}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">作成者</div>
                  <div className="font-semibold text-gray-900">{project.creator}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">目標金額</div>
                  <div className="font-semibold text-gray-900">
                    ${project.goal.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">現在の寄付額</div>
                  <div className="font-semibold text-gray-900">
                    ${project.raised.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <button type="button" className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  新しい変換を実行
                </button>
                <button type="button" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  残高を確認
                </button>
                <button type="button" className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  引き出しを実行
                </button>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">通知</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">新しい寄付</div>
                    <div className="text-gray-600">500 USDTがEthereumチェーンに到着</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">変換完了</div>
                    <div className="text-gray-600">1000 USDT → USDC変換が完了</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
