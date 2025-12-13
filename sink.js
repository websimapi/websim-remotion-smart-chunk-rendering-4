import * as THREE from "three";

export const createCounterAndSink = (scene, materials) => {
  const { counterMat, metalMat, rimMat, cabinetMat } = materials;

  // --- Countertop ---
  const holeWidth = 3.5;
  const holeDepth = 2.1;
  const counterWidth = 10;
  const counterDepth = 4;
  const counterThickness = 0.2;
  
  const counterGroup = new THREE.Group();
  counterGroup.position.y = -0.1;
  
  // Left Slab
  const slabW = (counterWidth - holeWidth) / 2;
  const leftSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, counterThickness, counterDepth), counterMat);
  leftSlab.position.set(-(counterWidth/2 - slabW/2), 0, 0);
  leftSlab.receiveShadow = true;
  counterGroup.add(leftSlab);

  // Right Slab
  const rightSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, counterThickness, counterDepth), counterMat);
  rightSlab.position.set((counterWidth/2 - slabW/2), 0, 0);
  rightSlab.receiveShadow = true;
  counterGroup.add(rightSlab);

  // Front Strip
  const stripD = (counterDepth - holeDepth) / 2;
  const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(holeWidth, counterThickness, stripD), counterMat);
  frontStrip.position.set(0, 0, (counterDepth/2 - stripD/2));
  frontStrip.receiveShadow = true;
  counterGroup.add(frontStrip);

  // Back Strip
  const backStrip = new THREE.Mesh(new THREE.BoxGeometry(holeWidth, counterThickness, stripD), counterMat);
  backStrip.position.set(0, 0, -(counterDepth/2 - stripD/2));
  backStrip.receiveShadow = true;
  counterGroup.add(backStrip);

  scene.add(counterGroup);

  // --- Sink ---
  const sinkGroup = new THREE.Group();
  sinkGroup.position.set(0, 0, 0);

  const sinkW = 3.4;
  const sinkD = 2.0;
  const sinkDeep = 0.8;
  const dividerW = 0.12;
  const rimW = 0.15;
  const rimH = 0.04;

  const rimGroup = new THREE.Group();
  
  const rBack = new THREE.Mesh(new THREE.BoxGeometry(sinkW + rimW*2, rimH, rimW), rimMat);
  rBack.position.set(0, rimH/2, -(sinkD/2 + rimW/2));
  rBack.castShadow = true;
  rimGroup.add(rBack);
  
  const rFront = new THREE.Mesh(new THREE.BoxGeometry(sinkW + rimW*2, rimH, rimW), rimMat);
  rFront.position.set(0, rimH/2, (sinkD/2 + rimW/2));
  rFront.castShadow = true;
  rimGroup.add(rFront);
  
  const rLeft = new THREE.Mesh(new THREE.BoxGeometry(rimW, rimH, sinkD), rimMat);
  rLeft.position.set(-(sinkW/2 + rimW/2), rimH/2, 0);
  rLeft.castShadow = true;
  rimGroup.add(rLeft);

  const rRight = new THREE.Mesh(new THREE.BoxGeometry(rimW, rimH, sinkD), rimMat);
  rRight.position.set((sinkW/2 + rimW/2), rimH/2, 0);
  rRight.castShadow = true;
  rimGroup.add(rRight);
  
  const rDiv = new THREE.Mesh(new THREE.BoxGeometry(dividerW, rimH, sinkD), rimMat);
  rDiv.position.set(0, rimH/2, 0);
  rDiv.castShadow = true;
  rimGroup.add(rDiv);
  
  sinkGroup.add(rimGroup);

  const createBasin = (xPos) => {
    const bW = (sinkW - dividerW) / 2;
    const basin = new THREE.Group();
    basin.position.set(xPos, 0, 0);

    const wallThick = 0.05;
    const sideWall = new THREE.BoxGeometry(wallThick, sinkDeep, sinkD);
    const fbWall = new THREE.BoxGeometry(bW, sinkDeep, wallThick);
    
    const w1 = new THREE.Mesh(sideWall, metalMat);
    w1.position.set(-bW/2, -sinkDeep/2, 0);
    w1.castShadow = true;
    w1.receiveShadow = true;
    basin.add(w1);

    const w2 = new THREE.Mesh(sideWall, metalMat);
    w2.position.set(bW/2, -sinkDeep/2, 0);
    w2.castShadow = true;
    w2.receiveShadow = true;
    basin.add(w2);

    const w3 = new THREE.Mesh(fbWall, metalMat);
    w3.position.set(0, -sinkDeep/2, -sinkD/2);
    w3.castShadow = true;
    w3.receiveShadow = true;
    basin.add(w3);

    const w4 = new THREE.Mesh(fbWall, metalMat);
    w4.position.set(0, -sinkDeep/2, sinkD/2);
    w4.castShadow = true;
    w4.receiveShadow = true;
    basin.add(w4);
    
    // Slightly larger bottom to prevent light leaks at corners
    const bot = new THREE.Mesh(new THREE.BoxGeometry(bW + wallThick, wallThick, sinkD + wallThick), metalMat);
    bot.position.set(0, -sinkDeep, 0);
    bot.receiveShadow = true;
    bot.castShadow = true;
    basin.add(bot);
    
    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: "#222222", metalness: 0.5, roughness: 0.8 })
    );
    drain.position.set(0, -sinkDeep + 0.04, -0.4);
    drain.receiveShadow = true;
    basin.add(drain);
    
    return basin;
  };

  sinkGroup.add(createBasin(-(sinkW/4 + dividerW/4))); 
  sinkGroup.add(createBasin((sinkW/4 + dividerW/4)));

  scene.add(sinkGroup);

  // --- Cabinets ---
  const cabH = 3.3;
  const cabD = 3.8;
  const cabZ = -2 + cabD/2;   
  const toeKickH = 0.4;
  const toeKickD = 0.3;
  
  const cabinetGroup = new THREE.Group();
  scene.add(cabinetGroup);
  
  // Shaker Door Helper
  const createDoor = (w, h, side = "left") => {
    const door = new THREE.Group();
    const thick = 0.08;
    const border = 0.12;
    
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), cabinetMat);
    door.add(panel);
    
    // Frame
    const railGeo = new THREE.BoxGeometry(w, border, thick + 0.03);
    const topRail = new THREE.Mesh(railGeo, cabinetMat);
    topRail.position.y = h/2 - border/2;
    topRail.position.z = 0.015;
    topRail.castShadow = true;
    door.add(topRail);
    
    const botRail = new THREE.Mesh(railGeo, cabinetMat);
    botRail.position.y = -h/2 + border/2;
    botRail.position.z = 0.015;
    botRail.castShadow = true;
    door.add(botRail);
    
    const stileGeo = new THREE.BoxGeometry(border, h - 2*border, thick + 0.03);
    const leftStile = new THREE.Mesh(stileGeo, cabinetMat);
    leftStile.position.x = -w/2 + border/2;
    leftStile.position.z = 0.015;
    leftStile.castShadow = true;
    door.add(leftStile);
    
    const rightStile = new THREE.Mesh(stileGeo, cabinetMat);
    rightStile.position.x = w/2 - border/2;
    rightStile.position.z = 0.015;
    rightStile.castShadow = true;
    door.add(rightStile);
    
    // Handle - place on inner edge depending on cabinet side
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8),
        new THREE.MeshStandardMaterial({color: "#333", metalness: 0.8, roughness: 0.2})
    );
    // For a left-side door, handle goes on its right edge (inner); for a right-side door, on its left edge (inner).
    const hX = side === "left"
      ? w/2 - border/2 - 0.02   // right edge of door
      : -w/2 + border/2 + 0.02; // left edge of door
    handle.position.set(hX, h/4, thick + 0.05);
    handle.castShadow = true;
    door.add(handle);
    
    return door;
  };
  
  // Drawer Helper
  const createDrawer = (w, h) => {
    const drawer = new THREE.Group();
    const thick = 0.08;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick+0.02), cabinetMat);
    slab.castShadow = true;
    drawer.add(slab);
    
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8),
        new THREE.MeshStandardMaterial({color: "#333", metalness: 0.8, roughness: 0.2})
    );
    handle.rotation.z = Math.PI/2;
    handle.position.z = thick + 0.04;
    drawer.add(handle);
    return drawer;
  };

  // Carcass
  const carcassH = cabH - toeKickH;
  const carcassBottomY = -3.5 + toeKickH;
  const centerW = 3.6;
  
  // Left Section
  const sideW = (counterWidth - centerW) / 2;
  const leftCarcass = new THREE.Mesh(
    new THREE.BoxGeometry(sideW, carcassH, cabD),
    cabinetMat
  );
  leftCarcass.position.set(-(counterWidth/2 - sideW/2), carcassBottomY + carcassH/2, cabZ);
  leftCarcass.receiveShadow = true;
  cabinetGroup.add(leftCarcass);

  // Right Section
  const rightCarcass = new THREE.Mesh(
    new THREE.BoxGeometry(sideW, carcassH, cabD),
    cabinetMat
  );
  rightCarcass.position.set((counterWidth/2 - sideW/2), carcassBottomY + carcassH/2, cabZ);
  rightCarcass.receiveShadow = true;
  cabinetGroup.add(rightCarcass);

  // Center Section (Sink Base) - Lowered to avoid clipping into sink basin
  // Sink depth extends to approx -0.8. We end the cabinet box at -0.85 to be safe.
  const centerTopY = -0.85;
  const centerH = centerTopY - carcassBottomY;
  
  const centerCarcass = new THREE.Mesh(
    new THREE.BoxGeometry(centerW, centerH, cabD),
    cabinetMat
  );
  centerCarcass.position.set(0, carcassBottomY + centerH/2, cabZ);
  centerCarcass.receiveShadow = true;
  cabinetGroup.add(centerCarcass);

  // Sink Apron (Filler behind false panel to close gap)
  const apronH = 0.65; // Matches gap from carcass top (-0.85) to counter (-0.2)
  const sinkApron = new THREE.Mesh(
    new THREE.BoxGeometry(centerW, apronH, 0.1), 
    cabinetMat
  );
  sinkApron.position.set(0, -0.2 - apronH/2, cabZ + cabD/2 - 0.05);
  sinkApron.castShadow = true;
  sinkApron.receiveShadow = true;
  cabinetGroup.add(sinkApron);
  
  // Toe Kick
  const kick = new THREE.Mesh(
    new THREE.BoxGeometry(counterWidth, toeKickH, cabD - toeKickD),
    new THREE.MeshStandardMaterial({color: "#111", roughness: 1})
  );
  kick.position.set(0, -3.5 + toeKickH/2, cabZ - toeKickD/2);
  cabinetGroup.add(kick);
  
  const frontZ = cabZ + cabD/2 + 0.04; 
  const topDrawerH = 0.6;
  const doorH = carcassH - topDrawerH - 0.1; 
  const bottomY = -3.5 + toeKickH + 0.1;
  
  // Sink Base
  const cX = 0;
  const cW = 3.6;
  const falsePanel = new THREE.Mesh(new THREE.BoxGeometry(cW - 0.1, topDrawerH, 0.06), cabinetMat);
  falsePanel.position.set(cX, -0.2 - topDrawerH/2 - 0.05, frontZ);
  falsePanel.castShadow = true;
  cabinetGroup.add(falsePanel);
  
  const doorW = (cW - 0.2) / 2;
  const leftDoor = createDoor(doorW, doorH, "left");
  leftDoor.position.set(cX - doorW/2 - 0.02, bottomY + doorH/2, frontZ);
  cabinetGroup.add(leftDoor);
  
  const rightDoor = createDoor(doorW, doorH, "right");
  rightDoor.position.set(cX + doorW/2 + 0.02, bottomY + doorH/2, frontZ);
  cabinetGroup.add(rightDoor);
  
  // Left Bank (Drawers)
  const lW = (counterWidth - cW)/2; 
  const lX = -counterWidth/2 + lW/2;
  const dH = (carcassH - 0.2) / 3;
  for(let i=0; i<3; i++) {
    const d = createDrawer(lW - 0.1, dH - 0.05);
    d.position.set(lX, bottomY + dH/2 + i*dH, frontZ);
    cabinetGroup.add(d);
  }
  
  // Right Bank
  const rX = counterWidth/2 - lW/2;
  const rTopD = createDrawer(lW - 0.1, topDrawerH);
  rTopD.position.set(rX, -0.2 - topDrawerH/2 - 0.05, frontZ);
  cabinetGroup.add(rTopD);
  
  const rDoor = createDoor(lW - 0.1, doorH, "right");
  rDoor.position.set(rX, bottomY + doorH/2, frontZ);
  cabinetGroup.add(rDoor);
};

