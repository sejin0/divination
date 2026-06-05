"use client";

import { Sparkles, Info, RefreshCcw, BookMarked, UserCog, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryLabels } from "@/lib/divination/categories";
import type { DivinationResult, HexLine } from "@/lib/divination/types";
import { HexLineView } from "./hex-line";

type ViewState = "profile" | "intro" | "casting" | "result";

const YEAR_STEM_ELEMENTS: Record<string, { type: string; name: string; icon: string; colorClass: string; bgClass: string; borderClass: string; desc: string }> = {
  "4": { type: "wood",  name: "목(木)", icon: "🌳", colorClass: "text-emerald-600", bgClass: "bg-emerald-100", borderClass: "border-emerald-200", desc: "하늘로 뻗어가는 큰 나무의 강직한 기운" },
  "5": { type: "wood",  name: "목(木)", icon: "🌿", colorClass: "text-emerald-500", bgClass: "bg-emerald-50",  borderClass: "border-emerald-100", desc: "바람에 유연한 화초와 넝쿨의 기운" },
  "6": { type: "fire",  name: "화(火)", icon: "☀️", colorClass: "text-rose-600",    bgClass: "bg-rose-100",    borderClass: "border-rose-200",    desc: "만물을 비추는 크고 밝은 태양의 기운" },
  "7": { type: "fire",  name: "화(火)", icon: "🕯️", colorClass: "text-rose-500",    bgClass: "bg-rose-50",     borderClass: "border-rose-100",    desc: "어둠을 밝히는 은은한 촛불의 기운" },
  "8": { type: "earth", name: "토(土)", icon: "⛰️", colorClass: "text-amber-700",   bgClass: "bg-amber-100",   borderClass: "border-amber-200",   desc: "만물을 묵묵히 품는 거대한 태산의 기운" },
  "9": { type: "earth", name: "토(土)", icon: "🌱", colorClass: "text-amber-600",   bgClass: "bg-amber-50",    borderClass: "border-amber-100",   desc: "생명을 길러내는 비옥한 평야의 기운" },
  "0": { type: "metal", name: "금(金)", icon: "🪨", colorClass: "text-slate-600",   bgClass: "bg-slate-200",   borderClass: "border-slate-300",   desc: "예리하게 벼려진 강철과 바위의 기운" },
  "1": { type: "metal", name: "금(金)", icon: "💎", colorClass: "text-slate-500",   bgClass: "bg-slate-100",   borderClass: "border-slate-200",   desc: "섬세하고 아름답게 세공된 보석의 기운" },
  "2": { type: "water", name: "수(水)", icon: "🌊", colorClass: "text-blue-600",    bgClass: "bg-blue-100",    borderClass: "border-blue-200",    desc: "모든 것을 휩쓰는 거대한 바다의 기운" },
  "3": { type: "water", name: "수(水)", icon: "🌧️", colorClass: "text-blue-500",    bgClass: "bg-blue-50",     borderClass: "border-blue-100",    desc: "대지를 촉촉히 적시는 봄비의 기운" },
};

function castClientLine(): HexLine {
  return Math.random() > 0.5 ? 1 : 0;
}

