'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { useWeb3Context } from '@/providers/Web3Provider';
import BridgeDialog from './BridgeDialog';
import BridgeAndExecuteTest from './BridgeAndExecuteTest';

const Nexus = () => {
  const { isConnected } = useAccount();
  const { network } = useWeb3Context();
  const [isBridgeDialogOpen, setIsBridgeDialogOpen] = useState(false);
  const [isBridgeAndExecuteOpen, setIsBridgeAndExecuteOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC' | null>(null);

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <div className="flex flex-col justify-center items-center gap-y-4">
          <div className="w-full mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Nexus SDK Status</h3>
            <p className="text-sm text-blue-600">
              Network: {network} | Wallet: {isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>

          <div className="w-full flex items-center gap-x-4">
            <div className="bg-card rounded-lg border border-gray-400 p-6 shadow-sm text-center w-1/2">
              <h3 className="text-lg font-semibold mb-4">Bridge Tokens</h3>
              <Button
                disabled={!isConnected}
                onClick={() => setIsBridgeDialogOpen(true)}
                className="w-full font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnected ? 'Bridge Tokens' : 'Connect Wallet First'}
              </Button>
            </div>
            <div className="bg-card rounded-lg border border-gray-400 p-6 shadow-sm text-center w-1/2">
              <h3 className="text-lg font-semibold mb-4">Transfer Tokens</h3>
              <Button
                disabled={!isConnected}
                className="w-full font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnected ? 'Transfer Tokens' : 'Connect Wallet First'}
              </Button>
            </div>
          </div>
          <div className="w-full flex items-center gap-x-4">
            <div className="bg-card rounded-lg border border-gray-400 p-6 shadow-sm text-center w-1/2">
              <h3 className="text-lg font-semibold mb-4">Bridge & Supply USDT on AAVE</h3>
              <Button
                disabled={!isConnected}
                onClick={() => {
                  setSelectedToken('USDT');
                  setIsBridgeAndExecuteOpen(true);
                }}
                className="w-full font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnected ? 'Bridge & Supply USDT' : 'Connect Wallet First'}
              </Button>
            </div>
            <div className="bg-card rounded-lg border border-gray-400 p-6 shadow-sm text-center w-1/2">
              <h3 className="text-lg font-semibold mb-4">Bridge & Supply USDC on AAVE</h3>
              <Button
                disabled={!isConnected}
                onClick={() => {
                  setSelectedToken('USDC');
                  setIsBridgeAndExecuteOpen(true);
                }}
                className="w-full font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnected ? 'Bridge & Supply USDC' : 'Connect Wallet First'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bridge & Execute Test Component - Conditional Display */}
        {isBridgeAndExecuteOpen && (
          <div className="mt-8">
            <BridgeAndExecuteTest
              onClose={() => {
                setIsBridgeAndExecuteOpen(false);
                setSelectedToken(null);
              }}
              selectedToken={selectedToken}
            />
          </div>
        )}
      </CardContent>

      {/* Bridge Dialog */}
      <BridgeDialog isOpen={isBridgeDialogOpen} onOpenChange={setIsBridgeDialogOpen} />
    </Card>
  );
};

export default Nexus;
