import { useEffect, useMemo, useState } from "react";

type WeatherState = {
  label: string;
  code: number;
  temperature: number | null;
  humidity: number | null;
  isNight: boolean;
  hour: number | null;
  timeString: string | null;
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

export function useGuangzhouWeather() {
  const [weather, setWeather] = useState<WeatherState>(() => {
    const { hour, timeString } = localGuangzhouTime();
    return { label: "广州时间同步", code: 1, temperature: null, humidity: null, isNight: nightFromHour(hour), hour, timeString };
  });

  useEffect(() => {
    const tick = () => {
      const { hour, timeString } = localGuangzhouTime();
      setWeather((prev) => ({ ...prev, hour, timeString, isNight: nightFromHour(hour) }));
    };
    const timer = setInterval(tick, 30000);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=23.1291&longitude=113.2644&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FShanghai")
      .then((response) => response.json())
      .then((data) => {
        const { hour, timeString } = localGuangzhouTime();
        const code = Number(data.current?.weather_code ?? 1);
        setWeather({
          label: weatherLabels[code] ?? "云层变化",
          code,
          temperature: Number(data.current?.temperature_2m ?? NaN) || null,
          humidity: Number(data.current?.relative_humidity_2m ?? NaN) || null,
          isNight: nightFromHour(hour),
          hour,
          timeString,
        });
      })
      .catch(() => {
        const { hour, timeString } = localGuangzhouTime();
        setWeather({ label: "广州时间同步", code: 1, temperature: null, humidity: null, isNight: nightFromHour(hour), hour, timeString });
      });
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => weather, [weather]);
}
