import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createDivinationInterpretation } from "@/lib/ai";
import { buildDivinationPrompt } from "@/lib/ai/prompt";
import { analyzeQuestion } from "@/lib/divination/categories";
import { calculateRank, castHexagramLines, linesToCode } from "@/lib/divination/engine";
import { getDb } from "@/lib/db";
import { aiLogs, divinations, hexagrams, questions } from "@/lib/db/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(500),
  lines: z.array(z.union([z.literal(0), z.literal(1)])).length(6).optional()
});

export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "질문을 2자 이상 500자 이하로 입력해주세요." }, { status: 400 });
  }

  const category = analyzeQuestion(body.data.question);
  const lines = body.data.lines ?? castHexagramLines();
  const code = linesToCode(lines);
  const db = getDb();
  const [hexagram] = await db.select().from(hexagrams).where(eq(hexagrams.code, code)).limit(1);

  if (!hexagram) {
    return NextResponse.json({ error: `괘 데이터를 찾을 수 없습니다: ${code}` }, { status: 404 });
  }

  const prompt = buildDivinationPrompt({ question: body.data.question, category, hexagram });
  const ai = await createDivinationInterpretation(prompt);
  const finalScore = hexagram.score;
  const rank = calculateRank(finalScore);

  const [questionRow] = await db
    .insert(questions)
    .values({ question: body.data.question, category })
    .returning({ id: questions.id });

  const resultJson = { code, lines, category, finalScore, rank };

  await db.insert(divinations).values({
    questionId: questionRow.id,
    hexagramCode: code,
    aiSummary: ai.summary,
    aiResult: ai.result,
    resultJson
  });

  await db.insert(aiLogs).values({
    model: ai.model,
    prompt,
    response: ai.result,
    inputTokens: ai.inputTokens,
    outputTokens: ai.outputTokens
  });

  return NextResponse.json({
    code,
    lines,
    category,
    rank,
    finalScore,
    hexagram: {
      name: hexagram.name,
      hanja: hexagram.hanja,
      score: hexagram.score,
      meaning: hexagram.meaning,
      advice: hexagram.advice,
      element: hexagram.element,
      upperTrigram: hexagram.upperTrigram,
      lowerTrigram: hexagram.lowerTrigram
    },
    ai: {
      summary: ai.summary,
      result: ai.result,
      prefix: ai.prefix,
      advice: ai.advice,
      suffix: ai.suffix,
      score: ai.score
    }
  });
}
