import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SceneFallback from "@/scene/SceneFallback";
import { cameraState } from "@/scene/cameraState";

type SceneWeather = {
  label: string;
  code: number;
  temperature: number | null;
  humidity: number | null;
  isNight: boolean;
  hour: number | null;
  timeString: string | null;
};

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

// 继承 Villa 页退出时的镜头状态
function InheritCamera() {
  const { camera } = useThree();
  const init = useMemo(() => {
    if (cameraState.active) {
      return {
        pos: cameraState.position.clone(),
        look: cameraState.lookAt.clone(),
        fov: cameraState.fov,
      };
    }
    return {
      pos: new THREE.Vector3(0.6, 2.6, 8.0),
      look: new THREE.Vector3(-0.8, 0.8, -2.0),
      fov: 60,
    };
  }, []);

  useMemo(() => {
    camera.position.copy(init.pos);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = init.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(init.look);
  }, [init, camera]);

  return null;
}

function StaticScene({ weather }: { weather: SceneWeather }) {
  const night = weather.isNight;
  const fogColor = useMemo(() => new THREE.Color(night ? "#0a1418" : "#8fa9b5"), [night]);

  return (
    <>
      <fogExp2 attach="fog" args={[fogColor.getStyle(), night ? 0.072 : 0.085]} />
      <ambientLight intensity={night ? 0.16 : 0.32} color={night ? "#5a7a8a" : "#b8d0d8"} />
      <hemisphereLight args={[night ? "#4a6575" : "#cfe4ea", "#0a0d08", night ? 0.3 : 0.5]} />
      <directionalLight position={[-3, 5, 3]} intensity={night ? 0.4 : 0.9} color={night ? "#aec4de" : "#fff2df"} />

      {/* 远景岩壁轮廓 */}
      <group position={[-3.1, -0.7, -3.5]} rotation={[0, 0.16, 0]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[i * 0.72 - 0.3, i * 0.1 - 0.4, -i * 0.16]}>
            <boxGeometry args={[1.2 + (i % 3) * 0.3, 3.6 - i * 0.16, 0.9]} />
            <meshStandardMaterial color={i % 2 ? "#1a201a" : "#12161a"} roughness={0.96} flatShading />
          </mesh>
        ))}
      </group>

      {/* 远景别墅微光 */}
      <mesh position={[1.7, 0.2, -2.5]}>
        <boxGeometry args={[2.8, 0.9, 1.4]} />
        <meshStandardMaterial color="#1a1a16" roughness={0.8} emissive="#e8b26a" emissiveIntensity={night ? 0.18 : 0.06} />
      </mesh>
      <pointLight position={[1.7, 0.4, -2.2]} color="#f0c07a" intensity={night ? 1.2 : 0.5} distance={6} decay={2} />

      {/* 水面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.12, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#0b1518" roughness={0.1} metalness={0.4} transparent opacity={0.82} emissive="#12333a" emissiveIntensity={0.05} />
      </mesh>

      {/* 雾粒子 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={120}
            array={(() => {
              const arr = new Float32Array(120 * 3);
              for (let i = 0; i < 120; i += 1) {
                arr[i * 3] = -6 + Math.random() * 12;
                arr[i * 3 + 1] = -1 + Math.random() * 4;
                arr[i * 3 + 2] = -4.6 + Math.random() * 6;
              }
              return arr;
            })()}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={night ? "#8fb0c2" : "#c7d9dc"} size={0.04} transparent opacity={0.26} depthWrite={false} sizeAttenuation />
      </points>
    </>
  );
}

export default function SceneBackground({ weather }: { weather: SceneWeather }) {
  if (typeof window !== "undefined" && !canUseWebGL()) return <SceneFallback />;

  return (
    <div className="scene-canvas-wrap scene-bg-degraded">
      <Canvas
        camera={{ position: [0.6, 2.6, 8.0], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        dpr={[1, 1]}
        frameloop="demand"
      >
        <InheritCamera />
        <StaticScene weather={weather} />
      </Canvas>
    </div>
  );
}
