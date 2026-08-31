import { Component, memo, Suspense, useMemo, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "@/scene/CameraRig";
import VillaModel from "@/scene/VillaModel";
import { MistParticles, RainLines, Waterfall, WaterPlane } from "@/scene/WaterAndMist";
import { CelestialBody, Fireflies, Stars } from "@/scene/AtmosphereFX";
import SceneFallback from "@/scene/SceneFallback";
import type { Atmosphere } from "@/hooks/useGuangzhouWeather";

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

// memo：滚动只改变 progress（CameraRig 内部消化），场景子树在音乐/天气不变时不应重渲染
const SceneObjects = memo(function SceneObjects({ musicActive, atmos }: { musicActive: boolean; atmos: Atmosphere }) {
  const storm = stormLevel(atmos.code);
  const night = atmos.isNight;
  const cloud = (atmos.cloudCover ?? 45) / 100;
  const humidity = (atmos.humidity ?? 78) / 100;
  const temperature = atmos.temperature ?? 24;
  const goldenHour = atmos.phase === "dawn" || atmos.phase === "dusk";

  // 主光沿日月弧线移动：与远景日月圆盘同一轨迹
  const hour = atmos.hour ?? (night ? 22 : 13);
  const arcT = night
    ? THREE.MathUtils.clamp(((hour - 19 + 24) % 24) / 11, 0, 1)
    : THREE.MathUtils.clamp((hour - 6) / 13, 0, 1);
  const arcAngle = Math.PI * (1 - arcT);
  const lightPos: [number, number, number] = [Math.cos(arcAngle) * 7, 2 + Math.sin(arcAngle) * 5.5, -4];

  // 云量调光：遮蔽直射，漫反射略增
  const directDim = 1 - cloud * 0.55;

  const fogColor = useMemo(
    () => new THREE.Color(night ? "#0a1418" : goldenHour ? "#a38d84" : "#8fa9b5"),
    [night, goldenHour]
  );
  const bgColor = useMemo(
    () => new THREE.Color(night ? "#04070a" : goldenHour ? "#120f0e" : "#0a1214"),
    [night, goldenHour]
  );
  // 气温色调：低于 24°C 偏冷蓝，高于则偏暖
  const ambientColor = useMemo(() => {
    const coldness = THREE.MathUtils.clamp((24 - temperature) / 20, -1, 1);
    const base = new THREE.Color(night ? "#5a7a8a" : "#b8d0d8");
    return base.lerp(new THREE.Color(coldness > 0 ? "#8098c4" : "#c4a98c"), Math.abs(coldness) * 0.55);
  }, [night, temperature]);

  // 湿度抬升雾密度：潮湿的空气更"厚"（上限收敛，避免夜景糊成一团）
  const fogDensity = (night ? 0.052 : 0.066) * (0.88 + humidity * 0.28) + storm * 0.01;
  const sunColor = night ? "#aec4de" : goldenHour ? "#ffb37e" : "#fff2df";
  const sunIntensity = (night ? 0.75 : goldenHour ? 1.25 : 1.5) * directDim;

  return (
    <>
      <color attach="background" args={[bgColor.getStyle()]} />
      <fogExp2 attach="fog" args={[fogColor.getStyle(), fogDensity]} />

      {/* 环境底光：随气温与云量变化 */}
      <ambientLight intensity={(night ? 0.26 : 0.36) + cloud * 0.12} color={ambientColor} />
      {/* 天穹半球光 */}
      <hemisphereLight args={[night ? "#4a6575" : goldenHour ? "#d8c0ae" : "#cfe4ea", "#0a0d08", (night ? 0.46 : 0.66) * (0.7 + cloud * 0.4)]} />
      {/* 主光：真实时刻的日光 / 月光 */}
      <directionalLight position={lightPos} intensity={sunIntensity} color={sunColor} />
      {/* 逆光轮廓，强化别墅与岩壁边缘 */}
      <directionalLight position={[5, 3, -4]} intensity={(night ? 0.5 : 0.7) * (0.6 + cloud * 0.5)} color={night ? "#7d9bb5" : "#dce8f0"} />

      {/* 现实联动天体与气象特效 */}
      <CelestialBody atmos={atmos} />
      <Stars atmos={atmos} />

      <Cliff night={night} />
      <Waterfall storm={storm} />
      <WaterPlane active={musicActive} storm={storm} night={night} duskTinted={goldenHour && !night} />
      <Float speed={0.6} rotationIntensity={0.012} floatIntensity={0.04}>
        <VillaModel active={musicActive || night} />
      </Float>
      <MistParticles storm={storm} night={night} windDirection={atmos.windDirection} windSpeed={atmos.windSpeed} />
      <RainLines storm={storm} windDirection={atmos.windDirection} windSpeed={atmos.windSpeed} />
      <Fireflies atmos={atmos} />
    </>
  );
});

// 能力检测只执行一次：每次渲染都 getContext 会制造大量 WebGL 上下文，
// 触发浏览器"Too many active WebGL contexts"并杀掉场景画布（白屏崩溃的根因）
let webglSupported: boolean | null = null;

function canUseWebGL() {
  if (webglSupported === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupported = Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}

export default function WaterfallVillaScene({ scrollProgress, musicActive, weather }: { scrollProgress: number; musicActive: boolean; weather: Atmosphere }) {
  // WebGL 上下文丢失（显存耗尽/驱动重置）会让画布永久变灰：接管事件，先降级再自愈
  const [contextLost, setContextLost] = useState(false);

  if (typeof window !== "undefined" && !canUseWebGL()) return <SceneFallback />;

  return (
    <div className="scene-canvas-wrap">
      {contextLost && <SceneFallback />}
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0.4, 3.1, 9.4], fov: 58 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          dpr={[1, 1.5]}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor(0x04070a, 1);
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              event.preventDefault();
              setContextLost(true);
            });
            gl.domElement.addEventListener("webglcontextrestored", () => {
              setContextLost(false);
            });
          }}
        >
          <Suspense fallback={null}>
            <SceneObjects musicActive={musicActive} atmos={weather} />
            <CameraRig progress={scrollProgress} />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
