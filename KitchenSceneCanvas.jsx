import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender } from "remotion";
import * as THREE from "three";
import { setupPostProcessing } from "./postprocessing.js";
import { createKitchenScene } from "./sceneSetup.js";
const KitchenSceneCanvas = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeCameraRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Loading HDR Environment"));
  const frame = useCurrentFrame();
  const { durationInFrames, width, height, fps } = useVideoConfig();
  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;
    const canvas = document.createElement("canvas");
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.position.set(0, 1.5, -2);
    const { scene, camera, waterSystem, faucetTip, glassMesh, outdoorMesh, materials } = createKitchenScene(width, height, cubeRenderTarget);
    scene.add(cubeCamera);
    const { composer } = setupPostProcessing(renderer, scene, camera, width, height);
    composerRef.current = composer;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new THREE.TextureLoader().load("kitchen_hdr.png", (texture) => {
      if (!rendererRef.current) {
        pmremGenerator.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      try {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        if (outdoorMesh.material) {
          outdoorMesh.material.map = texture;
          outdoorMesh.material.needsUpdate = true;
        }
        glassMesh.visible = false;
        cubeCamera.update(renderer, scene);
        glassMesh.visible = true;
      } catch (e) {
        console.warn("PMREM generation failed", e);
      } finally {
        pmremGenerator.dispose();
        continueRender(handle);
      }
    });
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    scene.userData = { waterSystem, faucetTip, glassMesh, outdoorMesh };
    setReady(true);
    return () => {
      cubeRenderTarget.dispose();
      composer.dispose();
      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [width, height]);
  useEffect(() => {
    if (!ready || !rendererRef.current || !sceneRef.current || !cameraRef.current || !composerRef.current) {
      return;
    }
    const renderer = rendererRef.current;
    const composer = composerRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const t = durationInFrames > 0 ? frame / durationInFrames : 0;
    const smoothT = interpolate(t, [0, 1], [0, 1], {
      easing: Easing.bezier(0.45, 0, 0.55, 1)
    });
    const x = interpolate(smoothT, [0, 0.4, 1], [3, 1.5, -1.8]);
    const y = interpolate(smoothT, [0, 0.2, 1], [1.5, 3.5, 3]);
    const z = interpolate(smoothT, [0, 0.3, 1], [5.5, 7, 9]);
    const lookX = 0;
    const lookY = interpolate(smoothT, [0, 1], [-0.35, -0.05]);
    const lookZ = 0;
    const shake = Math.sin(frame * 0.05) * 2e-3;
    camera.position.set(x, y + shake, z);
    camera.lookAt(lookX, lookY, lookZ);
    const { waterSystem, faucetTip, glassMesh } = scene.userData;
    if (waterSystem && faucetTip) {
      waterSystem.update(frame, fps, faucetTip);
    }
    composer.render();
  }, [frame, durationInFrames, ready]);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: containerRef,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 167,
      columnNumber: 5
    }
  );
};
export {
  KitchenSceneCanvas
};
