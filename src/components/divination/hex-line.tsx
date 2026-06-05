import type { HexLine } from "@/lib/divination/types";

type HexLineProps = {
  value: HexLine;
  animate?: boolean;
  variant?: "casting" | "result";
};

export function HexLineView({ value, animate = false, variant = "casting" }: HexLineProps) {
  const heightClass = variant === "casting" ? "h-4" : "h-3";
  const colorClass = variant === "casting" ? "bg-amber-600/90" : "bg-white/90";
  const brokenColorClass = variant === "casting" ? "bg-slate-700/90" : "bg-white/90";
  const radiusClass = variant === "casting" ? "rounded-sm" : "rounded-[2px]";

  if (value === 1) {
    return (
      <div
        className={`flex w-full max-w-[200px] items-center justify-between ${heightClass} ${
          animate ? "hex-line-init hex-line-enter" : ""
        }`}
      >
        <div className={`h-full w-full ${colorClass} ${radiusClass} shadow-sm backdrop-blur-sm`} />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full max-w-[200px] items-center justify-between ${heightClass} ${
        animate ? "hex-line-init hex-line-enter" : ""
      }`}
    >
      <div className={`h-full w-[45%] ${brokenColorClass} ${radiusClass} shadow-sm backdrop-blur-sm`} />
      <div className={`h-full w-[45%] ${brokenColorClass} ${radiusClass} shadow-sm backdrop-blur-sm`} />
    </div>
  );
}
