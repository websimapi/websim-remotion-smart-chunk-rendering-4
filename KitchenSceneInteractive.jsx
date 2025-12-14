import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from "three/addons/webxr/XRHandModelFactory.js";
import { setupPostProcessing } from "./postprocessing.js";
import { createKitchenScene } from "./sceneSetup.js";
const KitchenSceneInteractive = ({ showHelpers }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const helpersRef = useRef([]);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false });
  const cameraRotation = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = document.createElement("canvas");
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      logarithmicDepthBuffer: true
      // Essential for VR to prevent Z-fighting on walls
    });
    renderer.xr.enabled = true;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const sessionInit = { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking", "layers"] };
    const vrButton = VRButton.createButton(renderer, sessionInit);
    vrButton.style.zIndex = "10000";
    document.body.appendChild(vrButton);
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.position.set(0, 1.5, -2);
    const { scene, camera, waterSystem, faucetTip, glassMesh, outdoorMesh } = createKitchenScene(w, h, cubeRenderTarget);
    scene.add(cubeCamera);
    const dolly = new THREE.Group();
    scene.add(dolly);
    dolly.add(camera);
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const music = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/api%20-%20Sink%20Battle%20-%20Sonauto.ogg", (buffer) => {
      music.setBuffer(buffer);
      music.setLoop(true);
      music.setVolume(0.5);
      if (music.context.state === "running") {
        music.play();
      } else {
        const resume = () => {
          music.context.resume().then(() => {
            if (!music.isPlaying) music.play();
          });
          window.removeEventListener("click", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
      }
    });
    const SCENE_UNIT_SCALE = 3.28;
    renderer.xr.addEventListener("sessionstart", () => {
      dolly.scale.set(SCENE_UNIT_SCALE, SCENE_UNIT_SCALE, SCENE_UNIT_SCALE);
      dolly.position.set(0, -3.5, 6);
      dolly.rotation.set(0, Math.PI, 0);
      if (music.context.state === "suspended") music.context.resume();
      if (!music.isPlaying) music.play();
    });
    renderer.xr.addEventListener("sessionend", () => {
      dolly.scale.set(1, 1, 1);
      dolly.position.set(0, 0, 0);
      dolly.rotation.set(0, 0, 0);
      camera.position.set(3, 2, 6);
      camera.lookAt(0, 0, 0);
      cameraRotation.current.setFromQuaternion(camera.quaternion, "YXZ");
      music.pause();
    });
    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    const onSelectStart = (event) => {
      const controller = event.target;
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const intersections = raycaster.intersectObjects(scene.children, true);
      const interactable = intersections.find((hit) => hit.object.userData.interactable);
      if (interactable) {
        const object = interactable.object;
        object.material.emissive.b = 0.5;
        controller.attach(object);
        controller.userData.selected = object;
      }
    };
    const onSelectEnd = (event) => {
      const controller = event.target;
      if (controller.userData.selected) {
        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        scene.attach(object);
        controller.userData.selected = void 0;
      }
    };
    controller1.addEventListener("selectstart", onSelectStart);
    controller1.addEventListener("selectend", onSelectEnd);
    controller2.addEventListener("selectstart", onSelectStart);
    controller2.addEventListener("selectend", onSelectEnd);
    dolly.add(controller1);
    dolly.add(controller2);
    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();
    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    dolly.add(controllerGrip1);
    const hand1 = renderer.xr.getHand(0);
    hand1.add(handModelFactory.createHandModel(hand1, "mesh"));
    dolly.add(hand1);
    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    dolly.add(controllerGrip2);
    const hand2 = renderer.xr.getHand(1);
    hand2.add(handModelFactory.createHandModel(hand2, "mesh"));
    dolly.add(hand2);
    const workingVec3 = new THREE.Vector3();
    const sun = scene.children.find((c) => c.isDirectionalLight);
    if (sun) {
      const lightHelper = new THREE.DirectionalLightHelper(sun, 2, 16776960);
      const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
      lightHelper.visible = false;
      shadowHelper.visible = false;
      scene.add(lightHelper);
      scene.add(shadowHelper);
      helpersRef.current = [lightHelper, shadowHelper];
    }
    const { composer, ssaoPass } = setupPostProcessing(renderer, scene, camera, w, h);
    composerRef.current = composer;
    camera.position.set(3, 2, 6);
    camera.lookAt(0, 0, 0);
    cameraRotation.current.setFromQuaternion(camera.quaternion);
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
      }
    });
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    const onKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "Space":
          keys.current.space = true;
          break;
        case "ShiftLeft":
          keys.current.shift = true;
          break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
        case "ShiftLeft":
          keys.current.shift = false;
          break;
      }
    };
    const onMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        const sensitivity = 2e-3;
        cameraRotation.current.y -= e.movementX * sensitivity;
        cameraRotation.current.x -= e.movementY * sensitivity;
        cameraRotation.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, cameraRotation.current.x));
        camera.quaternion.setFromEuler(cameraRotation.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    const onClick = () => canvas.requestPointerLock();
    canvas.addEventListener("click", onClick);
    const onResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      rendererRef.current.setSize(width, height, false);
      if (composerRef.current) composerRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(containerRef.current);
    let lastTime = performance.now();
    let virtualFrame = 0;
    const simFps = 30;
    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1e3, 0.1);
      lastTime = now;
      virtualFrame += delta * simFps;
      if (renderer.xr.isPresenting) {
        const sources = [hand1, hand2, controller1, controller2];
        const headPos = new THREE.Vector3();
        const handPos = new THREE.Vector3();
        const moveDir = new THREE.Vector3();
        camera.getWorldPosition(headPos);
        sources.forEach((source) => {
          source.getWorldPosition(handPos);
          const dx = handPos.x - headPos.x;
          const dz = handPos.z - headPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const threshold = 0.35 * SCENE_UNIT_SCALE;
          if (dist > threshold) {
            moveDir.set(dx, 0, dz).normalize();
            const extension = (dist - threshold) / SCENE_UNIT_SCALE;
            const speedMeters = 1.5 + extension * 5;
            const speedWorld = speedMeters * SCENE_UNIT_SCALE * delta;
            dolly.position.addScaledVector(moveDir, speedWorld);
          }
        });
      }
      if (document.pointerLockElement === canvas) {
        const moveSpeed = 5 * delta;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();
        if (keys.current.w) camera.position.addScaledVector(forward, moveSpeed);
        if (keys.current.s) camera.position.addScaledVector(forward, -moveSpeed);
        if (keys.current.d) camera.position.addScaledVector(right, moveSpeed);
        if (keys.current.a) camera.position.addScaledVector(right, -moveSpeed);
        if (keys.current.space) camera.position.y += moveSpeed;
        if (keys.current.shift) camera.position.y -= moveSpeed;
      }
      if (waterSystem && faucetTip) {
        waterSystem.update(virtualFrame, simFps, faucetTip);
      }
      if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
    });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      canvas.removeEventListener("click", onClick);
      renderer.setAnimationLoop(null);
      if (music.isPlaying) music.stop();
      if (vrButton.parentNode) vrButton.parentNode.removeChild(vrButton);
      if (cubeRenderTarget) cubeRenderTarget.dispose();
      if (composerRef.current) composerRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, []);
  useEffect(() => {
    if (helpersRef.current) {
      helpersRef.current.forEach((h) => h.visible = showHelpers);
    }
  }, [showHelpers]);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: containerRef,
      style: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "relative"
      },
      title: "Click to capture controls"
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 427,
      columnNumber: 5
    }
  );
};
export {
  KitchenSceneInteractive
};
