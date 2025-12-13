import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const setupPostProcessing = (renderer, scene, camera, width, height) => {
  const composer = new EffectComposer(renderer);
  
  // 1. Render Base Scene
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. SSAO (Screen Space Ambient Occlusion) - The "Baked" Look
  // Adds contact shadows in corners and crevices
  const ssaoPass = new SSAOPass(scene, camera, width, height);
  ssaoPass.kernelRadius = 0.03; // Radius of occlusion
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.08;
  ssaoPass.output = SSAOPass.OUTPUT.Default;
  composer.addPass(ssaoPass);

  // 3. Bloom - The "Radiance" Look
  // Adds glow to bright areas (sunlight hits, specular reflections)
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.92; // Only very bright things glow
  bloomPass.strength = 0.25;   // Subtle glow
  bloomPass.radius = 0.2;
  composer.addPass(bloomPass);

  // 4. Tone Mapping & Output
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { composer, ssaoPass, bloomPass };
};

