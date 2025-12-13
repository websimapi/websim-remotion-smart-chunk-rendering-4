import * as THREE from "three";

// Helper to generate a soft blurry dot texture for mist/spray
const getWaterTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(200,240,255,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,100,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

export const createWaterSystem = (scene) => {
  // 1. Main Stream - InstancedMesh for physical water appearance
  // Using a capsule/sphere shape that we'll stretch to simulate motion blur
  const particleCount = 800; // Optimized for performance
  const geometry = new THREE.SphereGeometry(0.012, 6, 6); // Lower poly
  
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,        // Pure white, removed blue tint
    metalness: 0.1,
    roughness: 0.02,        
    transmission: 0.98,     
    thickness: 0.01,        // Reduced thickness to prevent absorption tinting
    ior: 1.33,              
    envMapIntensity: 2.0,   
    transparent: true,
    opacity: 0.9,
  });

  const streamMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  streamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(streamMesh);

  // 2. Mist/Splash - Point Cloud for fine spray at impact
  const mistCount = 800;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  
  const mistMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    map: getWaterTexture(),
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const mistSystem = new THREE.Points(mistGeo, mistMat);
  scene.add(mistSystem);

  // 3. Surface Ripples - Ring Geometry
  const rippleCount = 6;
  const ripples = [];
  const rippleGeo = new THREE.RingGeometry(0.02, 0.15, 32);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  for(let i=0; i<rippleCount; i++) {
    const r = new THREE.Mesh(rippleGeo, rippleMat.clone());
    r.rotation.x = -Math.PI / 2;
    r.visible = false;
    scene.add(r);
    ripples.push(r);
  }

  // Pre-allocate objects for matrix calculations to minimize Garbage Collection
  const dummy = new THREE.Object3D();
  const alignVec = new THREE.Vector3();
  const upVec = new THREE.Vector3(0, 1, 0);
  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  const nozzleDir = new THREE.Vector3();

  return {
    update: (frame, fps, sourceObject) => {
      if (!sourceObject) return;

      const time = frame / fps;
      
      // Update Source Info from Faucet Tip
      sourceObject.getWorldPosition(worldPos);
      sourceObject.getWorldQuaternion(worldQuat);
      
      // Calculate Nozzle Direction (Local Y of cylinder -> World)
      // We assume the cylinder's Y axis points "out" of the faucet
      nozzleDir.set(0, 1, 0).applyQuaternion(worldQuat).normalize();
      
      // Adjust start position to tip of nozzle (mesh origin is center of cylinder)
      // Moving slightly negative (into the mesh) prevents the visible gap
      worldPos.addScaledVector(nozzleDir, -0.08);

      const gravity = 9.8;
      const initialSpeed = 1.5; // Reduced speed to prevent excessive arcing
      const floorY = -0.77; // Sink bottom level

      // Calculate approximate impact point for secondary effects
      // Physics: y(t) = y0 + vy*t - 0.5*g*t^2
      // We need t when y(t) = floorY
      const vy0 = nozzleDir.y * initialSpeed;
      const dy = worldPos.y - floorY;
      
      let impactT = 0;
      // 0.5*g*t^2 - vy0*t - dy = 0
      const A = 0.5 * gravity;
      const B = -vy0;
      const C = -dy;
      
      if (Math.abs(A) > 0.001) {
          const det = B*B - 4*A*C;
          if (det >= 0) {
              impactT = (-B + Math.sqrt(det)) / (2*A);
          }
      }
      
      const impactX = worldPos.x + nozzleDir.x * initialSpeed * impactT;
      const impactZ = worldPos.z + nozzleDir.z * initialSpeed * impactT;


      // --- Update Stream Particles ---
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 1357.9;
        const lifeDuration = 0.8; 
        const offset = (seed % 1000) / 1000;
        
        let t = (time - offset * lifeDuration) % lifeDuration;
        if (t < 0) t += lifeDuration;
        
        // Random Spread at source
        const spread = 0.012;
        const rX = (Math.sin(seed * 12.3) * spread);
        const rZ = (Math.cos(seed * 45.6) * spread);
        const vVar = 1.0 + Math.sin(seed * 78.9) * 0.05; // Velocity variation

        // Kinematics
        const vx = nozzleDir.x * initialSpeed * vVar;
        const vz = nozzleDir.z * initialSpeed * vVar;
        const vy = nozzleDir.y * initialSpeed * vVar - gravity * t;

        let x = worldPos.x + rX + vx * t;
        let y = worldPos.y + (nozzleDir.y * initialSpeed * vVar * t) - (0.5 * gravity * t * t);
        let z = worldPos.z + rZ + vz * t;

        // Scale & Orient based on state
        if (y < floorY) {
            // Collision / Splash behavior
            const remT = t - impactT;
            
            // Particles that have hit the sink bottom
            if (remT > 0) {
                 // Chaotic bounce / slide
                 // Flatten height
                 y = floorY + Math.abs(Math.sin(remT * 25 + seed)) * 0.04 * Math.exp(-remT * 4);
                 
                 // Spread out horizontally
                 x += vx * remT * 0.4 + Math.sin(seed * 11) * 0.02;
                 z += vz * remT * 0.4 + Math.cos(seed * 11) * 0.02;
                 
                 // Squish scale to look like puddling water
                 dummy.scale.set(1.5, 0.2, 1.5);
                 dummy.quaternion.identity(); // Reset rotation
            } else {
                 y = floorY;
                 dummy.scale.set(0,0,0); // Hide if glitching
            }
        } else {
            // Air travel - stretch along velocity vector
            const velMag = Math.sqrt(vx*vx + vy*vy + vz*vz);
            const stretch = 1 + velMag * 0.25; // Stretch factor
            
            alignVec.set(vx, vy, vz).normalize();
            dummy.quaternion.setFromUnitVectors(upVec, alignVec);
            // Make thin and long
            dummy.scale.set(0.6, stretch, 0.6); 
        }

        dummy.position.set(x, y, z);
        
        // Hide recycled particles cleanly at spawn
        if (t < 0.01) dummy.scale.multiplyScalar(t / 0.01);

        dummy.updateMatrix();
        streamMesh.setMatrixAt(i, dummy.matrix);
      }
      streamMesh.instanceMatrix.needsUpdate = true;


      // --- Update Mist (Spray at impact) ---
      const mPos = mistSystem.geometry.attributes.position.array;
      for(let i=0; i<mistCount; i++) {
          const seed = i * 432.1;
          const life = 0.5;
          const offset = (seed % 1000) / 1000;
          let t = (time - offset * life) % life;
          if (t < 0) t += life;
          
          // Mist behaves like a fountain from impact point
          const angle = seed * 50;
          const rad = Math.random() * 0.3 * t;
          
          mPos[i*3] = impactX + Math.cos(angle) * rad;
          // Arching up slightly
          mPos[i*3+1] = floorY + t * 0.5 - (2.0 * t * t) + 0.02; 
          mPos[i*3+2] = impactZ + Math.sin(angle) * rad;
      }
      mistSystem.geometry.attributes.position.needsUpdate = true;


      // --- Update Ripples ---
      ripples.forEach((r, i) => {
          const cycle = 0.8;
          const offset = i / rippleCount;
          let t = (time + offset) % cycle;
          let alpha = t / cycle;
          
          r.position.set(impactX, floorY + 0.005, impactZ);
          r.scale.setScalar(0.2 + alpha * 2.5);
          r.material.opacity = 0.3 * (1 - alpha);
          r.visible = true;
      });

    }
  };
};

