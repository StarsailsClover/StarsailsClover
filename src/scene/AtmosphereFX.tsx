import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Atmosphere } from "@/hooks/useGuangzhouWeather";

// 软发光贴图：径向渐变，供日月光晕复用
function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const radial = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  radial.addColorStop(0, "rgba(255,255,255,1)");
  radial.addColorStop(0.3, "rgba(255,255,255,0.55)");
  radial.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

// 日月弧线位置：6-19 时为日，19-次日 6 时为月
function celestialPosition(hour: number | null, night: boolean): [number, number, number] {
  const h = hour ?? (night ? 22 : 13);
  const t = night
    ? THREE.MathUtils.clamp(((h - 19 + 24) % 24) / 11, 0, 1)
    : THREE.MathUtils.clamp((h - 6) / 13, 0, 1);
  const angle = Math.PI * (1 - t);
  return [Math.cos(angle) * 30, 2 + Math.sin(angle) * 20, -46];
}

function phaseTint(atmos: Atmosphere): string {
  if (atmos.phase === "dawn") return "#ffc98a";
  if (atmos.phase === "dusk") return "#ff9d6e";
  if (atmos.isNight) return "#dfe9f5";
  return "#fff3d6";
}

// 太阳 / 月亮：远景发光圆盘 + 光晕
export function CelestialBody({ atmos }: { atmos: Atmosphere }) {
  const glow = useMemo(() => makeGlowTexture(), []);
  const showSun = !atmos.isNight;
  const showMoon = atmos.isNight;
  const cloud = (atmos.cloudCover ?? 45) / 100;
  const tint = phaseTint(atmos);

  if (!showSun && !showMoon) return null;

  const pos = celestialPosition(atmos.hour, atmos.isNight);
  const discOpacity = Math.max(0, (showSun ? 0.95 : 0.85) - cloud * 0.75);
  if (discOpacity <= 0.02) return null;

  const size = showMoon ? 2.4 : 4.2;

  return (
    <group position={pos}>
      <sprite scale={[size * 3.8, size * 3.8, 1]}>
        <spriteMaterial map={glow} color={tint} transparent opacity={discOpacity * 0.32} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
      </sprite>
      <mesh>
        <circleGeometry args={[size, 40]} />
        <meshBasicMaterial color={tint} transparent opacity={discOpacity} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}

// 夜空星幕：云量越高越稀薄
export function Stars({ atmos }: { atmos: Atmosphere }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 150;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 34 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const y = 6 + Math.random() * 24;
      values[i * 3] = Math.cos(theta) * radius * 0.7;
      values[i * 3 + 1] = y;
      values[i * 3 + 2] = -20 - Math.random() * 24;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + Math.sin(clock.elapsedTime * 0.7) * 0.16;
  });

  const cloud = (atmos.cloudCover ?? 40) / 100;
  const visibility = atmos.isNight ? Math.max(0, 1 - cloud * 1.35) : 0;
  if (visibility <= 0.03) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#cfe0f0" size={0.28} transparent opacity={visibility * 0.8} depthWrite={false} fog={false} />
    </points>
  );
}

// 夜间萤火：暖色光点在水面与别墅间游移（暴雨时躲雨消失）
export function Fireflies({ atmos }: { atmos: Atmosphere }) {
  const points = useRef<THREE.Points>(null);
  const count = 14;
  const data = useMemo(() => {
    const base = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      base[i * 3] = -2.5 + Math.random() * 6;
      base[i * 3 + 1] = -0.85 + Math.random() * 1.5;
      base[i * 3 + 2] = -2.6 + Math.random() * 3;
      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.3 + Math.random() * 0.8;
    }
    return { base, seeds };
  }, []);
  const arr = useMemo(() => Float32Array.from(data.base), [data]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const seed = data.seeds[i * 2];
      const speed = data.seeds[i * 2 + 1];
      arr[i * 3] = data.base[i * 3] + Math.sin(t * speed + seed) * 0.5;
      arr[i * 3 + 1] = data.base[i * 3 + 1] + Math.sin(t * speed * 1.7 + seed * 2) * 0.18;
      arr[i * 3 + 2] = data.base[i * 3 + 2] + Math.cos(t * speed * 0.6 + seed) * 0.3;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.55 + Math.sin(t * 1.4) * 0.25;
  });

  const visible = atmos.isNight && (atmos.cloudCover ?? 60) < 88 && atmos.code !== 82 && atmos.code !== 95;
  if (!visible) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffd27a" size={0.075} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
    </points>
  );
}
