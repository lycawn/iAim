import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';

import birdScene from '../assets/baby_dragon.glb';

// 3D Model from: https://sketchfab.com/3d-models/phoenix-bird-844ba0cf144a413ea92c779f18912042
export function Dragon() {
  const birdRef = useRef();

  // Load the 3D model and animations from the provided GLTF file
  const { scene, animations } = useGLTF(birdScene);

  // Get access to the animations for the bird
  const { actions } = useAnimations(animations, birdRef);

  // Play the "Take 001" animation when the component mounts
  // Note: Animation names can be found on the Sketchfab website where the 3D model is hosted.

  return (
    // to create and display 3D objects
    <mesh
      ref={birdRef}
      position={[15, 6, -21]}
      scale={[30.003, 30.003, 30.003]}
    >
      <primitive object={scene} />
    </mesh>
  );
}
export default Dragon;
