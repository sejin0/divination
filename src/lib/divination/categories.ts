import type { QuestionCategory } from "./types";

const patterns: Record<Exclude<QuestionCategory, "general">, RegExp> = {
  wealth: /돈|금전|재물|투자|주식|매매|부동산|월급|연봉|사업|수익|계약/i,
  love: /사랑|연애|결혼|이별|재회|관계|친구|가족|부부|상대|인연/i,
  career: /취업|이직|퇴사|면접|합격|시험|공부|직장|프로젝트|승진|창업|진로/i,
  health: /건강|병|치료|수술|회복|운동|다이어트|스트레스|병원|컨디션/i
};

export const categoryLabels: Record<QuestionCategory, string> = {
  wealth: "재물 및 투자",
  love: "애정 및 관계",
  career: "직업 및 학업",
  health: "건강 및 컨디션",
  general: "종합 조언"
};

export function analyzeQuestion(question: string): QuestionCategory {
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(question)) {
      return category as QuestionCategory;
    }
  }

  return "general";
}
