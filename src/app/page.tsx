import { CastingExperience } from "@/components/divination/casting-experience";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-10">
      <header className="mb-8 text-center animate-fade-in-top">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-600/30 bg-slate-900 text-3xl font-semibold text-amber-50 shadow-xl">
          易
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-950">주역 AI 상담</h1>
        <p className="text-sm tracking-widest text-slate-500">괘를 짓고 흐름을 읽습니다</p>
      </header>

      <CastingExperience />
    </main>
  );
}
