import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 瀑布：水从崖顶溢出，沿岩壁流下到水潭
export function Waterfall({ storm = 0 }: { storm?: number }) {
  const sheets = useRef<THREE.Group>(null);
  const veil = useRef<THREE.Mesh>(null);
  const layers = useMemo(
    () => [
      { w: 0.92, speed: 1.0, opacity: 0.75, z: 0, color: "#eef6f3" },
      { w: 0.66, speed: 1.5, opacity: 0.52, z: 0.08, color: "#dff0f2" },
      { w: 0.44, speed: 2.2, opacity: 0.38, z: 0.16, color: "#ffffff" },
    ],
    []
  );
  const uv = useRef<THREE.Vector2[]>(layers.map(() => new THREE.Vector2(0, 0)));

  useFrame(({ clock }, delta) => {
    if (sheets.current) {
      sheets.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.map) {
          uv.current[i].y += delta * layers[i].speed * (1 + storm * 0.6);
          mat.map.offset.copy(uv.current[i]);
        }
      });
    }
    if (veil.current) {
      const mat = veil.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.16 + Math.sin(clock.elapsedTime * 6) * 0.03 + storm * 0.16;
    }
  });

  // 程序化条纹贴图
  const streakTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 256);
    for (let i = 0; i < 42; i += 1) {
      const x = Math.random() * 64;
      const alpha = 0.15 + Math.random() * 0.5;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, 256);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
  }, []);

  // 瀑布从崖顶 y=3.2 流下到水潭 y=-1.1，总高度 4.3
  const topY = 3.2;
  const fallHeight = 4.3;

  return (
    <group position={[-4.0, 0, -2.6]}>
      {/* 三层水幕，从崖顶垂落到水潭 */}
      <group ref={sheets} position={[0, topY - fallHeight / 2, 0]}>
        {layers.map((layer, i) => (
          <mesh key={i} position={[0, 0, layer.z]}>
            <planeGeometry args={[layer.w, fallHeight]} />
            <meshStandardMaterial
              color={layer.color}
              map={streakTexture.clone()}
              transparent
              opacity={layer.opacity}
              roughness={0.2}
              emissive="#9bbed0"
              emissiveIntensity={0.14 + storm * 0.12}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* 崖顶溢流口：水从岩缝中涌出 */}
      <mesh position={[0, topY + 0.1, 0.1]}>
        <boxGeometry args={[1.2, 0.12, 0.4]} />
        <meshStandardMaterial color="#2a2a23" roughness={0.96} />
      </mesh>
      {/* 崖顶岩石边缘 */}
      <mesh position={[-0.6, topY + 0.2, -0.2]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#1e1e18" roughness={0.96} />
      </mesh>
      <mesh position={[0.7, topY + 0.15, -0.15]}>
        <boxGeometry args={[0.6, 0.35, 0.7]} />
        <meshStandardMaterial color="#222220" roughness={0.96} />
      </mesh>

      {/* 落水雾幕 */}
      <mesh ref={veil} position={[0.15, topY - fallHeight - 0.3, 0.18]}>
        <planeGeometry args={[1.6, 2.2, 8, 12]} />
        <meshStandardMaterial color="#e6f4f1" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* 撞击水潭 */}
      <mesh position={[0, -1.15, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8 + storm * 0.3, 48]} />
        <meshStandardMaterial color="#cfe4e1" transparent opacity={0.3 + storm * 0.08} roughness={0.3} />
      </mesh>

      <Splash storm={storm} topY={topY - fallHeight} />
    </group>
  );
}

// 撞击点上扬的水花粒子
function Splash({ storm, topY }: { storm: number; topY: number }) {
  const points = useRef<THREE.Points>(null);
  const count = 90;
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = topY + Math.random() * 0.6;
      positions[i * 3 + 2] = 0.3 + (Math.random() - 0.5) * 0.8;
      velocities[i] = 0.4 + Math.random() * 1.1;
      seeds[i] = Math.random();
    }
    return { positions, velocities, seeds };
  }, [topY]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i += 1) {
      const t = (clock.elapsedTime * data.velocities[i] * (0.6 + storm * 0.6) + data.seeds[i] * 6) % 2;
      arr[i * 3 + 1] = topY + t * (0.8 + storm * 0.5);
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={data.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#eef6f3" size={0.05 + storm * 0.02} transparent opacity={0.5 + storm * 0.2} depthWrite={false} />
    </points>
  );
}

// 动态水面：波动顶点 + 高反射
export function WaterPlane({ active, storm = 0 }: { active: boolean; storm?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(15, 11, 48, 48), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      pos[i + 2] =
        Math.sin(x * 0.6 + t * (1.1 + storm)) * (0.05 + storm * 0.04) +
        Math.cos(y * 0.8 + t * 0.7) * (0.04 + storm * 0.03);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.12, 0]}>
      <meshStandardMaterial
        color="#0b1518"
        roughness={0.08}
        metalness={0.5}
        transparent
        opacity={0.86}
        emissive="#12333a"
        emissiveIntensity={active ? 0.14 : 0.06}
      />
    </mesh>
  );
}

// 体积雾粒子：分层飘动
export function MistParticles({ storm = 0, night = false }: { storm?: number; night?: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 320;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = -6 + Math.random() * 12;
      values[i * 3 + 1] = -1 + Math.random() * 4.4;
      values[i * 3 + 2] = -4.6 + Math.random() * 7;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = Math.sin(clock.elapsedTime * 0.06) * (0.1 + storm * 0.05);
      points.current.position.x = Math.sin(clock.elapsedTime * 0.14) * 0.12;
      points.current.position.y = Math.sin(clock.elapsedTime * 0.1) * 0.06;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={night ? "#8fb0c2" : "#c7d9dc"}
        size={0.05 + storm * 0.018}
        transparent
        opacity={0.34 + storm * 0.12}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
