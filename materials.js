import * as THREE from "three";

export const loadMaterials = () => {
  const loader = new THREE.TextureLoader();
  const wood = loader.load("wood_counter.png");
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  
  const tiles = loader.load("kitchen_tiles.png");
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
  tiles.repeat.set(6, 6); // Adjusted repeat for wall scale

  const tilesNormal = loader.load("kitchen_tiles_normal.png");
  tilesNormal.wrapS = tilesNormal.wrapT = THREE.RepeatWrapping;
  tilesNormal.repeat.set(6, 6);

  const drywall = loader.load("drywall_diffuse.png");
  drywall.wrapS = drywall.wrapT = THREE.RepeatWrapping;
  drywall.repeat.set(4, 4);

  const drywallNormal = loader.load("drywall_normal.png");
  drywallNormal.wrapS = drywallNormal.wrapT = THREE.RepeatWrapping;
  drywallNormal.repeat.set(4, 4);

  const metal = loader.load("metal_scratch.png");
  const dirty = loader.load("dirty_plate_texture.png");
  const hdrEnv = loader.load("kitchen_hdr.png");
  hdrEnv.mapping = THREE.EquirectangularReflectionMapping;
  hdrEnv.colorSpace = THREE.SRGBColorSpace;

  // Enhance textures for "RTX" quality (Anisotropy)
  const maxAnisotropy = new THREE.WebGLRenderer().capabilities.getMaxAnisotropy();
  [wood, tiles, tilesNormal, drywall, drywallNormal, metal, dirty].forEach(t => {
    t.anisotropy = maxAnisotropy;
  });

  const counterMat = new THREE.MeshPhysicalMaterial({
    map: wood,
    roughness: 0.25,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    reflectivity: 0.5,
    envMapIntensity: 0.3, // Reduced to darken shadows inside
  });

  const metalMat = new THREE.MeshStandardMaterial({
    map: metal,
    metalness: 0.7,
    roughness: 0.3, // Brushed look
    color: "#aaaaaa",
    envMapIntensity: 1.0, // Keep reflective
  });

  const rimMat = new THREE.MeshStandardMaterial({
    map: metal,
    metalness: 0.95,
    roughness: 0.15,
    color: "#dddddd",
    envMapIntensity: 1.0,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    map: drywall,
    normalMap: drywallNormal,
    roughness: 0.8,
    color: "#ffffff",
    envMapIntensity: 0.2, // Darken walls in shadow
  });

  const exteriorMat = new THREE.MeshStandardMaterial({
    map: drywall,
    normalMap: drywallNormal,
    roughness: 0.9,
    color: "#555555", // Dark grey for exterior to prevent sun glow
    envMapIntensity: 0.1,
  });

  const ceilingMat = new THREE.MeshStandardMaterial({
    color: "#dddddd",
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.2, // Darken ceiling
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.5,
  });
  
  const rubberMat = new THREE.MeshStandardMaterial({
    color: "#222222",
    roughness: 0.9,
    metalness: 0.0
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: "#e0e0e0",
    metalness: 0.1,
    roughness: 0.5,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    name: "glass",
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.02, 
    transmission: 0.95, // Enabled for RTX look
    thickness: 0.1,    
    ior: 1.5,
    reflectivity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.0, 
    transparent: true,
    opacity: 1.0,     
    side: THREE.DoubleSide,
    depthWrite: false, 
  });

  const outdoorMat = new THREE.MeshBasicMaterial({
    map: hdrEnv,
    side: THREE.BackSide,
    color: new THREE.Color(0.6, 0.6, 0.6), // Dimmed to prevent excessive bloom
  });

  const dirtyMat = new THREE.MeshStandardMaterial({
    map: dirty,
    roughness: 0.2,
    color: "#eeeeee",
  });

  const cabinetMat = new THREE.MeshStandardMaterial({
    color: "#f5f5f5", 
    roughness: 0.4,
    metalness: 0.1,
    envMapIntensity: 0.25, // Significantly reduced to respect "dark inside" rule
  });

  const floorMat = new THREE.MeshStandardMaterial({
    color: "#333333",
    roughness: 0.3, // Smoother for reflections
    metalness: 0.1,
    envMapIntensity: 0.2
  });

  return {
    wood, tiles, metal, dirty, hdrEnv, drywall, drywallNormal,
    counterMat, metalMat, rimMat, chromeMat, rubberMat, frameMat, glassMat, outdoorMat, dirtyMat, wallMat, ceilingMat, cabinetMat, floorMat, exteriorMat
  };
};

