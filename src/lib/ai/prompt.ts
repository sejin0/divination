import { categoryLabels } from "@/lib/divination/categories";
import type { QuestionCategory } from "@/lib/divination/types";
import type { Hexagram } from "@/lib/db/schema";

export function buildDivinationPrompt(params: {
  question: string;
  category: QuestionCategory;
  hexagram: Hexagram;
}) {
  const { question, category, hexagram } = params;

  return [
    "당신은 주역 상담 전문가입니다.",
    "반드시 제공된 괘 정보만 기반으로 해석하세요.",
    "괘를 새로 만들거나 사용자의 미래를 단정적으로 예언하지 마세요.",
    "의학, 법률, 투자 수익 보장을 단정하지 마세요.",
    "상담과 통찰 중심으로 한국어 답변을 작성하세요.",
    "",
    `질문: ${question}`,
    `질문 분야: ${categoryLabels[category]}`,
    `괘 코드: ${hexagram.code}`,
    `괘 이름: ${hexagram.name} ${hexagram.hanja ?? ""}`,
    `괘 점수: ${hexagram.score}`,
    `괘 의미: ${hexagram.meaning}`,
    `기본 조언: ${hexagram.advice}`,
    "",
    "출력 형식:",
    "1. 한 줄 요약",
    "2. 현재 상황",
    "3. 주역 해석",
    "4. 주의할 점",
    "5. 실천 조언"
  ].join("\n");
}
