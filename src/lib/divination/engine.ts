import { randomInt } from "crypto";
import type { HexagramCode, HexLine } from "./types";

export function castHexagramLines(): HexLine[] {
  return Array.from({ length: 6 }, () => randomInt(0, 2) as HexLine);
}

export function linesToCode(lines: HexLine[]): HexagramCode {
  if (lines.length !== 6) {
    throw new Error("A hexagram must contain exactly six lines.");
  }

  return lines.join("") as HexagramCode;
}

export function getUpperTrigram(code: HexagramCode): string {
  return code.slice(3, 6);
}

export function getLowerTrigram(code: HexagramCode): string {
  return code.slice(0, 3);
}

export function calculateRank(score: number): number {
  return Math.floor(64 - ((score / 100) * 63));
}
