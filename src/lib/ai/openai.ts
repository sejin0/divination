import OpenAI from "openai";

export interface DivinationAiResult {
  model: string;
  summary: string;
  result: string;
  prefix: string;
  advice: string;
  suffix: string;
  score: number;
  inputTokens: number;
  outputTokens: number;
}

export async function createDivinationInterpretation(prompt: string): Promise<DivinationAiResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // API 키가 없으면 구조화된 목업 데이터 반환
  if (!apiKey) {
    return getMockResult(model, prompt);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model,
      max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 주역 상담 전문가입니다. 반드시 아래 JSON 형식으로만 응답하세요.\n" +
            "{\n" +
            '  "summary": "한 줄 핵심 요약 (20자 이내)",\n' +
            '  "prefix": "현재 상황과 흐름 분석 (2~3문장, ~건대/~건데 어미 사용)",\n' +
            '  "advice": "주역 괘 기반 상세 풀이 (3~5문장, 구체적 조언)",\n' +
            '  "suffix": "실천 조언 한 가지 (1~2문장, 핵심 행동 지침)",\n' +
            '  "score": 괘 점수 그대로 사용 (정수)\n' +
            "}\n" +
            "의학·법률·투자 수익을 보장하지 말고, 상담과 통찰 중심으로 작성하세요."
        },
        { role: "user", content: prompt }
      ]
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as {
      summary?: string;
      prefix?: string;
      advice?: string;
      suffix?: string;
      score?: number;
    };

    return {
      model,
      summary: parsed.summary ?? "주역 해석 완료",
      result: [parsed.prefix, parsed.advice, parsed.suffix].filter(Boolean).join("\n\n"),
      prefix: parsed.prefix ?? "",
      advice: parsed.advice ?? "",
      suffix: parsed.suffix ?? "",
      score: typeof parsed.score === "number" ? parsed.score : 50,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0
    };
  } catch {
    return getMockResult(model, prompt);
  }
}

function getMockResult(model: string, prompt: string): DivinationAiResult {
  // prompt에서 카테고리/괘 이름 추출해서 좀 더 자연스러운 목업 생성
  const isLove = prompt.includes("애정") || prompt.includes("사랑") || prompt.includes("연애");
  const isWealth = prompt.includes("재물") || prompt.includes("투자") || prompt.includes("사업");
  const isCareer = prompt.includes("직업") || prompt.includes("취업") || prompt.includes("학업");

  let prefix: string;
  let advice: string;
  let suffix: string;

  if (isLove) {
    prefix = "사람과 사람 사이의 인연과 애정의 궤적을 짚어보건대,";
    advice =
      "아직 일이 마무리되지 않았고 혼란스러운 상태입니다. 하지만 이는 끝이 아니라 새로운 시작을 의미합니다. 지금은 힘이 들더라도 귀 기울이고, 끝까지 노력하면 결국에는 이룰 수 있습니다. 마지막 순간까지 긴장을 늦추지 마십시오.";
    suffix =
      "좋은 인연은 억지로 맺어지지 않으며, 깊은 신뢰와 존중 속에서 피어납니다. 상대방의 작은 감정 변화에 귀 기울이고, 진심은 반드시 달게 마련입니다.";
  } else if (isWealth) {
    prefix = "재물의 기운과 현재의 흐름을 깊이 통찰해보건대,";
    advice =
      "당장의 큰 이익을 좇기보다 내실을 다지고 안정적인 기반을 마련하는 데 집중하십시오. 섣부른 투자나 새로운 사업보다는 현재 상황을 점검하고 불필요한 지출을 줄이는 시기입니다. 꾸준한 준비가 결국 좋은 결과를 만들어냅니다.";
    suffix = "금전은 흐르는 물과 같아 머물게 하는 지혜가 필요합니다. 때를 기다리며 준비하는 자에게 가장 큰 재물이 주어집니다.";
  } else if (isCareer) {
    prefix = "당신의 업(業)과 사회적 성취를 향한 기운을 풀어보건대,";
    advice =
      "원칙과 정도를 지키며 묵묵히 실력을 갈고닦으십시오. 눈앞의 장애물은 당신의 그릇을 키우기 위한 시험입니다. 때가 이르면 웅크렸던 만큼 더 높이 도약할 것입니다.";
    suffix = "당장 눈앞에 놓인 장애물은 당신의 그릇을 키우기 위한 하늘의 시험입니다. 차근차근 단계를 밟아 나가면 반드시 결실을 맺을 것입니다.";
  } else {
    prefix = "당신을 둘러싼 우주의 기운과 전반적인 운의 흐름을 살피건대,";
    advice =
      "세상 만사는 음양의 조화 속에서 끊임없이 변화합니다. 좋을 때일수록 겸손하고, 어려울 때일수록 희망을 잃지 않는 중용의 자세가 필요합니다. 맑은 마음으로 순리를 따르면 결국 길운이 당신과 함께할 것입니다.";
    suffix = "조급한 마음을 내려놓고 현재에 충실하십시오. 작은 성실함이 쌓여 큰 결실로 이어집니다.";
  }

  return {
    model,
    summary: "주역 해석 완료",
    result: [prefix, advice, suffix].join("\n\n"),
    prefix,
    advice,
    suffix,
    score: 55,
    inputTokens: 0,
    outputTokens: 0
  };
}
