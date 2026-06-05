export type HexLine = 0 | 1;

export type HexagramCode =
  `${HexLine}${HexLine}${HexLine}${HexLine}${HexLine}${HexLine}`;

export type QuestionCategory = "wealth" | "love" | "career" | "health" | "general";

export type DivinationResult = {
  code: HexagramCode;
  lines: HexLine[];
  category: QuestionCategory;
  rank: number;
  finalScore: number;
  hexagram: {
    name: string;
    hanja: string | null;
    score: number;
    meaning: string;
    advice: string;
    element: string | null;
    upperTrigram: string;
    lowerTrigram: string;
  };
  ai: {
    summary: string;
    result: string;
    prefix: string;
    advice: string;
    suffix: string;
    score: number;
  };
};
