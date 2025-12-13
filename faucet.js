import * as THREE from "three";

export const createFaucet = (scene, materials) => {
  const { chromeMat, rubberMat } = materials;

  const faucetGroup = new THREE.Group();
  faucetGroup.position.set(0, 0, -1.4); 

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.25, 32);
  const baseMesh = new THREE.Mesh(baseGeo, chromeMat);
  baseMesh.position.y = 0.125;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  faucetGroup.add(baseMesh);

  // Swivel Group for rotating parts (Gooseneck, Handle, Head)
  const swivelGroup = new THREE.Group();
  swivelGroup.rotation.y = Math.PI / 5; // Rotate towards right sink
  faucetGroup.add(swivelGroup);

  // Handle
  const handleGroup = new THREE.Group();
  handleGroup.position.set(0.14, 0.15, 0); 
  handleGroup.rotation.z = Math.PI / 4; 
  
  const handlePin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 16), chromeMat);
  handlePin.rotation.z = Math.PI / 2;
  handlePin.position.x = 0.075;
  handleGroup.add(handlePin);
  
  const handleStick = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.25, 4, 16), chromeMat);
  handleStick.rotation.z = Math.PI / 2;
  handleStick.position.x = 0.25;
  handleGroup.add(handleStick);
  swivelGroup.add(handleGroup);

  // Gooseneck
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, 0),       
    new THREE.Vector3(0, 1.3, 0),        
    new THREE.Vector3(0, 2.2, 0.3),      
    new THREE.Vector3(0, 2.0, 0.9),      
    new THREE.Vector3(0, 1.2, 1.2)       
  ]);

  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.06, 32, false);
  const tubeMesh = new THREE.Mesh(tubeGeo, chromeMat);
  tubeMesh.castShadow = true;
  swivelGroup.add(tubeMesh);

  // Pull-down Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.2, 1.2);
  headGroup.rotation.x = Math.PI / 2.1; // Steeper angle for downward spray

  const headGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.4, 32);
  const headMesh = new THREE.Mesh(headGeo, chromeMat);
  headMesh.rotation.x = Math.PI / 2; 
  headMesh.position.z = 0.2; 
  headMesh.castShadow = true;
  headGroup.add(headMesh);
  
  const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32);
  const tipMesh = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({color: "#111", roughness: 0.5}));
  tipMesh.rotation.x = Math.PI / 2;
  tipMesh.position.z = 0.41;
  headGroup.add(tipMesh);

  const btnGeo = new THREE.CapsuleGeometry(0.025, 0.08, 4, 8);
  
  const btn1 = new THREE.Mesh(btnGeo, rubberMat);
  btn1.position.set(0, 0.08, 0.25); 
  btn1.rotation.z = Math.PI / 2; 
  btn1.scale.set(1, 1, 0.5); 
  headGroup.add(btn1);
  
  const btn2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), rubberMat);
  btn2.position.set(0, 0.08, 0.12);
  btn2.rotation.z = Math.PI / 2;
  btn2.scale.set(1, 1, 0.5);
  headGroup.add(btn2);

  swivelGroup.add(headGroup);
  
  scene.add(faucetGroup);

  // Return the tip mesh to track position for water particles
  return { tipMesh: headGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry' && c.material.color.getHex() === 0x111111) || headGroup };
};

