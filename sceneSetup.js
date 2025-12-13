import * as THREE from "three";
import { loadMaterials } from "./materials.js";
import { setupLighting, createEnvironment } from "./environment.js";
import { createCounterAndSink } from "./sink.js";
import { createFaucet } from "./faucet.js";
import { createDishes } from "./dishes.js";
import { createWaterSystem } from "./water.js";

export const createKitchenScene = (width, height, cubeRenderTarget) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#050505"); 

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(1, 0.5, 1);

  // removed inline texture loading (moved to materials.js)
  const materials = loadMaterials();
  // scene.environment will be set via PMREM in the component

  // removed lighting setup (moved to environment.js)
  setupLighting(scene);
  
  // removed window and background creation (moved to environment.js)
  const { glass, outdoorView } = createEnvironment(scene, materials);

  // Apply real-time reflection map to glass if available
  if (cubeRenderTarget) {
    glass.material.envMap = cubeRenderTarget.texture;
    glass.material.envMapIntensity = 2.5; 
  }

  // removed counter and sink geometry (moved to sink.js)
  createCounterAndSink(scene, materials);

  // removed faucet geometry (moved to faucet.js)
  const { tipMesh } = createFaucet(scene, materials);

  // removed dishes creation (moved to dishes.js)
  createDishes(scene, materials);

  // Initialize water system
  const waterSystem = createWaterSystem(scene);

  return { scene, camera, waterSystem, faucetTip: tipMesh, glassMesh: glass, outdoorMesh: outdoorView, materials };
};