/* ── 커스텀 모달 ─────────────────────────────── */
function Modal({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">알림</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export function CastingExperience() {
  const [view, setView] = useState<ViewState>("profile");
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<HexLine[]>([]);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"M" | "F">("M");
  const [profile, setProfile] = useState<{ name: string; element: typeof YEAR_STEM_ELEMENTS[string] } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* 저장된 프로필 복원 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("iching_saju_profile");
      if (saved) {
        const p = JSON.parse(saved);
        setProfile(p);
        setView("intro");
      }
    } catch {
      // ignore
    }
  }, []);

  /* 프로필 저장 */
  function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("profile-name") as HTMLInputElement).value.trim() || "사용자";
    const birthDate = (form.elements.namedItem("profile-date") as HTMLInputElement).value;
    if (!birthDate) { setModalMessage("태어난 생년월일을 정확히 선택해주세요."); return; }
    const lastDigit = new Date(birthDate).getFullYear().toString().slice(-1);
    const elementData = YEAR_STEM_ELEMENTS[lastDigit];
    const profileData = { name, gender: selectedGender, birthDate, element: elementData };
    localStorage.setItem("iching_saju_profile", JSON.stringify(profileData));
    setProfile(profileData);
    setModalMessage(`분석 완료!\n\n${name}님은 [${elementData.name}]의 기운을 강하게 타고나셨습니다.\n이제 주역점과 오행을 결합한 풀이를 시작합니다.`);
    setView("intro");
  }

  /* 점치기 */
  async function submitDivination(finalLines: HexLine[]) {
    const response = await fetch("/api/divination", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lines: finalLines }),
    });
    const payload = (await response.json()) as DivinationResult | { error: string };
    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "점괘 생성 중 오류가 발생했습니다.");
    }
    setResult(payload);
    setView("result");
  }

  function startCasting() {
    if (!question.trim()) { setModalMessage("마음속에 품은 질문을 입력해주세요."); return; }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLines([]);
    setView("casting");
    const currentHexagram: HexLine[] = [];
    for (let i = 0; i < 6; i += 1) {
      const t = setTimeout(() => {
        currentHexagram.push(castClientLine());
        setLines([...currentHexagram]);
      }, 800 * (i + 1));
      timers.current.push(t);
    }
    const finishTimer = setTimeout(() => {
      submitDivination([...currentHexagram]).catch((err: unknown) => {
        setModalMessage(err instanceof Error ? err.message : "점괘 생성 중 오류가 발생했습니다.");
        setView("intro");
      });
    }, 800 * 7);
    timers.current.push(finishTimer);
  }

  function resetToIntro() {
    setQuestion("");
    setLines([]);
    setResult(null);
    setView("intro");
  }

  /* ── 상단 네비게이션 바 ──────────────────────── */
  const showNav = view === "result";
  const Nav = (
    <div className="absolute top-0 w-full flex justify-between items-center p-6 z-50 pointer-events-none">
      {/* 좌측: 홈 버튼 (결과 화면에서만) */}
      <div className="pointer-events-auto">
        {showNav && (
          <button
            type="button"
            onClick={resetToIntro}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-slate-900 text-amber-50 rounded-full flex items-center justify-center text-sm border-2 border-amber-600/30 font-serif">周</div>
          </button>
        )}
      </div>
      {/* 우측: 사주수정 + 뮤트 */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {view !== "profile" && profile && (
          <button
            type="button"
            onClick={() => setView("profile")}
            className="p-2 rounded-full bg-white/50 hover:bg-white text-slate-600 transition-all shadow-sm backdrop-blur-sm border border-white/50"
            title="사주 정보 수정"
          >
            <UserCog className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          className="p-2 rounded-full bg-white/50 hover:bg-white text-slate-600 transition-all shadow-sm backdrop-blur-sm border border-white/50"
          title={isMuted ? "소리 켜기" : "소리 끄기"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  /* ── Profile View ────────────────────────────── */
  if (view === "profile") {
    return (
      <>
        {Nav}
        <Modal message={modalMessage} onClose={() => { setModalMessage(""); }} />
        <section className="w-full animate-fade-in-bottom">
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 w-full border border-slate-100">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">운명(運命)의 기운</h2>
              <p className="text-xs text-slate-500 mt-2">
                정확한 주역 괘 해석을 위해<br />태어난 생년월일과 성별을 알려주세요.
              </p>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">이름 (선택)</label>
                <input
                  type="text"
                  name="profile-name"
                  defaultValue={profile?.name ?? ""}
                  placeholder="홍길동"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">성별</label>
                <div className="flex gap-3">
                  {(["M", "F"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`flex-1 py-3 border rounded-xl text-sm transition-colors ${
                        selectedGender === g
                          ? "bg-amber-100 border-amber-400 text-amber-800 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {g === "M" ? "남성(乾)" : "여성(坤)"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">생년월일</label>
                <input
                  type="date"
                  name="profile-date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
              >
                오행 기운 분석하기
              </button>
            </form>
          </div>
        </section>
      </>
    );
  }

  /* ── Intro View ──────────────────────────────── */
  if (view === "intro") {
    return (
      <>
        {Nav}
        <Modal message={modalMessage} onClose={() => { setModalMessage(""); }} />
        <section className="w-full animate-fade-in-bottom flex flex-col items-center">
          {/* 오행 뱃지 */}
          {profile?.element && (
            <div className={`mb-6 px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 animate-fade-in-bottom ${profile.element.bgClass} ${profile.element.borderClass}`}>
              <span className="text-xs text-slate-500">나의 기운:</span>
              <span className="text-sm">{profile.element.icon}</span>
              <span className={`text-xs font-bold ${profile.element.colorClass}`}>
                {profile.element.name} — {profile.element.desc}
              </span>
            </div>
          )}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 w-full border border-slate-100">
            <label htmlFor="question-input" className="block text-slate-600 text-sm font-medium mb-3 text-center">
              {profile?.name ? `${profile.name}님, 무엇이 궁금하신가요?` : "무엇이 궁금하신가요?"}<br />
              <span className="text-xs text-slate-400 font-normal">질문을 구체적으로 적을수록 답변이 명확해집니다.</span>
            </label>
            <textarea
              id="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none resize-none transition-all text-center text-sm placeholder:text-slate-300"
              placeholder={"예: 이번 프로젝트가 잘 될까요?\n예: 그 사람과 다시 만날 수 있을까요?"}
            />
            <button
              type="button"
              onClick={startCasting}
              className="group w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              <Sparkles className="w-[18px] h-[18px] text-amber-400 group-hover:rotate-12 transition-transform" />
              점치기 시작
            </button>
          </div>
          <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
            주역은 점치는 이의 마음가짐에 감응합니다.<br />진지한 태도로 임해주십시오.
          </p>
        </section>
      </>
    );
  }

  /* ── Casting View ────────────────────────────── */
  if (view === "casting") {
    const castingRows = [];
    for (let j = 5; j >= 0; j -= 1) {
      if (j >= lines.length) {
        castingRows.push(<div key={`empty-${j}`} className="h-4 w-full max-w-[200px] bg-transparent opacity-0" />);
      } else {
        castingRows.push(
          <HexLineView key={`line-${j}-${lines[j]}`} value={lines[j]} animate={j === lines.length - 1} />
        );
      }
    }
    return (
      <>
        {Nav}
        <section className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="mb-8 animate-pulse text-center">
            <h2 className="text-xl font-medium text-slate-700">천지기운(天地氣運)</h2>
            <p className="mt-2 text-sm text-slate-400">우주의 기운과 교감하고 있습니다...</p>
          </div>
          <div className="flex min-h-[250px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white/50 p-8 shadow-inner">
            {castingRows}
          </div>
        </section>
      </>
    );
  }

  /* ── Result View ─────────────────────────────── */
  if (view === "result" && result) {
    const resultLines = [...result.lines].reverse();
    return (
      <>
        {Nav}
        <Modal message={modalMessage} onClose={() => setModalMessage("")} />
        <section className="w-full animate-zoom-in pb-10">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative">
            {/* 헤더: 배경 이미지 + gradient overlay */}
            <div className="relative w-full min-h-[26rem] flex flex-col overflow-hidden bg-slate-900 rounded-t-2xl pb-16">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-slate-900/20" />
              <div className="relative z-10 w-full h-full flex flex-col pt-6 px-6">
                {/* 카테고리 + 랭킹 뱃지 */}
                <div className="w-full flex justify-end mb-6">
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-amber-400/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1">
                      <span>{categoryLabels[result.category]} 기준</span>
                    </div>
                    <div className="bg-slate-800/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm shadow-lg border border-slate-700">
                      전체 64괘 중 <span className="text-amber-400 font-bold text-sm">상위 {result.rank}위</span>
                    </div>
                  </div>
                </div>
                {/* 괘 심볼 + 이름 */}
                <div className="flex-1 flex flex-col items-center justify-center pb-8">
                  <div className="flex flex-col w-[90px] mb-6 gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {resultLines.map((line, idx) => (
                      <HexLineView key={`${line}-${idx}`} value={line} variant="result" />
                    ))}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-md">{result.hexagram.name}</h2>
                  <span className="text-amber-200 font-serif text-2xl drop-shadow-md">{result.hexagram.hanja}</span>
                </div>
              </div>
            </div>

            {/* 본문 */}
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
                onClick={resetToIntro}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <RefreshCcw className="w-4 h-4" />
                새로운 질문하기
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
}
