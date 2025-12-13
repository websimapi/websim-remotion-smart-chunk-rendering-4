import * as THREE from "three";

export const createDishes = (scene, materials) => {
  const { dirtyMat, dirty, wood, metalMat } = materials;

  const dishesGroup = new THREE.Group();
  scene.add(dishesGroup);

  // --- Materials ---
  const darkCeramic = dirtyMat.clone();
  darkCeramic.color.setHex(0xdddddd);
  darkCeramic.map = dirty; // Ensure texture is preserved

  const woodBoardMat = new THREE.MeshStandardMaterial({
    color: 0x8B5A2B,
    roughness: 0.8,
    map: wood
  });

  const knifeHandleMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.1 });

  // --- Geometries ---
  // Helper to create hollow vessels (Bowls, Cups) with thickness
  const createVessel = (rTop, rBot, height, thick) => {
    const pts = [];
    // Outer shell (bottom-center to top-outer)
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(rBot, 0));
    pts.push(new THREE.Vector2(rTop, height));
    // Inner shell (top-inner to bottom-center)
    pts.push(new THREE.Vector2(rTop - thick, height));
    pts.push(new THREE.Vector2(rBot - thick, thick));
    pts.push(new THREE.Vector2(0, thick));
    
    // Lathe geometry creates a shape by spinning the profile
    const geo = new THREE.LatheGeometry(pts, 32);
    geo.center(); // Center at (0,0,0) so Y range is [-h/2, h/2]
    geo.parameters = { height }; // Attach height for stacking logic
    return geo;
  };

  // Using simplified geometries for performance but with enough detail for shadows
  const plateGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.04, 32);
  const largePlateGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.05, 32);
  
  // Hollow bowls and cups
  const bowlGeo = createVessel(0.25, 0.15, 0.18, 0.025); 
  const cupGeo = createVessel(0.12, 0.1, 0.25, 0.02);
  
  const boardGeo = new THREE.BoxGeometry(0.8, 0.05, 0.6);

  // --- Helpers ---
  const place = (geo, mat, x, y, z, rx=0, ry=0, rz=0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.interactable = true;
    dishesGroup.add(mesh);
    return mesh;
  };

  const createStack = (geo, count, x, z, startY, mat = dirtyMat, wobble = 0.05, heightOverride = null) => {
    let currentY = startY;
    const h = heightOverride || geo.parameters.height;
    
    for (let i = 0; i < count; i++) {
        const itemH = h;
        currentY += itemH / 2;
        
        // Random slight offset for realism
        const rX = (Math.random() - 0.5) * wobble; // Position jitter
        const rZ = (Math.random() - 0.5) * wobble;
        const rotY = Math.random() * Math.PI * 2;
        const rotX = (Math.random() - 0.5) * wobble * 2; // Tilt jitter
        const rotZ = (Math.random() - 0.5) * wobble * 2;
        
        place(geo, mat, x + rX, currentY, z + rZ, rotX, rotY, rotZ);
        
        currentY += itemH / 2;
        // Small gap between stacked items sometimes
        if (Math.random() > 0.8) currentY += 0.005;
    }
  };

  const createKnife = (x, y, z, ry) => {
     const kGroup = new THREE.Group();
     kGroup.position.set(x, y, z);
     kGroup.rotation.y = ry;
     
     const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), knifeHandleMat);
     handle.position.x = -0.06;
     handle.castShadow = true;
     kGroup.add(handle);
     
     const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.002, 0.035), bladeMat);
     blade.position.x = 0.1;
     blade.castShadow = true;
     kGroup.add(blade);
     
     dishesGroup.add(kGroup);
  };

  // --- SCENE PLACEMENT ---

  // 1. RIGHT COUNTER - Organized Chaos
  // Main clean stack
  createStack(largePlateGeo, 10, 3.2, -1.2, 0.0, dirtyMat, 0.02);
  
  // Secondary stack
  createStack(plateGeo, 8, 3.2, 0.0, 0.0, darkCeramic, 0.04);
  
  // Bowl tower (precarious)
  createStack(bowlGeo, 5, 2.4, -0.6, 0.0, dirtyMat, 0.08);
  
  // Scattered Cups
  place(cupGeo, dirtyMat, 2.0, 0.125, 0.5, 0, Math.random(), 0);
  place(cupGeo, darkCeramic, 2.8, 0.125, 0.8, 0, Math.random(), 0);
  // Spilled cup
  place(cupGeo, dirtyMat, 4.0, 0.12, -0.5, 0, Math.random(), 1.4); 

  // 2. LEFT COUNTER - Prep Area
  // Cutting Board
  place(boardGeo, woodBoardMat, -2.8, 0.025, -0.6, 0, 0.1, 0);
  
  // Knife on board
  createKnife(-2.8, 0.06, -0.6, 0.5);
  
  // Dirty stack next to sink
  createStack(largePlateGeo, 4, -1.8, 0.2, 0.0, dirtyMat, 0.1);
  place(bowlGeo, darkCeramic, -1.8, 0.09 + (4*0.05), 0.2, 0.2, 0, 0); // Bowl on top of plates

  // 3. SINK - The "Sink Battle"
  // Floor level is roughly -0.775 due to sink depth
  const sinkFloor = -0.76; 

  // Left Basin - Full stack
  createStack(largePlateGeo, 6, -0.9, 0.0, sinkFloor, dirtyMat, 0.15);
  // Leaning plate against stack
  place(plateGeo, darkCeramic, -1.2, sinkFloor + 0.2, -0.2, 0, 0, -0.8);
  
  // Right Basin - Soaking / Utensils
  place(bowlGeo, dirtyMat, 0.9, sinkFloor + 0.09, 0.3, 0.1, 0, 0.1);
  place(bowlGeo, darkCeramic, 0.8, sinkFloor + 0.09, -0.4, -0.1, 2, 0);
  
  // Floating/Angled plate
  place(largePlateGeo, dirtyMat, 1.0, sinkFloor + 0.2, 0.0, 0.4, 0.5, 0.1);
  
  // Fork/Spoon handles sticking out
  const utensilGeo = new THREE.CylinderGeometry(0.01, 0.005, 0.25, 8);
  place(utensilGeo, metalMat, 0.7, sinkFloor + 0.15, -0.4, 0.5, 0, 0.5);
  place(utensilGeo, metalMat, 1.0, sinkFloor + 0.2, 0.4, -0.5, 1, 0.2);

  // 4. OVERFLOW - Behind sink / Window sill
  // Maybe a cup on the window sill
  // Sill y is 0.1, z is -1.7
  place(cupGeo, darkCeramic, 1.5, 0.1 + 0.04 + 0.125, -1.6, 0, 0, 0);

};

