import { useEffect, useMemo, useState } from "react";

export type Phase = "dawn" | "day" | "dusk" | "night";

// 场景与 UI 共享的"现实大气"状态：天气 + 时间 + 派生联动参数
export type Atmosphere = {
  label: string;
  code: number;
  temperature: number | null;
  humidity: number | null;
  cloudCover: number | null; // 0-100
  windSpeed: number | null; // km/h
  windDirection: number | null; // 风的来向（度）
  isNight: boolean;
  isDaylight: boolean;
  hour: number | null;
  timeString: string | null;
  phase: Phase;
};

const weatherLabels: Record<number, string> = {
  0: "晴朗",
  1: "多云",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾",
  51: "细雨",
  53: "小雨",
  55: "雨",
  61: "小雨",
  63: "雨",
  65: "强降雨",
  80: "阵雨",
  81: "阵雨",
  82: "暴雨",
  95: "雷雨",
};

function localGuangzhouTime(): { hour: number | null; timeString: string | null } {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "";
    const minStr = parts.find((p) => p.type === "minute")?.value ?? "";
    const hour = parseInt(hourStr, 10);
    return {
      hour: Number.isFinite(hour) ? hour : null,
      timeString: hourStr && minStr ? `${hourStr}:${minStr}` : null,
    };
  } catch {
    return { hour: null, timeString: null };
  }
}

function nightFromHour(hour: number | null): boolean {
  if (hour === null) {
    const utcHour = new Date().getUTCHours() + 8;
    const adjusted = utcHour >= 24 ? utcHour - 24 : utcHour;
    return adjusted < 6 || adjusted >= 19;
  }
  return hour < 6 || hour >= 19;
}

// 一天中的相位：黎明 5-7 / 白昼 7-17 / 黄昏 17-19 / 夜晚其余
function phaseFromHour(hour: number | null): Phase {
  const h = hour ?? new Date().getUTCHours() + 8;
  const adjusted = h >= 24 ? h - 24 : h;
  if (adjusted < 5) return "night";
  if (adjusted < 7) return "dawn";
  if (adjusted < 17) return "day";
  if (adjusted < 19) return "dusk";
  return "night";
}

function makeState(data?: {
  label: string;
  code: number;
  temperature: number | null;
  humidity: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windDirection: number | null;
}): Atmosphere {
  const { hour, timeString } = localGuangzhouTime();
  return {
    label: data?.label ?? "广州时间同步",
    code: data?.code ?? 1,
    temperature: data?.temperature ?? null,
    humidity: data?.humidity ?? null,
    cloudCover: data?.cloudCover ?? null,
    windSpeed: data?.windSpeed ?? null,
    windDirection: data?.windDirection ?? null,
    isNight: nightFromHour(hour),
    isDaylight: !nightFromHour(hour),
    hour,
    timeString,
    phase: phaseFromHour(hour),
  };
}

export function useGuangzhouWeather(): Atmosphere {
  const [weather, setWeather] = useState<Atmosphere>(() => makeState());

  useEffect(() => {
    const tick = () => {
      setWeather((prev) => {
        const next = makeState(prev);
        if (prev.timeString === next.timeString && prev.phase === next.phase && prev.isNight === next.isNight) return prev;
        return next;
      });
    };
    const timer = setInterval(tick, 30000);
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=23.1291&longitude=113.2644&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,is_day&timezone=Asia%2FShanghai"
    )
      .then((response) => response.json())
      .then((data) => {
        const current = data.current ?? {};
        const code = Number(current.weather_code ?? 1);
        const num = (value: unknown): number | null => {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        };
        setWeather(
          makeState({
            label: weatherLabels[code] ?? "云层变化",
            code,
            temperature: num(current.temperature_2m),
            humidity: num(current.relative_humidity_2m),
            cloudCover: num(current.cloud_cover),
            windSpeed: num(current.wind_speed_10m),
            windDirection: num(current.wind_direction_10m),
          })
        );
      })
      .catch(() => undefined);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => weather, [weather]);
}
