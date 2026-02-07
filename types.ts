export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface WalletStats {
  address: string;
  txCount: number;
  firstTxDate: string;
  ethBalance: string;
  gasSpent: string;
  uniqueContracts: number;
  badges: number;
}

export interface ReputationScore {
  total: number;
  breakdown: {
    longevity: number;
    activity: number;
    diversity: number;
    identity: number;
  };
  riskLevel: RiskLevel;
}

export interface Campaign {
  id: string;
  title: string;
  provider: string;
  description: string;
  reward: string;
  tags: string[];
  participants: number;
  iconUrl: string;
  status?: 'active' | 'pending' | 'claimed';
}

export interface ProjectStats {
  totalCampaigns: number;
  activeUsers: number;
  budgetSpent: string;
  conversionRate: string;
}

export interface AiAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sybilAssessment: string;
}