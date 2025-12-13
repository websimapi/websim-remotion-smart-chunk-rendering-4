import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";

export const setupLighting = (scene) => {
  // Initialize RectAreaLight (Area lights support)
  RectAreaLightUniformsLib.init();

  // 1. Sunlight - The Key Light (Direct Sun)
  // Positioned much further away to simulate true solar distance
  const sunLight = new THREE.DirectionalLight(0xfff5e6, 5.0); // Reduced intensity to prevent white blowout
  sunLight.position.set(20, 30, -60); 
  sunLight.target.position.set(0, -2, 0); 
  sunLight.castShadow = true;

  // Ultra-High Quality Shadow Map for "RTX" feel
  sunLight.shadow.mapSize.width = 4096; 
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.bias = -0.0001; 
  sunLight.shadow.normalBias = 0.05; 
  sunLight.shadow.radius = 1.5; 
  
  // Expanded shadow frustum to cover the larger distance
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.camera.left = -30;
  sunLight.shadow.camera.right = 30;
  sunLight.shadow.camera.top = 30;
  sunLight.shadow.camera.bottom = -30;
  
  scene.add(sunLight);
  scene.add(sunLight.target);

  // 2. Window Light - Area Light (Sky Radiance)
  // Positioned INSIDE the window plane (-1.9 vs -2.0) to prevent lighting the exterior wall back-face
  // This fixes the "glowing outside" issue while still lighting the room
  const windowWidth = 4.0;
  const windowHeight = 2.5;
  const areaLight = new THREE.RectAreaLight(0xddeeff, 5.0, windowWidth, windowHeight);
  areaLight.position.set(0, 1.5, -1.9); 
  areaLight.lookAt(0, 1.5, 5); // Look into room
  
  scene.add(areaLight);

  // 3. Global Illumination Simulation (Bounce Light)
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x3d3024, 0.4);
  scene.add(hemiLight);
};

export const createEnvironment = (scene, materials) => {
  const { frameMat, glassMat, outdoorMat, wood, wallMat, ceilingMat, floorMat, exteriorMat } = materials;

  const windowWidth = 4;
  const windowHeight = 2.5;
  const frameThickness = 0.1;
  const frameDepth = 0.15;
  const windowZ = -2;

  // Window Frame
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
    frameMat,
  );
  topFrame.position.set(0, 2.8, windowZ);
  topFrame.castShadow = true;
  scene.add(topFrame);

  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
    frameMat,
  );
  bottomFrame.position.set(0, 0.2, windowZ);
  bottomFrame.castShadow = true;
  bottomFrame.receiveShadow = true;
  scene.add(bottomFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight + 0.1, frameDepth),
    frameMat,
  );
  leftFrame.position.set(-windowWidth / 2 - frameThickness / 2, 1.5, windowZ);
  leftFrame.castShadow = true;
  scene.add(leftFrame);

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight + 0.1, frameDepth),
    frameMat,
  );
  rightFrame.position.set(windowWidth / 2 + frameThickness / 2, 1.5, windowZ);
  rightFrame.castShadow = true;
  scene.add(rightFrame);

  // Glass
  const glassGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.02);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.5, windowZ);
  glass.castShadow = false;
  glass.receiveShadow = true;
  scene.add(glass);

  // Outdoor View - Large billboard far away
  const outdoorGeo = new THREE.PlaneGeometry(60, 30);
  const outdoorView = new THREE.Mesh(outdoorGeo, outdoorMat);
  outdoorView.position.set(0, 5, -25); 
  outdoorView.rotation.y = Math.PI; 
  outdoorView.castShadow = false;
  outdoorView.receiveShadow = false;
  scene.add(outdoorView);

  // Window Sill
  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 0.6),
    new THREE.MeshStandardMaterial({
      map: wood,
      roughness: 0.4,
    }),
  );
  sill.position.set(0, 0.1, -1.7);
  sill.castShadow = true;
  sill.receiveShadow = true;
  scene.add(sill);

  // Walls
  const wallGroup = new THREE.Group();
  wallGroup.position.z = -2.0; // Front wall plane
  
  // Material Array for Front Walls: [Right, Left, Top, Bottom, Front(Inside), Back(Outside)]
  // We make the Back face (Outside) dark (exteriorMat) to prevent it from glowing in the sun
  const frontFacadeMat = [
    wallMat, wallMat, wallMat, wallMat, // Sides
    wallMat,     // Front (+Z, Inside Room)
    exteriorMat  // Back (-Z, Outside)
  ];
  
  const roomWidth = 20;
  const floorY = -3.5;
  const ceilingY = 3.5;
  const fullHeight = 7.0; 
  
  // Window bounds
  const winBoundLeft = -2.08;
  const winBoundRight = 2.08;
  const winBoundTop = 2.82;
  const winBoundBottom = 0.18;

  // 1. Front Left Panel
  const leftW = (roomWidth / 2) + winBoundLeft; 
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(leftW, fullHeight, 0.2),
    frontFacadeMat
  );
  leftWall.position.set(-10 + leftW/2, 0, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  wallGroup.add(leftWall);

  // 2. Front Right Panel
  const rightW = (roomWidth / 2) - winBoundRight;
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(rightW, fullHeight, 0.2),
    frontFacadeMat
  );
  rightWall.position.set(10 - rightW/2, 0, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  wallGroup.add(rightWall);

  // 3. Front Top Panel
  const midW = winBoundRight - winBoundLeft;
  const topH = ceilingY - winBoundTop;
  if (topH > 0) {
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(midW, topH, 0.2),
      frontFacadeMat
    );
    topWall.position.set(0, winBoundTop + topH/2, 0);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    wallGroup.add(topWall);
  }

  // 4. Front Bottom Panel
  const botH = winBoundBottom - floorY; 
  if (botH > 0) {
    const botWall = new THREE.Mesh(
      new THREE.BoxGeometry(midW, botH, 0.2),
      frontFacadeMat
    );
    botWall.position.set(0, floorY + botH/2, 0);
    botWall.castShadow = true;
    botWall.receiveShadow = true;
    wallGroup.add(botWall);
  }

  scene.add(wallGroup);

  // Side & Back Walls (Can remain standard wallMat as they are interior facing)
  const roomDepth = 20;
  const sideGeo = new THREE.BoxGeometry(0.2, fullHeight, roomDepth);
  
  // Left Wall
  const sideLeft = new THREE.Mesh(sideGeo, wallMat);
  sideLeft.position.set(-roomWidth/2, 0, -2 + roomDepth/2 - 0.1); 
  sideLeft.receiveShadow = true;
  sideLeft.castShadow = true;
  scene.add(sideLeft);
  
  // Right Wall
  const sideRight = new THREE.Mesh(sideGeo, wallMat);
  sideRight.position.set(roomWidth/2, 0, -2 + roomDepth/2 - 0.1);
  sideRight.receiveShadow = true;
  sideRight.castShadow = true;
  scene.add(sideRight);
  
  // Back Wall
  const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, fullHeight, 0.2),
      wallMat
  );
  backWall.position.set(0, 0, -2 + roomDepth - 0.2); 
  backWall.receiveShadow = true;
  backWall.castShadow = true;
  scene.add(backWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.2, roomDepth + 2),
    ceilingMat
  );
  ceiling.position.set(0, ceilingY + 0.1, -2 + roomDepth/2);
  ceiling.receiveShadow = true;
  ceiling.castShadow = true;
  scene.add(ceiling);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth + 2),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, -2 + roomDepth/2); 
  floor.receiveShadow = true;
  scene.add(floor);

  return { glass, outdoorView };
};

