import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraState } from "@/scene/cameraState";

// 关键机位：远景俯瞰 → 沿峡谷推近 → 掠过瀑布 → 抵达别墅悬挑 → 拉回全景收束
const cameraKeys = [
  new THREE.Vector3(0.4, 3.1, 9.4),
  new THREE.Vector3(-3.4, 2.1, 6.2),
  new THREE.Vector3(-4.6, 1.15, 2.4),
  new THREE.Vector3(-1.2, 0.9, 1.1),
  new THREE.Vector3(1.8, 1.3, 3.2),
  new THREE.Vector3(0.6, 2.6, 8.0),
];
const lookKeys = [
  new THREE.Vector3(-1.2, 1.0, -2.2),
  new THREE.Vector3(-3.6, 0.8, -2.6),
  new THREE.Vector3(-4.1, 0.4, -2.4),
  new THREE.Vector3(-1.4, 0.5, -1.6),
  new THREE.Vector3(1.2, 0.6, -1.8),
  new THREE.Vector3(-0.8, 0.8, -2.0),
];
const fovKeys = [58, 54, 50, 46, 52, 60];

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function sampleFov(t: number) {
  const scaled = t * (fovKeys.length - 1);
  const i = Math.min(fovKeys.length - 2, Math.floor(scaled));
  return THREE.MathUtils.lerp(fovKeys[i], fovKeys[i + 1], scaled - i);
}

export default function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();
  const cameraCurve = useMemo(() => new THREE.CatmullRomCurve3(cameraKeys, false, "catmullrom", 0.4), []);
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(lookKeys, false, "catmullrom", 0.4), []);
  const smoothed = useRef(0);
  const lookAt = useRef(new THREE.Vector3(-1.2, 1.0, -2.2));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    // 平滑滚动值，避免快速滚动时镜头抖动/跳变
    smoothed.current = THREE.MathUtils.damp(smoothed.current, progress, 4.2, delta);
    const t = easeInOutSine(THREE.MathUtils.clamp(smoothed.current, 0, 1));

    cameraCurve.getPointAt(t, tmpPos.current);
    lookCurve.getPointAt(t, tmpLook.current);

    // 呼吸式浮动，给静止画面注入生命感
    const breathe = clock.elapsedTime;
    tmpPos.current.x += Math.sin(breathe * 0.28) * 0.06;
    tmpPos.current.y += Math.sin(breathe * 0.34) * 0.04;

    camera.position.lerp(tmpPos.current, 1 - Math.pow(0.001, delta));
    lookAt.current.lerp(tmpLook.current, 1 - Math.pow(0.0015, delta));
    camera.lookAt(lookAt.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = sampleFov(t);
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 3.5, delta);
      camera.updateProjectionMatrix();
    }

    // 写入共享状态，供子页面背景继承
    cameraState.position.copy(camera.position);
    cameraState.lookAt.copy(lookAt.current);
    if (camera instanceof THREE.PerspectiveCamera) cameraState.fov = camera.fov;
    cameraState.active = true;
  });

  return null;
}
