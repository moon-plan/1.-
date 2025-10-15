
import { GoogleGenAI } from "@google/genai";
import { Answer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalGuide = async (
  fileContent: string,
  answers: Answer[]
): Promise<string> => {
  try {
    const qaTranscript = answers
      .map((a) => `질문: ${a.question}\n답변: ${a.answer}`)
      .join('\n\n');

    const prompt = `
      당신은 공공기관 출판물 입찰 제안서 작성을 돕는 전문 컨설턴트입니다.
      아래 제공되는 '공고문' 내용과 사용자와의 '질의응답' 내용을 종합적으로 분석하여,
      성공적인 입찰을 위한 체계적이고 전문적인 '기획 가이드'를 작성해 주세요.

      결과물은 명확한 제목과 부제목을 사용하고, 핵심 내용은 글머리 기호를 활용하여 가독성 높게 구성해야 합니다.
      분석 내용을 바탕으로 제안서에 포함되어야 할 핵심 전략과 실행 방안을 구체적으로 제시해 주세요.
      출력 언어는 한국어입니다.

      ---
      [공고문 내용]
      ${fileContent}
      ---
      [질의응답 내용]
      ${qaTranscript}
      ---

      [기획 가이드]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating proposal guide:", error);
    throw new Error("기획 가이드 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
};
