import { useEffect } from "react";
import type { Phase } from "@/hooks/useGuangzhouWeather";

// 将现实时段写到 <html data-phase>，供全局 CSS 做色调联动
export function useDocumentPhase(phase: Phase) {
  useEffect(() => {
    document.documentElement.dataset.phase = phase;
    return () => {
      delete document.documentElement.dataset.phase;
    };
  }, [phase]);
}
