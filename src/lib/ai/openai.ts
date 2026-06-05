import OpenAI from "openai";

export async function createDivinationInterpretation(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5.2";

  return {
    model,
    summary: "테스트용 AI 해석",
    result: `
현재 상황은 긍정적으로 보입니다.

주역은 성급한 결정보다는 신중한 접근을 권장합니다.

지금은 기반을 다지는 시기로 보이며,
무리한 확장보다는 준비와 검증에 집중하는 것이 좋습니다.

좋은 기회가 다가오고 있으니 꾸준히 진행하십시오. 
`,
    inputTokens: 0,
    outputTokens: 0
  };
}