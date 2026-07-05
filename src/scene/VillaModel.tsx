import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 玻璃材质（共享）
function useGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9cc4d2",
        roughness: 0.05,
        metalness: 0,
        transmission: 0.72,
        thickness: 0.5,
        transparent: true,
        opacity: 0.52,
        envMapIntensity: 0.7,
        ior: 1.34,
      }),
    []
  );
}

// 水平板
function Slab({ y, w, d, x = 0, z = 0, color = "#d4cec0" }: { y: number; w: number; d: number; x?: number; z?: number; color?: string }) {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[w, 0.14, d]} />
      <meshStandardMaterial color={color} roughness={0.74} metalness={0.03} />
    </mesh>
  );
}

// 竖向窗棂
function Mullions({ count, width, height, y, z }: { count: number; width: number; height: number; y: number; z: number }) {
  const step = width / (count - 1);
  return (
    <group position={[0, y, z]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + i * step, 0, 0]}>
          <boxGeometry args={[0.018, height, 0.025]} />
          <meshStandardMaterial color="#0a0c0a" roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function VillaModel({ active }: { active: boolean }) {
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);
  const glow2Ref = useRef<THREE.MeshStandardMaterial>(null);
  const interiorLight = useRef<THREE.PointLight>(null);
  const glassMat = useGlassMaterial();

  useFrame(({ clock }) => {
    const flicker = 0.88 + Math.sin(clock.elapsedTime * 2.1) * 0.05 + Math.sin(clock.elapsedTime * 4.7) * 0.03;
    const base = active ? 2.2 : 1.2;
    if (glowRef.current) glowRef.current.emissiveIntensity = base * flicker;
    if (glow2Ref.current) glow2Ref.current.emissiveIntensity = base * 0.7 * flicker;
    if (interiorLight.current) interiorLight.current.intensity = (active ? 3.8 : 2.4) * flicker;
  });

  return (
    <group position={[1.9, -0.45, -1.1]} rotation={[0, -0.32, 0]}>
      {/* ── 基座平台 ── */}
      <Slab y={-0.08} w={4.2} d={2.6} x={0.1} z={0.15} color="#3a3a32" />

      {/* ── 石砌锚墙（锚入岩壁一侧） ── */}
      <mesh position={[-1.6, 0.55, -0.3]}>
        <boxGeometry args={[0.8, 2.2, 2.0]} />
        <meshStandardMaterial color="#4a483f" roughness={0.92} />
      </mesh>
      {/* 石砌墙面纹理 */}
      <mesh position={[-1.18, 0.55, 0.72]}>
        <boxGeometry args={[0.04, 2.1, 1.8]} />
        <meshStandardMaterial color="#3a3830" roughness={0.95} transparent opacity={0.6} />
      </mesh>

      {/* ── 一层 ── */}
      {/* 楼板 */}
      <Slab y={0} w={3.6} d={2.0} x={0.3} z={0.1} color="#d4cec0" />
      {/* 玻璃体量 */}
      <mesh position={[0.3, 0.48, 0.1]}>
        <boxGeometry args={[2.6, 0.82, 1.5]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <Mullions count={8} width={2.6} height={0.82} y={0.48} z={0.87} />
      {/* 室内暖光墙 */}
      <mesh position={[0.5, 0.48, -0.2]}>
        <boxGeometry args={[1.4, 0.6, 0.08]} />
        <meshStandardMaterial ref={glowRef} color="#f0c98a" emissive="#e8b26a" emissiveIntensity={1.3} toneMapped={false} />
      </mesh>

      {/* ── 二层 ── */}
      {/* 楼板（错位挑出） */}
      <Slab y={1.0} w={3.2} d={1.8} x={-0.1} z={-0.05} color="#cec8ba" />
      {/* 玻璃体量 */}
      <mesh position={[-0.1, 1.42, 0.0]}>
        <boxGeometry args={[2.2, 0.62, 1.35]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <Mullions count={7} width={2.2} height={0.62} y={1.42} z={0.68} />
      {/* 二层暖光 */}
      <mesh position={[0.2, 1.42, -0.15]}>
        <boxGeometry args={[1.0, 0.42, 0.06]} />
        <meshStandardMaterial ref={glow2Ref} color="#f0c98a" emissive="#e8b26a" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* ── 屋顶 ── */}
      <Slab y={1.78} w={2.6} d={1.6} x={0.15} z={0.02} color="#2a2a22" />

      {/* ── 纤细钢柱 ── */}
      {[
        [1.5, -0.8],
        [1.5, 0.85],
        [-0.9, 0.9],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, -0.55, pz]}>
          <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
          <meshStandardMaterial color="#0e100e" roughness={0.3} metalness={0.75} />
        </mesh>
      ))}

      {/* ── 挑台 ── */}
      <mesh position={[0.9, 0.08, 0.95]}>
        <boxGeometry args={[1.8, 0.025, 0.06]} />
        <meshStandardMaterial color="#8a6a3f" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* ── 室内点光源 ── */}
      <pointLight ref={interiorLight} position={[0.5, 0.55, 0.2]} color="#f0c07a" intensity={2.4} distance={5.5} decay={2} />
    </group>
  );
}
