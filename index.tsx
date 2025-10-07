import './index.css';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { type Address, createWalletClient, custom, type Hash } from 'viem';
import { arbitrum } from 'viem/chains';

// Mock window.ethereum for demonstration
const mockEthereum = {
  request: async ({ method, params }: any) => {
    if (method === 'eth_requestAccounts') {
      return ['0xfff0BF131DAEa9bA4e97829D2d3043aaef3213ff'];
    }
    if (method === 'eth_signTypedData_v4') {
      return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b';
    }
    return null;
  },
};

const walletClient = createWalletClient({
  chain: arbitrum,
  transport: custom(ethereum as any),
});

function Example() {
  const [account, setAccount] = useState<Address>();
  const [signature, setSignature] = useState<Hash>();
  const [permitData, setPermitData] = useState<string>('');
  const [error, setError] = useState<string>('');

  const connect = async () => {
    try {
      const [address] = await walletClient.requestAddresses();
      setAccount(address);
      setError('');
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setAccount(undefined);
    setSignature(undefined);
    setPermitData('');
    setError('');
  };

  const signTypedData = async () => {
    if (!account) return;

    try {
      // Parse the JSON permit data
      const parsedData = JSON.parse(permitData);

      // Handle both 'message' and 'values' keys - normalize to 'message'
      let messageData = parsedData.message;
      if (!messageData && parsedData.values) {
        messageData = parsedData.values;
      }

      // Validate required fields
      if (
        !parsedData.domain ||
        !parsedData.types ||
        !messageData ||
        !parsedData.primaryType
      ) {
        throw new Error('Invalid permit data structure');
      }

      const signature = await walletClient.signTypedData({
        account,
        domain: parsedData.domain,
        types: parsedData.types,
        primaryType: parsedData.primaryType,
        message: messageData,
      });

      setSignature(signature);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign data');
      setSignature(undefined);
    }
  };

  if (account)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">
                Permit Data Signer
              </h1>
              <p className="text-blue-100 mt-1">
                Sign EIP-712 typed data for permits
              </p>
            </div>

            {/* Connected Account */}
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium">Connected:</span>
                    <span className="font-mono text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                      {account}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ml-5">
                    <span className="text-green-800 font-medium">Chain:</span>
                    <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                      {walletClient.chain.name} (ID: {walletClient.chain.id})
                    </span>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
              {/* JSON Input Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-gray-800">
                    📄 Permit Data (JSON)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(
                            JSON.parse(permitData),
                            null,
                            2
                          );
                          setPermitData(formatted);
                        } catch (e) {
                          // ignore if invalid JSON
                        }
                      }}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                    >
                      🎨 Format JSON
                    </button>
                    <button
                      onClick={() => setPermitData('')}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={permitData}
                    onChange={(e) => setPermitData(e.target.value)}
                    className="w-full h-80 p-4 border-2 border-gray-200 rounded-xl font-mono text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
                    placeholder="Paste your permit JSON data here..."
                    spellCheck={false}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    {permitData.length} characters
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={signTypedData}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>✍️</span>
                  <span>Sign Permit Data</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 text-lg">❌</span>
                    <div>
                      <p className="font-semibold text-red-800">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Display */}
              {signature && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-green-500 text-lg">✅</span>
                    <h3 className="font-semibold text-green-800 text-lg">
                      Signature Generated
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Signature Hash:
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(signature)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="font-mono text-sm break-all bg-gray-50 p-3 rounded border-2 border-dashed border-green-300">
                      {signature}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl text-white">🔗</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Connect your wallet to sign permit data
          </p>
          <button
            onClick={connect}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />
);
