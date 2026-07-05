import * as THREE from "three";

// 模块级单例：Villa页镜头每帧写入，子页面背景读取初始值
export const cameraState = {
  position: new THREE.Vector3(0.4, 3.1, 9.4),
  lookAt: new THREE.Vector3(-1.2, 1.0, -2.2),
  fov: 58,
  active: false,
};
