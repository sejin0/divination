"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { categoryLabels } from "@/lib/divination/categories";
import type { DivinationResult, HexLine } from "@/lib/divination/types";
import { HexLineView } from "./hex-line";

type ViewState = "intro" | "casting" | "result";

function castClientLine(): HexLine {
  return Math.random() > 0.5 ? 1 : 0;
}

export function CastingExperience() {
  const [question, setQuestion] = useState("");
  const [view, setView] = useState<ViewState>("intro");
  const [lines, setLines] = useState<HexLine[]>([]);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const castingRows = useMemo(() => {
    const rows = [];

    for (let j = 5; j >= 0; j -= 1) {
      if (j >= lines.length) {
        rows.push(<div key={`empty-${j}`} className="h-4 w-full max-w-[200px] bg-transparent opacity-0" />);
      } else {
        rows.push(
          <HexLineView
            key={`line-${j}-${lines[j]}`}
            value={lines[j]}
            animate={j === lines.length - 1}
          />
        );
      }
    }

    return rows;
  }, [lines]);

  async function submitDivination(finalLines: HexLine[]) {
    const response = await fetch("/api/divination", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        lines: finalLines
      })
    });

    const payload = (await response.json()) as DivinationResult | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "점괘 생성 중 오류가 발생했습니다.");
    }

    setResult(payload);
    setView("result");
  }

  function startCasting() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("질문을 입력해주세요.");
      return;
    }

    timers.current.forEach(clearTimeout);
    timers.current = [];
    setError(null);
    setResult(null);
    setLines([]);
    setView("casting");

    const currentHexagram: HexLine[] = [];

    for (let i = 0; i < 6; i += 1) {
      const timer = setTimeout(() => {
        currentHexagram.push(castClientLine());
        setLines([...currentHexagram]);
      }, 800 * (i + 1));

      timers.current.push(timer);
    }

    const finishTimer = setTimeout(() => {
      submitDivination([...currentHexagram]).catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : "점괘 생성 중 오류가 발생했습니다.");
        setView("intro");
      });
    }, 800 * 7);

    timers.current.push(finishTimer);
  }

  if (view === "casting") {
    return (
      <section className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="mb-8 animate-pulse text-center">
          <h2 className="text-xl font-medium text-slate-700">천지의 기운을 읽는 중</h2>
          <p className="mt-2 text-sm text-slate-400">아래 효부터 하나씩 괘를 짓고 있습니다...</p>
        </div>
        <div className="flex min-h-[250px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white/50 p-8 shadow-inner">
          {castingRows}
        </div>
      </section>
    );
  }

  if (view === "result" && result) {
    const resultLines = [...result.lines].reverse();

    return (
      <section className="w-full animate-zoom-in pb-10">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
          <div className="relative flex min-h-[24rem] flex-col items-center justify-center bg-slate-900 px-6 py-10 text-center text-white">
            <div className="mb-6 flex w-[90px] flex-col gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {resultLines.map((line, index) => (
                <HexLineView key={`${line}-${index}`} value={line} variant="result" />
              ))}
            </div>
            <p className="mb-2 text-sm font-semibold text-amber-300">
              {categoryLabels[result.category]} · 상위 {result.rank}위
            </p>
            <h2 className="mb-2 text-4xl font-bold">{result.hexagram.name}</h2>
            <p className="font-serif text-2xl text-amber-200">{result.hexagram.hanja}</p>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">질문</p>
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{question}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">괘의 의미</p>
              <p className="text-sm leading-7 text-slate-700">{result.hexagram.meaning}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">AI 상담</p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{result.ai.result}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuestion("");
                setLines([]);
                setResult(null);
                setView("intro");
              }}
              className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition active:scale-[0.98]"
            >
              새 질문하기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full animate-fade-in-bottom">
      <div className="w-full rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
        <label htmlFor="question-input" className="mb-3 block text-center text-sm font-medium text-slate-600">
          무엇이 궁금하신가요?
        </label>
        <textarea
          id="question-input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          placeholder={"예: 이번 프로젝트가 잘 될까요?\n예: 그 사람과 다시 만날 수 있을까요?"}
        />
        {error ? <p className="mt-3 text-center text-sm text-rose-600">{error}</p> : null}
        <button
          type="button"
          onClick={startCasting}
          className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition active:scale-[0.98]"
        >
          <Sparkles className="h-[18px] w-[18px] text-amber-400 transition-transform group-hover:rotate-12" />
          점치기 시작
        </button>
      </div>
    </section>
  );
}
