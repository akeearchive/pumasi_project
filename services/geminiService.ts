import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseGuestListImage = async (base64Image: string): Promise<{ name: string; amount: number; relation: string; hasMeal?: boolean; memo?: string }[]> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    return [
      { name: "김철수 (AI)", amount: 100000, relation: "FRIEND", hasMeal: true, memo: "mock data" },
      { name: "이영희 (AI)", amount: 50000, relation: "COLLEAGUE", hasMeal: false }
    ];
  }

  try {
    // Remove header if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this image of a guest list (wedding or funeral). Identify the columns: '순번' (Sequence), '관계' (Relation), '대상' (Target), '이름' (Name), '금액' (Amount), '식권갯수' (Meal Ticket Count), '비고' (Note). Extract the list of guests. For each guest, return name, amount (number only). IMPORTANT: Map '관계' column values as follows: '친구/지인' or '친구' -> 'FRIEND', '직장동료' or '동료' -> 'COLLEAGUE', '친척/가족' or '가족' or '친척' -> 'FAMILY', everything else -> 'OTHER'. If '식권갯수' (Meal Ticket Count) is 1 or more, set hasMeal to true, otherwise false. Map '비고' to memo. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              relation: { type: Type.STRING },
              hasMeal: { type: Type.BOOLEAN },
              memo: { type: Type.STRING },
            },
            required: ["name", "amount"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("이미지 분석에 실패했습니다.");
  }
};