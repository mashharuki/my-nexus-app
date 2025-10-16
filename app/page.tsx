import Nexus from '@/components/nexus/nexus';
import ViewUnifiedBalance from '@/components/nexus/view-balance';

/**
 * App Component
 * @returns
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CrossDonate - Nexus SDK Demo</h1>
          <p className="text-gray-600 mb-4">
            Powered by Nexus SDK for cross-chain functionality. Connect your wallet to get started.
          </p>
        </div>

        <div className="flex items-center flex-col gap-y-2">
          <ViewUnifiedBalance />
          <Nexus />
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            This demo showcases Nexus SDK integration for cross-chain operations. Connect your
            wallet to experience the full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
