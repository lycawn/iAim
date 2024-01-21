/**
 * IMPORTANT: Loading glTF models into a Three.js scene is a lot of work.
 * Before we can configure or animate our model’s meshes, we need to iterate through
 * each part of our model’s meshes and save them separately.
 *
 * But luckily there is an app that turns gltf or glb files into jsx components
 * For this model, visit https://gltf.pmnd.rs/
 * And get the code. And then add the rest of the things.
 * YOU DON'T HAVE TO WRITE EVERYTHING FROM SCRATCH
 */

import { a } from '@react-spring/three';
import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import islandScene from './assets/ghost_kitty.glb';

export function GhostKitty({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  // Get access to the Three.js renderer and viewport
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(islandScene);

  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;
  const autoRotation = useRef(0.005 * Math.PI);
  // Handle pointer (mouse or touch) down event
  const handlePointerDown = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    // Calculate the clientX based on whether it's a touch event or a mouse event
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;

    // Store the current clientX position for reference
    lastX.current = clientX;
  };
  useEffect(() => {
    if (isRotating) {
      autoRotation.current = 0.005 * Math.PI; // Reset auto-rotation speed
    }
  }, [isRotating]);

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  // Handle pointer (mouse or touch) move event
  const handlePointerMove = event => {
    event.stopPropagation();
    event.preventDefault();
    if (isRotating) {
      // If rotation is enabled, calculate the change in clientX position
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;

      // calculate the change in the horizontal position of the mouse cursor or touch input,
      // relative to the viewport's width
      const delta = (clientX - lastX.current) / viewport.width;

      // Update the island's rotation based on the mouse/touch movement
      islandRef.current.rotation.y += delta * 0.01 * Math.PI;

      // Update the reference for the last clientX position
      lastX.current = clientX;

      // Update the rotation speed
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  };
  useFrame(() => {
    // If not rotating and auto-rotation is enabled, apply auto-rotation
    if (!isRotating && autoRotation.current !== 0) {
      // Update the island's rotation based on the auto-rotation
      islandRef.current.rotation.y += autoRotation.current;
    }

    // ... (previous code)

    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.y;

      // ... (previous code)
    }
  });
  // Handle keydown events
  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === 'ArrowRight') {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y -= 0.005 * Math.PI;
      rotationSpeed.current = -0.057;
    }
  };

  // Handle keyup events
  const handleKeyUp = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      setIsRotating(false);
    }
  };

  useEffect(() => {
    // Add event listeners for pointer and keyboard events
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating, apply damping to slow down the rotation (smoothly)
    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.y;

      /**
       * Normalize the rotation value to ensure it stays within the range [0, 2 * Math.PI].
       * The goal is to ensure that the rotation value remains within a specific range to
       * prevent potential issues with very large or negative rotation values.
       *  Here's a step-by-step explanation of what this code does:
       *  1. rotation % (2 * Math.PI) calculates the remainder of the rotation value when divided
       *     by 2 * Math.PI. This essentially wraps the rotation value around once it reaches a
       *     full circle (360 degrees) so that it stays within the range of 0 to 2 * Math.PI.
       *  2. (rotation % (2 * Math.PI)) + 2 * Math.PI adds 2 * Math.PI to the result from step 1.
       *     This is done to ensure that the value remains positive and within the range of
       *     0 to 2 * Math.PI even if it was negative after the modulo operation in step 1.
       *  3. Finally, ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) applies another
       *     modulo operation to the value obtained in step 2. This step guarantees that the value
       *     always stays within the range of 0 to 2 * Math.PI, which is equivalent to a full
       *     circle in radians.
       */
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // Set the current stage based on the island's orientation
      switch (true) {
        case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
          setCurrentStage(4);
          break;
        case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
          setCurrentStage(3);
          break;
        case normalizedRotation >= 1.4 && normalizedRotation <= 2.6:
          setCurrentStage(2);
          break;
        case normalizedRotation >= 3.25 && normalizedRotation <= 4.95:
          setCurrentStage(1);
          break;
        default:
          setCurrentStage(null);
      }
    }
  });

  return (
    // {Island 3D model from: https://sketchfab.com/3d-models/foxs-islands-163b68e09fcc47618450150be7785907}
    <group ref={islandRef} {...props} dispose={null}>
      <group scale={0.15}>
        <group
          position={[-70.609, 32.768, 14.397]}
          rotation={[-Math.PI / 4, 0, 0]}
          scale={200}
        >
          <mesh
            geometry={nodes.Circle006_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle006_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <group
          position={[-50.075, 29.237, 44.344]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        >
          <mesh
            geometry={nodes.Circle001_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle001_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <group
          position={[35.027, 29.722, 63.669]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        >
          <mesh
            geometry={nodes.Circle007_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle007_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <group
          position={[58.407, 32.199, 29.895]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        >
          <mesh
            geometry={nodes.Circle003_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle003_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <group
          position={[12.098, 38.791, -64.06]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        >
          <mesh
            geometry={nodes.Circle002_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle002_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <group
          position={[-15.077, 31.155, -32.975]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        >
          <mesh
            geometry={nodes.Circle004_Base_0.geometry}
            material={materials.Base}
          />
          <mesh
            geometry={nodes.Circle004_Atlas_E_0.geometry}
            material={materials.Atlas_E}
          />
        </group>
        <mesh
          geometry={nodes.Background_Background_0.geometry}
          material={materials.Background}
          position={[0, 17.919, 5.505]}
          rotation={[0, -0.056, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane002_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[64.199, 34.895, -20.687]}
          rotation={[-1.033, 0.118, 1.399]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane003_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[47.488, 42.392, -35.182]}
          rotation={[-0.785, 0.643, -3.097]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane004_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[40.197, 30.456, -42.523]}
          rotation={[-1.562, 0.014, -3.049]}
          scale={100}
        />

        <mesh
          geometry={nodes.Roundcube_009001_Atlas_F2_0.geometry}
          material={materials.Atlas_F2}
          position={[-17.277, 162.062, -3.58]}
          rotation={[-1.61, -0.115, -0.328]}
          scale={100}
        />
        <mesh
          geometry={nodes.Roundcube021_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[28.626, 216.323, 23.584]}
          rotation={[-1.946, -0.05, 0.586]}
          scale={100}
        />
        <mesh
          geometry={nodes.Roundcube022_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[14.133, 215.434, 8.2]}
          rotation={[-Math.PI / 2, 0, 0.287]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane008_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[20.974, 206.572, 31.717]}
          rotation={[-0.714, 0.219, 0.186]}
          scale={100}
        />
        <mesh
          geometry={nodes.Roundcube010_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[14.133, 215.434, 8.2]}
          rotation={[-1.602, -0.009, 0.287]}
          scale={100}
        />
        <mesh
          geometry={nodes.Cube002_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[21.036, 212.216, 31.568]}
          rotation={[-1.936, -0.105, 0.267]}
          scale={100}
        />
        <mesh
          geometry={nodes.Roundcube023_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[14.133, 215.434, 8.2]}
          rotation={[-Math.PI / 2, 0, 0.287]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 79.783, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane011_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 79.783, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane013_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 95.459, 10.94]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane010_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 95.459, 10.94]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane009_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 94.82, 11.311]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane012_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[0, 94.82, 11.311]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane006_Atlas_E_0.geometry}
          material={materials.Atlas_E}
          position={[-22.187, 53.805, 35.353]}
          rotation={[-1.489, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Roundcube_009002_Atlas_F_0.geometry}
          material={materials.Atlas_F}
          position={[-17.277, 162.062, -3.58]}
          rotation={[-1.61, -0.115, -0.328]}
          scale={100}
        />
        <mesh
          geometry={nodes.Leaf_1001_Ext_0.geometry}
          material={materials.material}
          position={[-13.02, 50.141, 33.977]}
          rotation={[0.081, 0.518, 0.157]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane055_Ext_0.geometry}
          material={materials.material}
          position={[-73.361, 22.044, -47.618]}
          rotation={[-0.128, -0.005, 0.159]}
          scale={100}
        />
        <mesh
          geometry={nodes.Leaf_1002_Ext_0.geometry}
          material={materials.material}
          position={[-16.545, 48.228, 36.429]}
          rotation={[-0.081, 0.778, 0.513]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane014_Ext_0.geometry}
          material={materials.material}
          position={[-84.821, 23.364, -11.64]}
          rotation={[-0.137, 0.13, 0.229]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane015_Ext_0.geometry}
          material={materials.material}
          position={[20.449, 26.032, -22.102]}
          rotation={[-0.116, 0.149, 0.082]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane057_Ext_0.geometry}
          material={materials.material}
          position={[55.89, 25.755, 5.52]}
          rotation={[-0.077, 0.284, -0.057]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane058_Ext_0.geometry}
          material={materials.material}
          position={[9.652, 25.794, 15.826]}
          rotation={[0, 0, -0.302]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane016_Ext_0.geometry}
          material={materials.material}
          position={[7.994, 25.672, 16.191]}
          rotation={[0, 0, 0.195]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane017_Ext_0.geometry}
          material={materials.material}
          position={[-9.921, 25.914, 34.85]}
          rotation={[0.264, 0.916, -0.49]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane059_Ext_0.geometry}
          material={materials.material}
          position={[-10.388, 25.774, 35.847]}
          rotation={[0.264, 0.916, 0.006]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane018_Ext_0.geometry}
          material={materials.material}
          position={[-35.23, 25.8, -15.227]}
          rotation={[0, 0, -0.302]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane019_Ext_0.geometry}
          material={materials.material}
          position={[-37.067, 25.666, -14.823]}
          rotation={[0, 0, 0.195]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane031_Ext_0.geometry}
          material={materials.material}
          position={[-46.354, 22.973, -74.421]}
          rotation={[-0.199, -0.043, -0.091]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane032_Ext_0.geometry}
          material={materials.material}
          position={[-48.138, 23.07, -73.998]}
          rotation={[-0.199, -0.043, 0.405]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane029_Ext_0.geometry}
          material={materials.material}
          position={[13.63, 17.28, -105.87]}
          rotation={[-0.208, -0.201, -0.311]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane030_Ext_0.geometry}
          material={materials.material}
          position={[11.843, 17.7, -105.798]}
          rotation={[-0.208, -0.201, 0.185]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane033_Ext_0.geometry}
          material={materials.material}
          position={[86.412, 15.894, -68.632]}
          rotation={[-0.209, -0.151, -0.578]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane034_Ext_0.geometry}
          material={materials.material}
          position={[85.064, 16.767, -68.541]}
          rotation={[-0.183, -0.183, 0.078]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane025_Ext_0.geometry}
          material={materials.material}
          position={[110.981, 15.433, -14.318]}
          rotation={[0.089, 0.3, -0.601]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane026_Ext_0.geometry}
          material={materials.material}
          position={[109.156, 16.459, -13.179]}
          rotation={[0.115, 0.268, -0.109]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane022_Ext_0.geometry}
          material={materials.material}
          position={[113.165, 14.376, -14.529]}
          rotation={[0.115, 0.268, -1.053]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane023_Ext_0.geometry}
          material={materials.material}
          position={[26.145, 15.947, 107.164]}
          rotation={[0.2, 0, -0.302]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane024_Ext_0.geometry}
          material={materials.material}
          position={[24.486, 15.756, 107.498]}
          rotation={[0.2, 0, 0.195]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane035_Ext_0.geometry}
          material={materials.material}
          position={[-45.833, 17.665, 96.056]}
          rotation={[-0.01, -0.401, -0.091]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane036_Ext_0.geometry}
          material={materials.material}
          position={[-47.446, 17.198, 95.773]}
          rotation={[-0.01, -0.401, 0.405]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane027_Ext_0.geometry}
          material={materials.material}
          position={[-112.883, 14.289, 19.255]}
          rotation={[0.045, -0.073, 0.247]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane028_Ext_0.geometry}
          material={materials.material}
          position={[-114.619, 13.052, 19.535]}
          rotation={[0.045, -0.073, 0.743]}
          scale={100}
        />
        <mesh
          geometry={nodes.Circle010_Base_0.geometry}
          material={materials.Base}
          position={[0, -0.383, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane020_Ext_0.geometry}
          material={materials.material}
          position={[-8.271, 25.746, 51.374]}
          rotation={[0.175, -0.033, -0.184]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane021_Ext_0.geometry}
          material={materials.material}
          position={[-8.704, 25.828, 51.374]}
          rotation={[0.175, 0.033, 0.184]}
          scale={14.82}
        />
        <mesh
          geometry={nodes.Plane060_Ext_0.geometry}
          material={materials.material}
          position={[30.099, 24.702, 70.97]}
          rotation={[0.175, -0.033, -0.184]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane061_Ext_0.geometry}
          material={materials.material}
          position={[29.666, 24.784, 70.97]}
          rotation={[0.175, 0.033, 0.184]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane062_Ext_0.geometry}
          material={materials.material}
          position={[-42.927, 25.717, 36.099]}
          rotation={[0.173, -0.039, -0.218]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane063_Ext_0.geometry}
          material={materials.material}
          position={[-43.357, 25.813, 36.099]}
          rotation={[0.176, 0.027, 0.15]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane064_Ext_0.geometry}
          material={materials.material}
          position={[-38.308, 17.453, 99.402]}
          rotation={[0.173, -0.039, -0.218]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane065_Ext_0.geometry}
          material={materials.material}
          position={[-38.738, 17.549, 99.402]}
          rotation={[0.176, 0.027, 0.15]}
          scale={14.82}
        />
        <mesh
          geometry={nodes.Plane066_Ext_0.geometry}
          material={materials.material}
          position={[44.44, 17.442, 97.024]}
          rotation={[0.178, 0.238, -0.267]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane068_Ext_0.geometry}
          material={materials.material}
          position={[-98.495, 17.317, 40.621]}
          rotation={[0.091, 0.283, 0.069]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane069_Ext_0.geometry}
          material={materials.material}
          position={[-98.917, 17.275, 40.74]}
          rotation={[0.074, 0.346, 0.442]}
          scale={14.82}
        />
        <mesh
          geometry={nodes.Plane056_Ext_0.geometry}
          material={materials.material}
          position={[-98.486, 19.815, -16.618]}
          rotation={[-0.153, -0.082, 0.012]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane070_Ext_0.geometry}
          material={materials.material}
          position={[-98.925, 19.804, -16.653]}
          rotation={[-0.166, -0.018, 0.379]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane071_Ext_0.geometry}
          material={materials.material}
          position={[-28.469, 25.643, -53.836]}
          rotation={[-0.163, -0.061, -0.124]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane072_Ext_0.geometry}
          material={materials.material}
          position={[-28.905, 25.692, -53.871]}
          rotation={[-0.167, 0.005, 0.243]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane073_Ext_0.geometry}
          material={materials.material}
          position={[-28.469, 16.763, -105.465]}
          rotation={[-0.163, -0.061, -0.124]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane074_Ext_0.geometry}
          material={materials.material}
          position={[-28.905, 16.812, -105.5]}
          rotation={[-0.167, 0.005, 0.243]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane075_Ext_0.geometry}
          material={materials.material}
          position={[66.201, 15.14, -90.379]}
          rotation={[-0.426, -0.618, -0.353]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane076_Ext_0.geometry}
          material={materials.material}
          position={[65.864, 15.179, -90.66]}
          rotation={[-0.413, -0.553, 0.022]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane077_Ext_0.geometry}
          material={materials.material}
          position={[71.561, 25.261, 2.445]}
          rotation={[-0.113, 0.085, -0.065]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane078_Ext_0.geometry}
          material={materials.material}
          position={[71.123, 25.293, 2.479]}
          rotation={[-0.121, 0.151, 0.304]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane079_Ext_0.geometry}
          material={materials.material}
          position={[105.027, 12.671, 52.96]}
          rotation={[-0.011, -0.23, -0.354]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane081_Ext_0.geometry}
          material={materials.material}
          position={[22.727, 24.952, -68.828]}
          rotation={[0, -0.593, -0.26]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane082_Ext_0.geometry}
          material={materials.material}
          position={[22.374, 25.065, -69.066]}
          rotation={[0.006, -0.527, 0.111]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane007_Ext_0.geometry}
          material={materials.material}
          position={[-112.785, 191.612, -117.439]}
          scale={69.715}
        />
        <mesh
          geometry={nodes.Plane037_Ext_0.geometry}
          material={materials.material}
          position={[-67.76, 223.229, -115.037]}
          scale={50.299}
        />
        <mesh
          geometry={nodes.Plane038_Ext_0.geometry}
          material={materials.material}
          position={[35.797, 303.247, -119.881]}
          scale={75.791}
        />
        <mesh
          geometry={nodes.Plane039_Ext_0.geometry}
          material={materials.material}
          position={[50.386, 266.756, -117.089]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane040_Ext_0.geometry}
          material={materials.material}
          position={[0.924, 264.887, -119.502]}
          scale={58.558}
        />
        <mesh
          geometry={nodes.Plane041_Ext_0.geometry}
          material={materials.material}
          position={[-88.672, 287.525, -132.869]}
          scale={62.94}
        />
        <mesh
          geometry={nodes.Plane042_Ext_0.geometry}
          material={materials.material}
          position={[-114.146, 247.349, -123.824]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane043_Ext_0.geometry}
          material={materials.material}
          position={[-135.648, 289.366, -133.495]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane044_Ext_0.geometry}
          material={materials.material}
          position={[81.082, 229.211, -122.165]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane045_Ext_0.geometry}
          material={materials.material}
          position={[-47.331, 262.361, -126.445]}
          scale={28.844}
        />
        <mesh
          geometry={nodes.Plane046_Ext_0.geometry}
          material={materials.material}
          position={[49.571, 185.842, -125.921]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane047_Ext_0.geometry}
          material={materials.material}
          position={[15.398, 218.092, -136.917]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane051_Ext_0.geometry}
          material={materials.material}
          position={[-14.425, 345.513, -115.769]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane052_Ext_0.geometry}
          material={materials.material}
          position={[-39.509, 311.935, -120.497]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane053_Ext_0.geometry}
          material={materials.material}
          position={[-86.888, 349.917, -131.806]}
          scale={161.499}
        />
        <mesh
          geometry={nodes.Plane048_Ext_0.geometry}
          material={materials.material}
          position={[-169.625, 142.963, -120.52]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane049_Ext_0.geometry}
          material={materials.material}
          position={[-158.339, 226.254, -132.989]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane050_Ext_0.geometry}
          material={materials.material}
          position={[-170.725, 181.506, -125.68]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane054_Ext_0.geometry}
          material={materials.material}
          position={[-188.101, 215.461, -133.495]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane083_Ext_0.geometry}
          material={materials.material}
          position={[98.73, 179.037, -116.051]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane084_Ext_0.geometry}
          material={materials.material}
          position={[118.526, 279.508, -127.363]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane085_Ext_0.geometry}
          material={materials.material}
          position={[62.186, 132.749, -131.796]}
          scale={100}
        />
        <mesh
          geometry={nodes['Cat-Brujo002_Atlas_E_0'].geometry}
          material={materials.Atlas_E}
          position={[14.868, 226.518, 6.884]}
          rotation={[-1.602, -0.009, -2.855]}
          scale={[15.385, 16.437, 15.388]}
        />
        <mesh
          geometry={nodes.Plane086_Ext_0.geometry}
          material={materials.material}
          position={[-164.704, 325.313, -117.439]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane087_Ext_0.geometry}
          material={materials.material}
          position={[20.388, 394.462, -132.869]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane088_Ext_0.geometry}
          material={materials.material}
          position={[-166.065, 373.007, -123.824]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane089_Ext_0.geometry}
          material={materials.material}
          position={[-99.25, 394.022, -126.445]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane090_Ext_0.geometry}
          material={materials.material}
          position={[94.464, 316.961, -120.497]}
          scale={100}
        />
        <mesh
          geometry={nodes.Plane091_Ext_0.geometry}
          material={materials.material}
          position={[70.114, 359.526, -131.806]}
          scale={100}
        />
      </group>
    </group>
  );
}
export default GhostKitty;
