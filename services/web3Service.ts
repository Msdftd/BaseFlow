import { WalletStats, ReputationScore, RiskLevel } from '../types';

// Helper to generate a consistent number from a string seed (Only for Profile Stats)
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Base Mainnet Configuration
const BASE_CHAIN_ID = '0x2105'; // 8453 in hex
const BASE_RPC_URL = 'https://mainnet.base.org';

// 1. Connection Logic with Network Switching
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      // 1. Request Accounts
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      
      // 2. Check Chain ID
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== BASE_CHAIN_ID) {
        try {
          // Attempt to switch to Base
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: BASE_CHAIN_ID,
                    chainName: 'Base Mainnet',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: [BASE_RPC_URL],
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add Base network", addError);
            }
          } else {
            console.error("Failed to switch network", switchError);
          }
        }
      }

      return accounts[0];
    } catch (error) {
      console.error("User rejected connection", error);
      return null;
    }
  }
  return null;
};

// 2. Deterministic Data Generator (Profile Stats Only)
export const getWalletData = (address: string): { stats: WalletStats, score: ReputationScore } => {
  const seed = hashString(address);
  
  const txCount = (seed % 500) + 20; 
  const uniqueContracts = Math.floor(txCount * 0.3) + (seed % 10);
  const gasSpent = ((seed % 100) / 20).toFixed(3);
  const ethBalance = ((seed % 1000) / 100).toFixed(2);
  
  const longevityScore = Math.min((seed % 250) + 50, 250);
  const activityScore = Math.min(txCount, 300);
  const diversityScore = Math.min(uniqueContracts * 5, 250);
  const identityScore = (seed % 200); 
  
  const totalScore = Math.min(longevityScore + activityScore + diversityScore + identityScore, 1000);
  
  let riskLevel = RiskLevel.LOW;
  if (totalScore < 300) riskLevel = RiskLevel.HIGH;
  else if (totalScore < 600) riskLevel = RiskLevel.MEDIUM;

  const firstTxYear = 2021 + (seed % 3);
  const firstTxMonth = (seed % 12) + 1;
  const firstTxDay = (seed % 28) + 1;

  return {
    stats: {
      address,
      txCount,
      firstTxDate: `${firstTxYear}-${firstTxMonth.toString().padStart(2, '0')}-${firstTxDay.toString().padStart(2, '0')}`,
      ethBalance,
      gasSpent,
      uniqueContracts,
      badges: Math.floor(totalScore / 150)
    },
    score: {
      total: totalScore,
      breakdown: {
        longevity: longevityScore,
        activity: activityScore,
        diversity: diversityScore,
        identity: identityScore
      },
      riskLevel
    }
  };
};

// 3. Real Check-in Data Fetcher
export const fetchCheckInStats = async (address: string) => {
  const STORAGE_KEY = `baseflow_streak_${address}`;
  
  try {
    // Attempt to fetch from the external mini-app API
    // Adding timestamp to prevent caching
    const response = await fetch(`https://my-first-base-miniapp.vercel.app/api/streak?address=${address}&t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      // Update local storage to match API for offline viewing later
      localStorage.setItem(STORAGE_KEY, (data.streak || 0).toString());
      
      return {
        currentStreak: data.streak || 0,
        totalCheckIns: data.total || 0,
        nextMilestone: getNextMilestone(data.streak || 0)
      };
    }
  } catch (error) {
    // console.log("External fetch failed");
  }

  // Fallback: Read from LocalStorage (Only used if API fails)
  const savedData = localStorage.getItem(STORAGE_KEY);
  const currentStreak = savedData ? parseInt(savedData) : 0;

  return {
    currentStreak,
    totalCheckIns: currentStreak, 
    nextMilestone: getNextMilestone(currentStreak)
  };
};

// Helper to calculate milestone
const getNextMilestone = (streak: number) => {
  return [1, 5, 10, 15, 30, 50, 100].find(m => m > streak) || 100;
};

// 4. Strict Verify Logic
export const verifyCheckIn = async (address: string) => {
  // We simply re-fetch the stats. 
  // We DO NOT manually increment local storage anymore.
  // The external API must report the new streak.
  return await fetchCheckInStats(address);
};
