import { GoogleGenAI, Type } from "@google/genai";
import { WalletStats, ReputationScore, AiAnalysisResult } from '../types';

export const analyzeWalletReputation = async (
  stats: WalletStats,
  score: ReputationScore
): Promise<AiAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are BaseFlow's advanced On-Chain Reputation Engine. 
      Analyze the following wallet data on the Base (L2) network and provide a "Proof of Humanity" assessment.
      
      Wallet Data:
      - Age: Since ${stats.firstTxDate}
      - Transactions: ${stats.txCount}
      - Unique Contracts: ${stats.uniqueContracts}
      - Gas Spent: ${stats.gasSpent} ETH
      - Current Score: ${score.total}/1000
      - Calculated Risk: ${score.riskLevel}

      Provide the response in JSON format with the following schema:
      {
        "summary": "A 2-sentence executive summary of this user's on-chain behavior.",
        "strengths": ["List 3 key positive behavioral signals"],
        "weaknesses": ["List 2 potential areas for improvement"],
        "sybilAssessment": "A specific statement about the likelihood of this being a bot/sybil attacker."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            sybilAssessment: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis failed due to network or API limits.",
      strengths: ["N/A"],
      weaknesses: ["N/A"],
      sybilAssessment: "Unknown"
    };
  }
};