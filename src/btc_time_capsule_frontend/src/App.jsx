import React, { useState, useEffect } from 'react';
import { btc_time_capsule_backend } from 'declarations/btc_time_capsule_backend';

const App = () => {
  const [capsules, setCapsules] = useState([]);
  const [message, setMessage] = useState('');
  const [unlockDays, setUnlockDays] = useState(1);
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [isBitcoinVerified, setIsBitcoinVerified] = useState(false);

  // Bitcoin sign-in handler
  const handleBitcoinSignIn = async () => {
    if (!bitcoinAddress) {
      alert("Please enter a Bitcoin address");
      return;
    }
    
    try {
      const verified = await btc_time_capsule_backend.verify_bitcoin_ownership(
        bitcoinAddress, 
        "verify", 
        "signature"
      );
      
      if (verified) {
        setIsBitcoinVerified(true);
        alert("Bitcoin address verified! 🎉");
      }
    } catch (error) {
      console.error("Bitcoin verification failed:", error);
      alert("Verification failed. Please try again.");
    }
  };

  const createCapsule = async () => {
    if (!message || !isBitcoinVerified) {
      alert("Please verify your Bitcoin address first!");
      return;
    }
    
    try {
      const result = await btc_time_capsule_backend.create_capsule({
        encrypted_message: message,
        unlock_delay_days: unlockDays
      });
      
      alert(result);
      setMessage('');
      // Refresh capsules list
      const myCapsules = await btc_time_capsule_backend.get_my_capsules();
      setCapsules(myCapsules);
    } catch (error) {
      console.error("Error creating capsule:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🔒 BTC Time Capsule</h1>
          <p className="text-blue-200 text-lg">Store encrypted secrets that unlock automatically</p>
        </header>

        {/* Bitcoin Sign-In Section */}
        {!isBitcoinVerified ? (
          <div className="bg-yellow-500 rounded-2xl p-6 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔑 Sign In with Bitcoin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-800 mb-2 font-semibold">Your Bitcoin Address</label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  placeholder="Enter your Bitcoin testnet address..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button 
                onClick={handleBitcoinSignIn}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Verify Bitcoin Ownership
              </button>
              <p className="text-gray-700 text-sm">
                💡 Use a Bitcoin testnet address for development
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-500 rounded-2xl p-4 mb-8 text-center">
            <p className="text-white font-semibold">✅ Bitcoin Address Verified: {bitcoinAddress}</p>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Capsule Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Capsule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Your Secret Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your secret message here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!isBitcoinVerified}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Unlock After (Days)</label>
                <select 
                  value={unlockDays}
                  onChange={(e) => setUnlockDays(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled={!isBitcoinVerified}
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              <button 
                onClick={createCapsule}
                disabled={!isBitcoinVerified}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBitcoinVerified ? "🔒 Create Encrypted Capsule" : "Please Verify Bitcoin First"}
              </button>
            </div>
          </div>

          {/* My Capsules Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Time Capsules</h2>
            
            <div className="space-y-4">
              {capsules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-6xl mb-4">⏳</div>
                  <p>No capsules yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {capsules.map((capsule, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600">Capsule #{index + 1}</p>
                      <p className="text-sm text-gray-500">Unlocks in {capsule.unlock_delay_days} days</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;