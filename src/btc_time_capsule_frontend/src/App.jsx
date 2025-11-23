import React, { useState, useEffect } from "react";
import { btc_time_capsule_backend } from "declarations/btc_time_capsule_backend";

const App = () => {
  const [capsules, setCapsules] = useState([]);
  const [message, setMessage] = useState("");
  const [unlockDays, setUnlockDays] = useState(1);
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [isBitcoinVerified, setIsBitcoinVerified] = useState(false);
  const [guardians, setGuardians] = useState([]);

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
        const myGuardians = await btc_time_capsule_backend.get_my_guardians();
        setGuardians(myGuardians);
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
        unlock_delay_days: unlockDays,
      });

      alert(result);
      setMessage("");
      // Refresh capsules list
      const myCapsules = await btc_time_capsule_backend.get_my_capsules();
      setCapsules(myCapsules);
    } catch (error) {
      console.error("Error creating capsule:", error);
    }
  };

  const unlockCapsule = async (index) => {
    try {
      const decryptedMessage = await btc_time_capsule_backend.unlock_capsule(
        index
      );
      alert(`Decrypted message: ${decryptedMessage}`);

      // Refresh capsules list
      const myCapsules = await btc_time_capsule_backend.get_my_capsules();
      setCapsules(myCapsules);
    } catch (error) {
      console.error("Error unlocking capsule:", error);
      alert("Failed to unlock capsule. It may not be ready yet.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔒 BTC Time Capsule
          </h1>
          <p className="text-blue-200 text-lg">
            Store encrypted secrets that unlock automatically
          </p>
        </header>

        {/* Bitcoin Sign-In Section */}
        {!isBitcoinVerified ? (
          <div className="bg-yellow-500 rounded-2xl p-6 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🔑 Sign In with Bitcoin
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-800 mb-2 font-semibold">
                  Your Bitcoin Address
                </label>
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
            <p className="text-white font-semibold">
              ✅ Bitcoin Address Verified: {bitcoinAddress}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Capsule Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Create New Capsule
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Your Secret Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your secret message here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!isBitcoinVerified}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Unlock After (Days)
                </label>
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
                {isBitcoinVerified
                  ? "🔒 Create Encrypted Capsule"
                  : "Please Verify Bitcoin First"}
              </button>
            </div>
          </div>

          {/* My Capsules Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              My Time Capsules
            </h2>

            <div className="space-y-4">
              {capsules.map((capsule, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <p className="text-gray-600">Capsule #{index + 1}</p>
                  <p className="text-sm text-gray-500">
                    Status: {capsule.is_unlocked ? "Unlocked ✅" : "Locked 🔒"}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => unlockCapsule(index)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      🔓 Unlock
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const result =
                            await btc_time_capsule_backend.test_unlock_now(
                              index
                            );
                          alert(result);
                          // Refresh capsules
                          const myCapsules =
                            await btc_time_capsule_backend.get_my_capsules();
                          setCapsules(myCapsules);
                        } catch (error) {
                          console.error("Test unlock failed:", error);
                        }
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      🧪 Test Unlock
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const result =
                            await btc_time_capsule_backend.test_guardian_unlock(
                              index
                            );
                          alert(result);
                          const myCapsules =
                            await btc_time_capsule_backend.get_my_capsules();
                          setCapsules(myCapsules);
                        } catch (error) {
                          console.error("Guardian unlock failed:", error);
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      🚨 Guardian Unlock
                    </button>
                  </div>
                  {capsule.is_unlocked && (
                    <p className="text-green-600 text-sm mt-1">✓ Unlocked</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guardian Management Section */}
          {isBitcoinVerified && (
            <div className="bg-orange-500 rounded-2xl p-6 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                👥 Guardian Recovery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Guardian */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Add Trusted Guardian
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Guardian's Bitcoin address..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      id="guardianAddress"
                    />
                    <button
                      onClick={async () => {
                        const address =
                          document.getElementById("guardianAddress").value;
                        if (!address) {
                          alert("Please enter a guardian address");
                          return;
                        }
                        try {
                          const result =
                            await btc_time_capsule_backend.add_guardian(
                              address
                            );
                          alert(result);
                          document.getElementById("guardianAddress").value = "";
                          // Refresh guardians list
                          const myGuardians =
                            await btc_time_capsule_backend.get_my_guardians();
                          setGuardians(myGuardians);
                        } catch (error) {
                          console.error("Error adding guardian:", error);
                        }
                      }}
                      className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
                    >
                      Add Guardian
                    </button>
                  </div>
                </div>

                {/* My Guardians */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    My Guardians
                  </h3>
                  <div className="space-y-2">
                    {guardians.length === 0 ? (
                      <p className="text-gray-700">No guardians added yet</p>
                    ) : (
                      guardians.map((guardian, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-orange-400 p-2 rounded"
                        >
                          <span className="text-gray-800 text-sm">
                            {guardian}
                          </span>
                          <span className="text-green-600 text-sm">
                            ✓ Trusted
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
