import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "@/scene/CameraRig";
import VillaModel from "@/scene/VillaModel";
import { MistParticles, Waterfall, WaterPlane } from "@/scene/WaterAndMist";
import SceneFallback from "@/scene/SceneFallback";

type SceneWeather = {
  label: string;
  code: number;
  temperature: number | null;
  humidity: number | null;
  isNight: boolean;
  hour: number | null;
  timeString: string | null;
};

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <SceneFallback />;
    return this.props.children;
  }
}

function stormLevel(code: number) {
  if ([65, 80, 81, 82, 95].includes(code)) return 1;
  if ([51, 53, 55, 61, 63].includes(code)) return 0.55;
  if ([45, 48].includes(code)) return 0.35;
  return 0.12;
}

// 岩壁：从水面上方延伸到崖顶，形成山体
function Cliff({ night }: { night: boolean }) {
  const rocks = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: number; moss: boolean }[] = [];
    let seed = 21;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    // 底部大块岩体（水面到中层）
    for (let i = 0; i < 6; i += 1) {
      list.push({
        pos: [i * 0.7 - 0.4, -0.3 + rand() * 0.3, -i * 0.2 + rand() * 0.3],
        scale: [1.3 + rand() * 0.8, 4.0 + rand() * 0.5, 1.0 + rand() * 0.5],
        rot: (rand() - 0.5) * 0.35,
        moss: rand() > 0.4,
      });
    }
    // 上层岩体（中层到崖顶）
    for (let i = 0; i < 4; i += 1) {
      list.push({
        pos: [i * 0.6 - 0.2, 2.2 + i * 0.5 + rand() * 0.2, -i * 0.15 - 0.3],
        scale: [1.0 + rand() * 0.6, 1.8 + rand() * 0.4, 0.8 + rand() * 0.3],
        rot: (rand() - 0.5) * 0.3,
        moss: false,
      });
    }
    return list;
  }, []);
  const base = night ? "#0a0d0b" : "#141813";

  return (
    <group position={[-3.1, -1.0, -2.8]} rotation={[0, 0.16, 0]}>
      {rocks.map((rock, i) => (
        <group key={i} position={rock.pos} rotation={[rock.rot * 0.3, rock.rot, rock.rot * 0.2]}>
          <mesh>
            <boxGeometry args={rock.scale} />
            <meshStandardMaterial color={i % 2 ? "#1a201a" : base} roughness={0.96} flatShading />
          </mesh>
          {rock.moss && (
            <mesh position={[0, rock.scale[1] * 0.2, rock.scale[2] * 0.5]}>
              <boxGeometry args={[rock.scale[0] * 0.8, rock.scale[1] * 0.5, 0.02]} />
              <meshStandardMaterial color="#2f3d2b" roughness={0.98} transparent opacity={0.35} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function RainLines({ storm }: { storm: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child) => {
      child.position.y -= delta * (6 + storm * 4);
      if (child.position.y < -2) child.position.y = 4;
    });
  });
  if (storm < 0.5) return null;
  return (
    <group ref={group} position={[0, 1.4, -1.2]} rotation={[0.12, 0, -0.06]}>
      {Array.from({ length: 46 }).map((_, index) => (
        <mesh key={index} position={[-5 + (index % 23) * 0.46, Math.random() * 6 - 2, -2 + (index % 6) * 0.4]}>
          <boxGeometry args={[0.008, 0.6, 0.008]} />
          <meshStandardMaterial color="#cfe6f2" transparent opacity={0.22 + storm * 0.2} emissive="#9bbed0" emissiveIntensity={0.14} />
        </mesh>
      ))}
    </group>
  );
}

function SceneObjects({ musicActive, weather }: { musicActive: boolean; weather: SceneWeather }) {
  const storm = stormLevel(weather.code);
  const night = weather.isNight;
  const fogColor = useMemo(() => new THREE.Color(night ? "#0a1418" : "#8fa9b5"), [night]);
  const bgColor = useMemo(() => new THREE.Color(night ? "#04070a" : "#0a1214"), [night]);

  return (
    <>
      <color attach="background" args={[bgColor.getStyle()]} />
      <fogExp2 attach="fog" args={[fogColor.getStyle(), night ? 0.058 : 0.072]} />

      {/* 环境底光 */}
      <ambientLight intensity={night ? 0.2 : 0.4} color={night ? "#5a7a8a" : "#b8d0d8"} />
      {/* 天穹半球光 */}
      <hemisphereLight args={[night ? "#4a6575" : "#cfe4ea", "#0a0d08", night ? 0.4 : 0.7]} />
      {/* 主光：日间暖阳 / 夜间冷月 */}
      <directionalLight
        position={night ? [-4, 6, -2] : [-3, 5, 3]}
        intensity={night ? 0.7 : 1.4}
        color={night ? "#aec4de" : "#fff2df"}
      />
      {/* 逆光轮廓，强化别墅与岩壁边缘 */}
      <directionalLight position={[5, 3, -4]} intensity={night ? 0.5 : 0.7} color={night ? "#7d9bb5" : "#dCE8f0"} />

      <Cliff night={night} />
      <Waterfall storm={storm} />
      <WaterPlane active={musicActive} storm={storm} />
      <Float speed={0.6} rotationIntensity={0.012} floatIntensity={0.04}>
        <VillaModel active={musicActive || night} />
      </Float>
      <MistParticles storm={storm} night={night} />
      <RainLines storm={storm} />
    </>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export default function WaterfallVillaScene({ scrollProgress, musicActive, weather }: { scrollProgress: number; musicActive: boolean; weather: SceneWeather }) {
  if (typeof window !== "undefined" && !canUseWebGL()) return <SceneFallback />;

  return (
    <div className="scene-canvas-wrap">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0.4, 3.1, 9.4], fov: 58 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          dpr={[1, 1.5]}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor(0x04070a, 1);
          }}
        >
          <Suspense fallback={null}>
            <SceneObjects musicActive={musicActive} weather={weather} />
            <CameraRig progress={scrollProgress} />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
