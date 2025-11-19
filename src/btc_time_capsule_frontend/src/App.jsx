import React, { useState, useEffect } from 'react';
// import { auth } from './auth';

const App = () => {
  const [capsules, setCapsules] = useState([]);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Simple auth check - we'll enhance this tomorrow
    setIsAuthenticated(true);
  };

  const createCapsule = async () => {
    if (!message) return;
    
    // For Day 1 - just test basic canister call
    try {
      alert("Capsule creation will be implemented tomorrow!");
      setMessage('');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🔒 BTC Time Capsule</h1>
          <p className="text-gray-600 mb-6">Store encrypted secrets that unlock in the future</p>
          <button 
            onClick={() => setIsAuthenticated(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Connect Wallet (Coming Tomorrow)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🔒 BTC Time Capsule</h1>
          <p className="text-blue-200 text-lg">Store encrypted messages that unlock automatically</p>
        </header>

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
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Unlock After (Days)</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>1 day</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>1 year</option>
                </select>
              </div>

              <button 
                onClick={createCapsule}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                🔒 Create Encrypted Capsule
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
                  {/* Capsules will be listed here */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-white text-center">
          <div className="bg-blue-800 bg-opacity-50 p-6 rounded-2xl">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-bold mb-2">Bitcoin Sign-In</h3>
            <p className="text-blue-200 text-sm">Prove ownership with your BTC address</p>
          </div>
          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-2xl">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-bold mb-2">Automatic Unlock</h3>
            <p className="text-purple-200 text-sm">Messages decrypt after your chosen time</p>
          </div>
          <div className="bg-green-800 bg-opacity-50 p-6 rounded-2xl">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-bold mb-2">Guardian Recovery</h3>
            <p className="text-green-200 text-sm">Trusted contacts can access in emergencies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;