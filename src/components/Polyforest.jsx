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

import islandScene from './assets/poly-forest.glb';

export function Polyforest({
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
    <a.group ref={islandRef} {...props}>
      <group {...props} dispose={null}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={5.132}>
          <group rotation={[Math.PI / 2, 0, 0]}>
            <group
              position={[10, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.05}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5340.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5342.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[11, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.05}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5344.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5346.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[1.423, 0, -4.146]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.065}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5348.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5350.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-0.8, -0.251, -3]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.097}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5352.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5354.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-3.1, -0.335, -1.5]}
              rotation={[Math.PI / 2, 0, -1.222]}
              scale={0.091}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5356.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5358.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-3.101, -0.147, 0.242]}
              rotation={[Math.PI / 2, 0, -1.658]}
              scale={0.07}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5360.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5362.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[3.1, -0.099, -2.1]}
              rotation={[Math.PI / 2, 0, -0.611]}
              scale={0.05}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5364.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5366.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[2.782, -0.31, -3.256]}
              rotation={[Math.PI / 2, 0, -0.7]}
              scale={0.083}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5368.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5370.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[0.126, 0, -4.628]}
              rotation={[Math.PI / 2, 0, -0.7]}
              scale={0.104}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5372.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5374.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-1.673, -0.278, -4.062]}
              rotation={[Math.PI / 2, 0, -0.525]}
              scale={[0.116, 0.116, 0.115]}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5376.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5378.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-4.263, -0.166, -0.649]}
              rotation={[Math.PI / 2, 0, -0.7]}
              scale={0.065}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5380.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5382.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[2.8, -0.322, -0.8]}
              rotation={[Math.PI / 2, 0, -0.002]}
              scale={0.097}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5384.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5386.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[3.194, -0.269, 0.328]}
              rotation={[Math.PI / 2, 0, 2.965]}
              scale={0.07}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5388.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5390.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-1.6, -0.171, 2.5]}
              rotation={[Math.PI / 2, 0, -0.611]}
              scale={0.07}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5392.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5394.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-0.1, -0.132, 2.9]}
              rotation={[Math.PI / 2, 0, -1.833]}
              scale={0.081}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5396.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5398.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-3.522, -0.326, 1.48]}
              rotation={[Math.PI / 2, 0, -2.485]}
              scale={0.118}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5400.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5402.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-3.086, -0.147, 2.78]}
              rotation={[Math.PI / 2, 0, 2.88]}
              scale={0.105}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5404.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5406.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-2.909, -0.147, -3.306]}
              rotation={[Math.PI / 2, 0, 2.356]}
              scale={0.091}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5408.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5410.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[1.635, -0.31, -2.012]}
              rotation={[Math.PI / 2, 0, -1.398]}
              scale={0.083}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5412.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5414.geometry}
                material={materials.Leaves}
                position={[-9.564, 30.97, 0]}
                rotation={[0, 0, -0.698]}
              />
            </group>
            <group
              position={[-4.328, -0.096, -0.411]}
              rotation={[Math.PI / 2, 0, -1.658]}
              scale={0.099}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5416.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5418.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[-3.835, -0.068, -2.814]}
              rotation={[Math.PI / 2, 0, 0.412]}
              scale={0.099}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5420.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5422.geometry}
                material={materials.Leaves}
              />
            </group>
            <group
              position={[1.362, -0.251, -2.144]}
              rotation={[Math.PI / 2, 0, -0.873]}
              scale={0.097}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5424.geometry}
                material={materials.Bark}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_5426.geometry}
                material={materials.Leaves}
                rotation={[0, 0, -0.873]}
              />
            </group>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4.geometry}
              material={materials.Bark}
              position={[-2.891, -0.106, 1.327]}
              rotation={[Math.PI / 2, 0, -1.573]}
              scale={0.077}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_6.geometry}
              material={materials.Grass_C}
              position={[8.986, 0, 0]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_8.geometry}
              material={materials.Grass_C}
              position={[8.545, 0, 0]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_10.geometry}
              material={materials.Grass_C}
              position={[2.049, -0.058, 4.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_12.geometry}
              material={materials.Grass_C}
              position={[1.322, -0.019, 4.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_14.geometry}
              material={materials.Grass_C}
              position={[1.254, -0.018, 4.429]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_16.geometry}
              material={materials.Grass_C}
              position={[1.182, -0.018, 4.394]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_18.geometry}
              material={materials.Grass_C}
              position={[1.944, -0.061, 4.17]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_20.geometry}
              material={materials.Grass_C}
              position={[2.096, -0.075, 4.041]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_22.geometry}
              material={materials.Grass_C}
              position={[2.123, -0.074, 4.099]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_24.geometry}
              material={materials.Grass_C}
              position={[2.05, -0.07, 4.113]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_26.geometry}
              material={materials.Grass_C}
              position={[2.074, -0.067, 4.199]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_28.geometry}
              material={materials.Grass_C}
              position={[2.792, -0.069, 3.748]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_30.geometry}
              material={materials.Grass_C}
              position={[2.59, -0.086, 3.746]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_32.geometry}
              material={materials.Grass_C}
              position={[2.689, -0.076, 3.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_34.geometry}
              material={materials.Grass_C}
              position={[2.69, -0.081, 3.804]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_36.geometry}
              material={materials.Grass_C}
              position={[2.724, -0.069, 3.639]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_38.geometry}
              material={materials.Grass_C}
              position={[2.6, -0.089, 3.807]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_40.geometry}
              material={materials.Grass_C}
              position={[3.894, 0.115, 2.518]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_42.geometry}
              material={materials.Grass_C}
              position={[3.921, 0.098, 2.351]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_44.geometry}
              material={materials.Grass_C}
              position={[3.866, 0.096, 2.373]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_46.geometry}
              material={materials.Grass_C}
              position={[3.975, 0.099, 2.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_48.geometry}
              material={materials.Grass_C}
              position={[4.042, 0.088, 2.182]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_50.geometry}
              material={materials.Grass_C}
              position={[3.951, 0.086, 2.227]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_52.geometry}
              material={materials.Grass_C}
              position={[3.868, 0.115, 2.528]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_54.geometry}
              material={materials.Grass_C}
              position={[3.64, -0.04, -2.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_56.geometry}
              material={materials.Grass_C}
              position={[3.56, -0.025, -2.802]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_58.geometry}
              material={materials.Grass_C}
              position={[-3.078, -0.049, -2.855]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_60.geometry}
              material={materials.Grass_C}
              position={[-3.01, -0.042, -2.927]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_62.geometry}
              material={materials.Grass_C}
              position={[0.847, -0.033, 4.111]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_64.geometry}
              material={materials.Grass_C}
              position={[1.168, -0.043, 4.021]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_66.geometry}
              material={materials.Grass_C}
              position={[1.142, -0.033, 4.135]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_68.geometry}
              material={materials.Grass_C}
              position={[1.661, -0.07, 3.899]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_70.geometry}
              material={materials.Grass_C}
              position={[1.875, -0.088, 3.791]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_72.geometry}
              material={materials.Grass_C}
              position={[1.939, -0.084, 3.841]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_74.geometry}
              material={materials.Grass_C}
              position={[1.938, -0.09, 3.786]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_76.geometry}
              material={materials.Grass_C}
              position={[1.68, -0.066, 3.944]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_78.geometry}
              material={materials.Grass_C}
              position={[1.897, -0.076, 3.9]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_80.geometry}
              material={materials.Grass_C}
              position={[1.695, -0.067, 3.94]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_82.geometry}
              material={materials.Grass_C}
              position={[1.916, -0.079, 3.878]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_84.geometry}
              material={materials.Grass_C}
              position={[1.774, -0.075, 3.888]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_86.geometry}
              material={materials.Grass_C}
              position={[2.446, -0.108, 3.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_88.geometry}
              material={materials.Grass_C}
              position={[2.574, -0.09, 3.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_90.geometry}
              material={materials.Grass_C}
              position={[2.56, -0.089, 3.47]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_92.geometry}
              material={materials.Grass_C}
              position={[2.431, -0.103, 3.557]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_94.geometry}
              material={materials.Grass_C}
              position={[2.44, -0.106, 3.456]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_96.geometry}
              material={materials.Grass_C}
              position={[2.396, -0.11, 3.489]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_98.geometry}
              material={materials.Grass_C}
              position={[2.446, -0.103, 3.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_100.geometry}
              material={materials.Grass_C}
              position={[2.443, -0.105, 3.481]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_102.geometry}
              material={materials.Grass_C}
              position={[2.666, -0.087, 3.288]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_104.geometry}
              material={materials.Grass_C}
              position={[2.649, -0.081, 3.382]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_106.geometry}
              material={materials.Grass_C}
              position={[2.419, -0.102, 3.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_108.geometry}
              material={materials.Grass_C}
              position={[3.05, -0.021, 3.002]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_110.geometry}
              material={materials.Grass_C}
              position={[3.184, 0.002, 2.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_112.geometry}
              material={materials.Grass_C}
              position={[3.121, -0.006, 2.966]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_114.geometry}
              material={materials.Grass_C}
              position={[3.152, -0.009, 2.841]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_116.geometry}
              material={materials.Grass_C}
              position={[3.136, -0.002, 2.962]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_118.geometry}
              material={materials.Grass_C}
              position={[3.213, 0.018, 2.944]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_120.geometry}
              material={materials.Grass_C}
              position={[3.225, -0.002, 2.72]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_122.geometry}
              material={materials.Grass_C}
              position={[3.063, -0.027, 2.9]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_124.geometry}
              material={materials.Grass_C}
              position={[3.062, -0.024, 2.931]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_126.geometry}
              material={materials.Grass_C}
              position={[3.272, 0.024, 2.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_128.geometry}
              material={materials.Grass_C}
              position={[3.133, -0.022, 2.767]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_130.geometry}
              material={materials.Grass_C}
              position={[3.667, 0.028, 2.176]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_132.geometry}
              material={materials.Grass_C}
              position={[3.692, 0.052, 2.28]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_134.geometry}
              material={materials.Grass_C}
              position={[3.585, 0.022, 2.247]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_136.geometry}
              material={materials.Grass_C}
              position={[3.599, 0.023, 2.235]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_138.geometry}
              material={materials.Grass_C}
              position={[3.639, 0.043, 2.294]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_140.geometry}
              material={materials.Grass_C}
              position={[3.613, 0.024, 2.223]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_142.geometry}
              material={materials.Grass_C}
              position={[4.026, -0.026, 1.539]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_144.geometry}
              material={materials.Grass_C}
              position={[3.988, -0.058, 1.358]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_146.geometry}
              material={materials.Grass_C}
              position={[4.053, -0.05, 1.373]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_148.geometry}
              material={materials.Grass_C}
              position={[4.021, -0.056, 1.349]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_150.geometry}
              material={materials.Grass_C}
              position={[4.074, -0.025, 1.513]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_152.geometry}
              material={materials.Grass_C}
              position={[3.9, -0.03, 1.614]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_154.geometry}
              material={materials.Grass_C}
              position={[4.129, -0.06, 1.264]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_156.geometry}
              material={materials.Grass_C}
              position={[4.025, -0.056, 1.347]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_158.geometry}
              material={materials.Grass_C}
              position={[4.106, -0.043, 1.387]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_160.geometry}
              material={materials.Grass_C}
              position={[4.013, -0.011, 1.638]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_162.geometry}
              material={materials.Grass_C}
              position={[4.088, -0.038, 1.424]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_164.geometry}
              material={materials.Grass_C}
              position={[4.055, -0.032, 1.484]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_166.geometry}
              material={materials.Grass_C}
              position={[4.146, -0.1, 0.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_168.geometry}
              material={materials.Grass_C}
              position={[4.146, -0.1, -1.183]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_170.geometry}
              material={materials.Grass_C}
              position={[3.921, -0.097, -1.896]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_172.geometry}
              material={materials.Grass_C}
              position={[3.799, -0.093, -1.98]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_174.geometry}
              material={materials.Grass_C}
              position={[3.942, -0.099, -1.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_176.geometry}
              material={materials.Grass_C}
              position={[3.72, -0.091, -1.916]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_178.geometry}
              material={materials.Grass_C}
              position={[3.459, -0.033, -2.557]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_180.geometry}
              material={materials.Grass_C}
              position={[3.43, -0.031, -2.544]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_182.geometry}
              material={materials.Grass_C}
              position={[3.364, -0.016, -2.655]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_184.geometry}
              material={materials.Grass_C}
              position={[3.244, -0.005, -2.651]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_186.geometry}
              material={materials.Grass_C}
              position={[3.355, -0.028, -2.491]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_188.geometry}
              material={materials.Grass_C}
              position={[2.96, 0.039, -3.079]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_190.geometry}
              material={materials.Grass_C}
              position={[2.758, 0.048, -3.197]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_192.geometry}
              material={materials.Grass_C}
              position={[2.9, 0.042, -3.155]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_194.geometry}
              material={materials.Grass_C}
              position={[2.676, 0.052, -3.239]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_196.geometry}
              material={materials.Grass_C}
              position={[2.926, 0.04, -3.072]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_198.geometry}
              material={materials.Grass_C}
              position={[2.213, 0.025, -3.573]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_200.geometry}
              material={materials.Grass_C}
              position={[2.121, 0.016, -3.625]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_202.geometry}
              material={materials.Grass_C}
              position={[-0.338, -0.04, -3.971]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_204.geometry}
              material={materials.Grass_C}
              position={[-0.05, -0.014, -4.036]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_206.geometry}
              material={materials.Grass_C}
              position={[-0.233, -0.04, -3.896]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_208.geometry}
              material={materials.Grass_C}
              position={[-0.339, -0.038, -3.991]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_210.geometry}
              material={materials.Grass_C}
              position={[-0.955, -0.092, -3.824]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_212.geometry}
              material={materials.Grass_C}
              position={[-1.674, -0.066, -3.625]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_214.geometry}
              material={materials.Grass_C}
              position={[-1.717, -0.065, -3.591]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_216.geometry}
              material={materials.Grass_C}
              position={[-1.562, -0.074, -3.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_218.geometry}
              material={materials.Grass_C}
              position={[-1.629, -0.087, -3.522]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_220.geometry}
              material={materials.Grass_C}
              position={[-1.782, -0.081, -3.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_222.geometry}
              material={materials.Grass_C}
              position={[-1.714, -0.084, -3.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_224.geometry}
              material={materials.Grass_C}
              position={[-2.159, -0.077, -3.186]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_226.geometry}
              material={materials.Grass_C}
              position={[-2.339, -0.064, -3.134]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_228.geometry}
              material={materials.Grass_C}
              position={[-2.312, -0.066, -3.14]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_230.geometry}
              material={materials.Grass_C}
              position={[-2.906, -0.081, -2.693]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_232.geometry}
              material={materials.Grass_C}
              position={[-2.948, -0.111, -2.488]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_234.geometry}
              material={materials.Grass_C}
              position={[-2.829, -0.111, -2.58]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_236.geometry}
              material={materials.Grass_C}
              position={[-2.856, -0.091, -2.67]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_238.geometry}
              material={materials.Grass_C}
              position={[-2.762, -0.099, -2.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_240.geometry}
              material={materials.Grass_C}
              position={[-2.839, -0.096, -2.655]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_242.geometry}
              material={materials.Grass_C}
              position={[-2.921, -0.102, -2.563]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_244.geometry}
              material={materials.Grass_C}
              position={[-3.049, -0.091, -2.546]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_246.geometry}
              material={materials.Grass_C}
              position={[-3.302, -0.081, -2.201]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_248.geometry}
              material={materials.Grass_C}
              position={[-3.746, 0.019, -1.2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_250.geometry}
              material={materials.Grass_C}
              position={[-3.574, -0.01, -1.465]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_252.geometry}
              material={materials.Grass_C}
              position={[-3.743, 0.022, -1.362]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_254.geometry}
              material={materials.Grass_C}
              position={[-3.752, 0.021, -1.224]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_256.geometry}
              material={materials.Grass_C}
              position={[-3.642, 0.004, -1.483]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_258.geometry}
              material={materials.Grass_C}
              position={[-3.7, 0.017, -1.522]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_260.geometry}
              material={materials.Grass_C}
              position={[-3.854, -0.098, 0.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_262.geometry}
              material={materials.Grass_C}
              position={[-3.812, -0.081, 1.083]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_264.geometry}
              material={materials.Grass_C}
              position={[-3.119, 0.094, 2.373]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_266.geometry}
              material={materials.Grass_C}
              position={[-3.125, 0.081, 2.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_268.geometry}
              material={materials.Grass_C}
              position={[-2.996, 0.091, 2.402]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_270.geometry}
              material={materials.Grass_C}
              position={[-3.18, 0.077, 2.163]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_272.geometry}
              material={materials.Grass_C}
              position={[-2.815, 0.087, 2.829]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_274.geometry}
              material={materials.Grass_C}
              position={[-2.513, 0.037, 3.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_276.geometry}
              material={materials.Grass_C}
              position={[-0.66, -0.071, 3.876]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_278.geometry}
              material={materials.Grass_C}
              position={[-0.748, -0.071, 3.865]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_280.geometry}
              material={materials.Grass_C}
              position={[-0.558, -0.07, 3.918]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_282.geometry}
              material={materials.Grass_C}
              position={[-0.485, -0.077, 3.799]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_284.geometry}
              material={materials.Grass_C}
              position={[-0.644, -0.072, 3.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_286.geometry}
              material={materials.Grass_C}
              position={[-0.573, -0.075, 3.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_288.geometry}
              material={materials.Grass_C}
              position={[-0.523, -0.071, 3.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_290.geometry}
              material={materials.Grass_C}
              position={[-0.663, -0.072, 3.855]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_292.geometry}
              material={materials.Grass_C}
              position={[-0.643, -0.071, 3.894]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_294.geometry}
              material={materials.Grass_C}
              position={[-0.75, -0.07, 3.882]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_296.geometry}
              material={materials.Grass_C}
              position={[-0.652, -0.071, 3.883]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_298.geometry}
              material={materials.Grass_C}
              position={[-0.597, -0.07, 3.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_300.geometry}
              material={materials.Grass_C}
              position={[-0.467, -0.077, 3.8]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_302.geometry}
              material={materials.Grass_C}
              position={[-0.421, -0.077, 3.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_304.geometry}
              material={materials.Grass_C}
              position={[0.372, -0.063, 3.834]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_306.geometry}
              material={materials.Grass_C}
              position={[0.149, -0.068, 3.848]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_308.geometry}
              material={materials.Grass_C}
              position={[0.084, -0.061, 3.984]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_310.geometry}
              material={materials.Grass_C}
              position={[0.294, -0.066, 3.817]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_312.geometry}
              material={materials.Grass_C}
              position={[0.061, -0.063, 3.956]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_314.geometry}
              material={materials.Grass_C}
              position={[0.18, -0.06, 3.947]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_316.geometry}
              material={materials.Grass_C}
              position={[0.129, -0.063, 3.927]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_318.geometry}
              material={materials.Grass_C}
              position={[0.36, -0.061, 3.876]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_320.geometry}
              material={materials.Grass_C}
              position={[0.181, -0.064, 3.898]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_322.geometry}
              material={materials.Grass_C}
              position={[0.383, -0.057, 3.918]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_324.geometry}
              material={materials.Grass_C}
              position={[0.251, -0.057, 3.97]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_326.geometry}
              material={materials.Grass_C}
              position={[0.295, -0.063, 3.87]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_328.geometry}
              material={materials.Grass_C}
              position={[0.127, -0.066, 3.877]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_330.geometry}
              material={materials.Grass_C}
              position={[0.858, -0.054, 3.892]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_332.geometry}
              material={materials.Grass_C}
              position={[1.035, -0.087, 3.693]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_334.geometry}
              material={materials.Grass_C}
              position={[0.772, -0.066, 3.791]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_336.geometry}
              material={materials.Grass_C}
              position={[1.009, -0.079, 3.737]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_338.geometry}
              material={materials.Grass_C}
              position={[1.056, -0.075, 3.768]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_340.geometry}
              material={materials.Grass_C}
              position={[1.594, -0.11, 3.625]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_342.geometry}
              material={materials.Grass_C}
              position={[1.63, -0.12, 3.574]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_344.geometry}
              material={materials.Grass_C}
              position={[1.731, -0.122, 3.559]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_346.geometry}
              material={materials.Grass_C}
              position={[2.492, -0.156, 3.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_348.geometry}
              material={materials.Grass_C}
              position={[2.988, -0.106, 2.574]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_350.geometry}
              material={materials.Grass_C}
              position={[2.91, -0.135, 2.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_352.geometry}
              material={materials.Grass_C}
              position={[2.945, -0.14, 2.497]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_354.geometry}
              material={materials.Grass_C}
              position={[2.843, -0.13, 2.715]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_356.geometry}
              material={materials.Grass_C}
              position={[2.894, -0.111, 2.714]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_358.geometry}
              material={materials.Grass_C}
              position={[3.417, -0.087, 1.922]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_360.geometry}
              material={materials.Grass_C}
              position={[3.376, -0.083, 2.011]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_362.geometry}
              material={materials.Grass_C}
              position={[3.644, -0.13, 1.219]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_364.geometry}
              material={materials.Grass_C}
              position={[3.664, -0.093, 1.512]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_366.geometry}
              material={materials.Grass_C}
              position={[3.721, -0.098, 1.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_368.geometry}
              material={materials.Grass_C}
              position={[3.815, -0.108, 0.462]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_370.geometry}
              material={materials.Grass_C}
              position={[3.917, -0.107, 0.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_372.geometry}
              material={materials.Grass_C}
              position={[3.783, -0.114, 0.575]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_374.geometry}
              material={materials.Grass_C}
              position={[3.873, -0.11, 0.615]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_376.geometry}
              material={materials.Grass_C}
              position={[3.809, -0.113, 0.588]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_378.geometry}
              material={materials.Grass_C}
              position={[3.879, -0.1, -0.244]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_380.geometry}
              material={materials.Grass_C}
              position={[3.978, -0.1, -0.17]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_382.geometry}
              material={materials.Grass_C}
              position={[3.928, -0.1, -0.376]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_384.geometry}
              material={materials.Grass_C}
              position={[3.816, -0.1, -0.336]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_386.geometry}
              material={materials.Grass_C}
              position={[3.689, -0.103, -1.037]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_388.geometry}
              material={materials.Grass_C}
              position={[3.884, -0.101, -0.909]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_390.geometry}
              material={materials.Grass_C}
              position={[3.778, -0.102, -1.068]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_392.geometry}
              material={materials.Grass_C}
              position={[3.556, -0.093, -1.652]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_394.geometry}
              material={materials.Grass_C}
              position={[3.124, -0.018, -2.378]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_396.geometry}
              material={materials.Grass_C}
              position={[3.21, -0.032, -2.293]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_398.geometry}
              material={materials.Grass_C}
              position={[3.078, -0.009, -2.435]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_400.geometry}
              material={materials.Grass_C}
              position={[3.067, -0.004, -2.474]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_402.geometry}
              material={materials.Grass_C}
              position={[3.129, -0.024, -2.318]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_404.geometry}
              material={materials.Grass_C}
              position={[3.211, -0.047, -2.146]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_406.geometry}
              material={materials.Grass_C}
              position={[3.098, -0.014, -2.4]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_408.geometry}
              material={materials.Grass_C}
              position={[3.168, -0.038, -2.212]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_410.geometry}
              material={materials.Grass_C}
              position={[3.131, -0.032, -2.242]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_412.geometry}
              material={materials.Grass_C}
              position={[2.594, 0.047, -2.932]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_414.geometry}
              material={materials.Grass_C}
              position={[2.492, 0.05, -2.93]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_416.geometry}
              material={materials.Grass_C}
              position={[2.783, 0.039, -2.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_418.geometry}
              material={materials.Grass_C}
              position={[2.757, 0.039, -2.804]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_420.geometry}
              material={materials.Grass_C}
              position={[2.06, 0.026, -3.345]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_422.geometry}
              material={materials.Grass_C}
              position={[1.953, 0.018, -3.356]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_424.geometry}
              material={materials.Grass_C}
              position={[2.087, 0.033, -3.231]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_426.geometry}
              material={materials.Grass_C}
              position={[1.919, 0.01, -3.495]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_428.geometry}
              material={materials.Grass_C}
              position={[1.943, 0.019, -3.322]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_430.geometry}
              material={materials.Grass_C}
              position={[0.428, -0.005, -3.977]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_432.geometry}
              material={materials.Grass_C}
              position={[0.64, -0.016, -3.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_434.geometry}
              material={materials.Grass_C}
              position={[-0.279, -0.076, -3.622]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_436.geometry}
              material={materials.Grass_C}
              position={[-0.352, -0.09, -3.566]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_438.geometry}
              material={materials.Grass_C}
              position={[-0.031, -0.055, -3.622]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_440.geometry}
              material={materials.Grass_C}
              position={[-0.221, -0.068, -3.644]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_442.geometry}
              material={materials.Grass_C}
              position={[-0.745, -0.118, -3.6]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_444.geometry}
              material={materials.Grass_C}
              position={[-1.008, -0.143, -3.47]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_446.geometry}
              material={materials.Grass_C}
              position={[-0.78, -0.134, -3.494]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_448.geometry}
              material={materials.Grass_C}
              position={[-1.691, -0.149, -3.175]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_450.geometry}
              material={materials.Grass_C}
              position={[-1.58, -0.144, -3.25]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_452.geometry}
              material={materials.Grass_C}
              position={[-1.36, -0.16, -3.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_454.geometry}
              material={materials.Grass_C}
              position={[-1.637, -0.14, -3.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_456.geometry}
              material={materials.Grass_C}
              position={[-1.45, -0.154, -3.267]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_458.geometry}
              material={materials.Grass_C}
              position={[-1.639, -0.169, -3.126]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_460.geometry}
              material={materials.Grass_C}
              position={[-1.703, -0.139, -3.207]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_462.geometry}
              material={materials.Grass_C}
              position={[-1.681, -0.155, -3.157]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_464.geometry}
              material={materials.Grass_C}
              position={[-2.015, -0.148, -3.005]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_466.geometry}
              material={materials.Grass_C}
              position={[-2.08, -0.191, -2.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_468.geometry}
              material={materials.Grass_C}
              position={[-2.076, -0.162, -2.918]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_470.geometry}
              material={materials.Grass_C}
              position={[-2.13, -0.16, -2.891]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_472.geometry}
              material={materials.Grass_C}
              position={[-2.077, -0.177, -2.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_474.geometry}
              material={materials.Grass_C}
              position={[-2.647, -0.17, -2.452]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_476.geometry}
              material={materials.Grass_C}
              position={[-2.646, -0.169, -2.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_478.geometry}
              material={materials.Grass_C}
              position={[-2.68, -0.195, -2.29]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_480.geometry}
              material={materials.Grass_C}
              position={[-2.636, -0.187, -2.38]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_482.geometry}
              material={materials.Grass_C}
              position={[-2.645, -0.166, -2.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_484.geometry}
              material={materials.Grass_C}
              position={[-3.061, -0.139, -1.952]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_486.geometry}
              material={materials.Grass_C}
              position={[-3.029, -0.15, -1.868]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_488.geometry}
              material={materials.Grass_C}
              position={[-3.062, -0.139, -1.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_490.geometry}
              material={materials.Grass_C}
              position={[-3.127, -0.126, -1.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_492.geometry}
              material={materials.Grass_C}
              position={[-3.056, -0.143, -1.836]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_494.geometry}
              material={materials.Grass_C}
              position={[-3.365, -0.065, -1.298]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_496.geometry}
              material={materials.Grass_C}
              position={[-3.431, -0.051, -1.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_498.geometry}
              material={materials.Grass_C}
              position={[-3.329, -0.075, -1.234]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_500.geometry}
              material={materials.Grass_C}
              position={[-3.319, -0.078, -1.228]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_502.geometry}
              material={materials.Grass_C}
              position={[-3.465, -0.043, -1.088]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_504.geometry}
              material={materials.Grass_C}
              position={[-3.321, -0.077, -1.272]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_506.geometry}
              material={materials.Grass_C}
              position={[-3.503, -0.053, -0.682]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_508.geometry}
              material={materials.Grass_C}
              position={[-3.558, -0.07, -0.355]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_510.geometry}
              material={materials.Grass_C}
              position={[-3.561, -0.044, -0.672]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_512.geometry}
              material={materials.Grass_C}
              position={[-3.546, -0.045, -0.69]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_514.geometry}
              material={materials.Grass_C}
              position={[-3.539, -0.105, 0.226]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_516.geometry}
              material={materials.Grass_C}
              position={[-3.64, -0.093, 0.057]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_518.geometry}
              material={materials.Grass_C}
              position={[-3.549, -0.103, 0.162]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_520.geometry}
              material={materials.Grass_C}
              position={[-3.515, -0.109, 0.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_522.geometry}
              material={materials.Grass_C}
              position={[-3.585, -0.098, 0.098]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_524.geometry}
              material={materials.Grass_C}
              position={[-3.627, -0.102, 0.333]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_526.geometry}
              material={materials.Grass_C}
              position={[-3.468, -0.09, 1.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_528.geometry}
              material={materials.Grass_C}
              position={[-3.505, -0.095, 0.935]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_530.geometry}
              material={materials.Grass_C}
              position={[-3.29, -0.037, 1.458]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_532.geometry}
              material={materials.Grass_C}
              position={[-3.269, -0.03, 1.501]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_534.geometry}
              material={materials.Grass_C}
              position={[-2.897, 0.03, 1.994]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_536.geometry}
              material={materials.Grass_C}
              position={[-2.804, 0.035, 2.103]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_538.geometry}
              material={materials.Grass_C}
              position={[-2.933, 0.05, 2.106]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_540.geometry}
              material={materials.Grass_C}
              position={[-2.86, 0.037, 2.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_542.geometry}
              material={materials.Grass_C}
              position={[-2.918, 0.057, 2.166]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_544.geometry}
              material={materials.Grass_C}
              position={[-2.883, 0.053, 2.163]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_546.geometry}
              material={materials.Grass_C}
              position={[-2.244, -0.003, 2.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_548.geometry}
              material={materials.Grass_C}
              position={[-2.317, 0.01, 2.714]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_550.geometry}
              material={materials.Grass_C}
              position={[-2.377, 0.02, 2.707]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_552.geometry}
              material={materials.Grass_C}
              position={[-2.52, 0.043, 2.644]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_554.geometry}
              material={materials.Grass_C}
              position={[-2.351, 0.016, 2.724]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_556.geometry}
              material={materials.Grass_C}
              position={[-2.452, 0.032, 2.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_558.geometry}
              material={materials.Grass_C}
              position={[-1.936, -0.045, 3.084]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_560.geometry}
              material={materials.Grass_C}
              position={[-1.724, -0.07, 3.2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_562.geometry}
              material={materials.Grass_C}
              position={[-1.889, -0.051, 3.131]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_564.geometry}
              material={materials.Grass_C}
              position={[-1.838, -0.056, 3.154]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_566.geometry}
              material={materials.Grass_C}
              position={[-2.002, -0.038, 3.015]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_568.geometry}
              material={materials.Grass_C}
              position={[-1.315, -0.087, 3.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_570.geometry}
              material={materials.Grass_C}
              position={[-1.337, -0.084, 3.349]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_572.geometry}
              material={materials.Grass_C}
              position={[-0.668, -0.087, 3.494]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_574.geometry}
              material={materials.Grass_C}
              position={[-0.502, -0.089, 3.519]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_576.geometry}
              material={materials.Grass_C}
              position={[0.251, -0.088, 3.579]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_578.geometry}
              material={materials.Grass_C}
              position={[0.058, -0.085, 3.621]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_580.geometry}
              material={materials.Grass_C}
              position={[0.276, -0.088, 3.58]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_582.geometry}
              material={materials.Grass_C}
              position={[0.005, -0.087, 3.582]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_584.geometry}
              material={materials.Grass_C}
              position={[0.313, -0.096, 3.511]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_586.geometry}
              material={materials.Grass_C}
              position={[0.726, -0.104, 3.539]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_588.geometry}
              material={materials.Grass_C}
              position={[0.709, -0.115, 3.473]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_590.geometry}
              material={materials.Grass_C}
              position={[0.738, -0.119, 3.46]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_592.geometry}
              material={materials.Grass_C}
              position={[0.838, -0.117, 3.493]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_594.geometry}
              material={materials.Grass_C}
              position={[0.814, -0.126, 3.439]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_596.geometry}
              material={materials.Grass_C}
              position={[0.737, -0.106, 3.533]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_598.geometry}
              material={materials.Grass_C}
              position={[0.814, -0.105, 3.553]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_600.geometry}
              material={materials.Grass_C}
              position={[1.439, -0.173, 3.317]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_602.geometry}
              material={materials.Grass_C}
              position={[1.554, -0.2, 3.219]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_604.geometry}
              material={materials.Grass_C}
              position={[1.606, -0.231, 3.11]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_606.geometry}
              material={materials.Grass_C}
              position={[1.502, -0.2, 3.214]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_608.geometry}
              material={materials.Grass_C}
              position={[2.021, -0.265, 2.944]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_610.geometry}
              material={materials.Grass_C}
              position={[2.29, -0.268, 2.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_612.geometry}
              material={materials.Grass_C}
              position={[2.142, -0.286, 2.825]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_614.geometry}
              material={materials.Grass_C}
              position={[3.139, -0.195, 1.859]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_616.geometry}
              material={materials.Grass_C}
              position={[3.348, -0.195, 1.232]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_618.geometry}
              material={materials.Grass_C}
              position={[3.395, -0.181, 1.267]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_620.geometry}
              material={materials.Grass_C}
              position={[3.412, -0.177, 1.271]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_622.geometry}
              material={materials.Grass_C}
              position={[3.347, -0.196, 1.199]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_624.geometry}
              material={materials.Grass_C}
              position={[3.384, -0.185, 1.256]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_626.geometry}
              material={materials.Grass_C}
              position={[3.459, -0.151, 0.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_628.geometry}
              material={materials.Grass_C}
              position={[3.596, -0.126, 0.492]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_630.geometry}
              material={materials.Grass_C}
              position={[3.518, -0.127, 0.398]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_632.geometry}
              material={materials.Grass_C}
              position={[3.604, -0.126, 0.498]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_634.geometry}
              material={materials.Grass_C}
              position={[3.563, -0.127, 0.449]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_636.geometry}
              material={materials.Grass_C}
              position={[3.619, -0.126, 0.527]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_638.geometry}
              material={materials.Grass_C}
              position={[3.501, -0.106, -0.214]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_640.geometry}
              material={materials.Grass_C}
              position={[3.596, -0.102, -0.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_642.geometry}
              material={materials.Grass_C}
              position={[3.635, -0.102, -0.285]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_644.geometry}
              material={materials.Grass_C}
              position={[3.654, -0.101, -0.017]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_646.geometry}
              material={materials.Grass_C}
              position={[3.544, -0.105, -0.261]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_648.geometry}
              material={materials.Grass_C}
              position={[3.583, -0.104, -0.343]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_650.geometry}
              material={materials.Grass_C}
              position={[3.502, -0.105, -0.128]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_652.geometry}
              material={materials.Grass_C}
              position={[3.545, -0.104, -0.042]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_654.geometry}
              material={materials.Grass_C}
              position={[3.65, -0.101, -0.05]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_656.geometry}
              material={materials.Grass_C}
              position={[3.531, -0.104, -0.062]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_658.geometry}
              material={materials.Grass_C}
              position={[3.494, -0.112, -1.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_660.geometry}
              material={materials.Grass_C}
              position={[3.504, -0.112, -0.911]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_662.geometry}
              material={materials.Grass_C}
              position={[3.447, -0.115, -0.75]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_664.geometry}
              material={materials.Grass_C}
              position={[3.485, -0.112, -0.736]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_666.geometry}
              material={materials.Grass_C}
              position={[3.284, -0.105, -1.438]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_668.geometry}
              material={materials.Grass_C}
              position={[3.276, -0.094, -1.591]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_670.geometry}
              material={materials.Grass_C}
              position={[3.219, -0.107, -1.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_672.geometry}
              material={materials.Grass_C}
              position={[3.114, -0.092, -1.642]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_674.geometry}
              material={materials.Grass_C}
              position={[3.228, -0.094, -1.609]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_676.geometry}
              material={materials.Grass_C}
              position={[2.861, -0.043, -2.057]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_678.geometry}
              material={materials.Grass_C}
              position={[2.818, -0.015, -2.262]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_680.geometry}
              material={materials.Grass_C}
              position={[2.945, -0.037, -2.126]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_682.geometry}
              material={materials.Grass_C}
              position={[2.935, -0.057, -1.97]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_684.geometry}
              material={materials.Grass_C}
              position={[2.488, 0.029, -2.573]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_686.geometry}
              material={materials.Grass_C}
              position={[2.395, 0.039, -2.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_688.geometry}
              material={materials.Grass_C}
              position={[2.37, 0.031, -2.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_690.geometry}
              material={materials.Grass_C}
              position={[2.409, 0.033, -2.625]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_692.geometry}
              material={materials.Grass_C}
              position={[2.325, 0.04, -2.719]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_694.geometry}
              material={materials.Grass_C}
              position={[2.525, 0.032, -2.608]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_696.geometry}
              material={materials.Grass_C}
              position={[2.425, 0.034, -2.643]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_698.geometry}
              material={materials.Grass_C}
              position={[2.377, 0.042, -2.744]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_700.geometry}
              material={materials.Grass_C}
              position={[0.624, -0.032, -3.598]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_702.geometry}
              material={materials.Grass_C}
              position={[0.633, -0.032, -3.583]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_704.geometry}
              material={materials.Grass_C}
              position={[0.682, -0.029, -3.628]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_706.geometry}
              material={materials.Grass_C}
              position={[-0.112, -0.118, -3.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_708.geometry}
              material={materials.Grass_C}
              position={[-0.209, -0.114, -3.303]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_710.geometry}
              material={materials.Grass_C}
              position={[-0.056, -0.114, -3.195]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_712.geometry}
              material={materials.Grass_C}
              position={[-0.011, -0.107, -3.213]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_714.geometry}
              material={materials.Grass_C}
              position={[-0.051, -0.095, -3.337]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_716.geometry}
              material={materials.Grass_C}
              position={[-0.051, -0.095, -3.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_718.geometry}
              material={materials.Grass_C}
              position={[-0.183, -0.112, -3.306]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_720.geometry}
              material={materials.Grass_C}
              position={[-0.009, -0.088, -3.355]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_722.geometry}
              material={materials.Grass_C}
              position={[-0.293, -0.135, -3.212]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_724.geometry}
              material={materials.Grass_C}
              position={[-0.128, -0.107, -3.301]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_726.geometry}
              material={materials.Grass_C}
              position={[-0.168, -0.126, -3.187]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_728.geometry}
              material={materials.Grass_C}
              position={[-1.233, -0.248, -2.945]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_730.geometry}
              material={materials.Grass_C}
              position={[-1.283, -0.241, -2.965]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_732.geometry}
              material={materials.Grass_C}
              position={[-1.493, -0.225, -2.978]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_734.geometry}
              material={materials.Grass_C}
              position={[-1.512, -0.239, -2.925]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_736.geometry}
              material={materials.Grass_C}
              position={[-1.879, -0.293, -2.597]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_738.geometry}
              material={materials.Grass_C}
              position={[-2.348, -0.294, -2.189]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_740.geometry}
              material={materials.Grass_C}
              position={[-2.375, -0.3, -2.115]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_742.geometry}
              material={materials.Grass_C}
              position={[-2.834, -0.214, -1.529]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_744.geometry}
              material={materials.Grass_C}
              position={[-2.72, -0.244, -1.661]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_746.geometry}
              material={materials.Grass_C}
              position={[-3.028, -0.155, -0.991]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_748.geometry}
              material={materials.Grass_C}
              position={[-3.047, -0.152, -1.254]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_750.geometry}
              material={materials.Grass_C}
              position={[-3.068, -0.144, -0.941]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_752.geometry}
              material={materials.Grass_C}
              position={[-3.087, -0.141, -1.173]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_754.geometry}
              material={materials.Grass_C}
              position={[-3.233, -0.11, -0.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_756.geometry}
              material={materials.Grass_C}
              position={[-3.162, -0.129, -0.556]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_758.geometry}
              material={materials.Grass_C}
              position={[-3.175, -0.132, -0.39]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_760.geometry}
              material={materials.Grass_C}
              position={[-3.14, -0.137, -0.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_762.geometry}
              material={materials.Grass_C}
              position={[-3.16, -0.129, -0.55]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_764.geometry}
              material={materials.Grass_C}
              position={[-3.175, -0.132, -0.399]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_766.geometry}
              material={materials.Grass_C}
              position={[-3.187, -0.158, 0.268]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_768.geometry}
              material={materials.Grass_C}
              position={[-3.307, -0.135, 0.254]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_770.geometry}
              material={materials.Grass_C}
              position={[-3.315, -0.131, 0.154]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_772.geometry}
              material={materials.Grass_C}
              position={[-3.326, -0.127, 0.089]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_774.geometry}
              material={materials.Grass_C}
              position={[-3.239, -0.144, 0.159]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_776.geometry}
              material={materials.Grass_C}
              position={[-3.05, -0.178, 0.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_778.geometry}
              material={materials.Grass_C}
              position={[-3.021, -0.11, 1.313]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_780.geometry}
              material={materials.Grass_C}
              position={[-2.976, -0.135, 1.26]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_782.geometry}
              material={materials.Grass_C}
              position={[-2.855, -0.105, 1.511]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_784.geometry}
              material={materials.Grass_C}
              position={[-2.87, -0.14, 1.353]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_786.geometry}
              material={materials.Grass_C}
              position={[-2.861, -0.12, 1.446]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_788.geometry}
              material={materials.Grass_C}
              position={[-2.923, -0.148, 1.261]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_790.geometry}
              material={materials.Grass_C}
              position={[-2.94, -0.148, 1.242]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_792.geometry}
              material={materials.Grass_C}
              position={[-2.726, -0.023, 1.917]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_794.geometry}
              material={materials.Grass_C}
              position={[-2.591, -0.061, 1.916]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_796.geometry}
              material={materials.Grass_C}
              position={[-2.671, -0.059, 1.844]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_798.geometry}
              material={materials.Grass_C}
              position={[-2.7, -0.031, 1.915]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_800.geometry}
              material={materials.Grass_C}
              position={[-2.598, -0.024, 2.037]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_802.geometry}
              material={materials.Grass_C}
              position={[-2.085, -0.067, 2.409]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_804.geometry}
              material={materials.Grass_C}
              position={[-2.166, -0.034, 2.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_806.geometry}
              material={materials.Grass_C}
              position={[-2.324, -0.023, 2.347]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_808.geometry}
              material={materials.Grass_C}
              position={[-2.051, -0.064, 2.472]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_810.geometry}
              material={materials.Grass_C}
              position={[-2.164, -0.045, 2.444]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_812.geometry}
              material={materials.Grass_C}
              position={[-2.282, -0.026, 2.385]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_814.geometry}
              material={materials.Grass_C}
              position={[-2.319, -0.018, 2.377]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_816.geometry}
              material={materials.Grass_C}
              position={[-1.613, -0.089, 2.914]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_818.geometry}
              material={materials.Grass_C}
              position={[-1.687, -0.094, 2.743]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_820.geometry}
              material={materials.Grass_C}
              position={[-1.637, -0.089, 2.877]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_822.geometry}
              material={materials.Grass_C}
              position={[-1.537, -0.104, 2.843]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_824.geometry}
              material={materials.Grass_C}
              position={[-1.729, -0.083, 2.804]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_826.geometry}
              material={materials.Grass_C}
              position={[-1.099, -0.097, 3.1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_828.geometry}
              material={materials.Grass_C}
              position={[-1.226, -0.106, 2.962]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_830.geometry}
              material={materials.Grass_C}
              position={[-1.138, -0.097, 3.089]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_832.geometry}
              material={materials.Grass_C}
              position={[-1.129, -0.1, 3.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_834.geometry}
              material={materials.Grass_C}
              position={[-1.012, -0.1, 3.06]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_836.geometry}
              material={materials.Grass_C}
              position={[-0.974, -0.101, 3.043]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_838.geometry}
              material={materials.Grass_C}
              position={[-1.176, -0.099, 3.065]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_840.geometry}
              material={materials.Grass_C}
              position={[-1.165, -0.103, 3.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_842.geometry}
              material={materials.Grass_C}
              position={[-0.413, -0.099, 3.151]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_844.geometry}
              material={materials.Grass_C}
              position={[0.157, -0.123, 3.203]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_846.geometry}
              material={materials.Grass_C}
              position={[0.147, -0.119, 3.231]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_848.geometry}
              material={materials.Grass_C}
              position={[0.134, -0.123, 3.182]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_850.geometry}
              material={materials.Grass_C}
              position={[0.178, -0.114, 3.303]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_852.geometry}
              material={materials.Grass_C}
              position={[0.246, -0.128, 3.208]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_854.geometry}
              material={materials.Grass_C}
              position={[0.071, -0.109, 3.305]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_856.geometry}
              material={materials.Grass_C}
              position={[0.837, -0.197, 3.068]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_858.geometry}
              material={materials.Grass_C}
              position={[0.678, -0.175, 3.117]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_860.geometry}
              material={materials.Grass_C}
              position={[0.87, -0.199, 3.067]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_862.geometry}
              material={materials.Grass_C}
              position={[0.894, -0.179, 3.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_864.geometry}
              material={materials.Grass_C}
              position={[0.8, -0.185, 3.113]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_866.geometry}
              material={materials.Grass_C}
              position={[0.894, -0.194, 3.105]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_868.geometry}
              material={materials.Grass_C}
              position={[1.285, -0.235, 3.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_870.geometry}
              material={materials.Grass_C}
              position={[1.306, -0.263, 2.954]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_872.geometry}
              material={materials.Grass_C}
              position={[2.416, -0.41, 2.153]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_874.geometry}
              material={materials.Grass_C}
              position={[3.03, -0.271, 1.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_876.geometry}
              material={materials.Grass_C}
              position={[3.026, -0.274, 1.141]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_878.geometry}
              material={materials.Grass_C}
              position={[2.993, -0.274, 1.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_880.geometry}
              material={materials.Grass_C}
              position={[3.12, -0.241, 0.989]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_882.geometry}
              material={materials.Grass_C}
              position={[3.073, -0.252, 1.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_884.geometry}
              material={materials.Grass_C}
              position={[3.07, -0.259, 1.087]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_886.geometry}
              material={materials.Grass_C}
              position={[3.116, -0.248, 1.074]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_888.geometry}
              material={materials.Grass_C}
              position={[3.036, -0.27, 1.121]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_890.geometry}
              material={materials.Grass_C}
              position={[3.033, -0.255, 0.965]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_892.geometry}
              material={materials.Grass_C}
              position={[3.264, -0.156, 0.411]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_894.geometry}
              material={materials.Grass_C}
              position={[3.259, -0.178, 0.607]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_896.geometry}
              material={materials.Grass_C}
              position={[3.159, -0.161, 0.336]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_898.geometry}
              material={materials.Grass_C}
              position={[3.182, -0.166, 0.404]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_900.geometry}
              material={materials.Grass_C}
              position={[3.142, -0.17, 0.392]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_902.geometry}
              material={materials.Grass_C}
              position={[3.213, -0.169, 0.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_904.geometry}
              material={materials.Grass_C}
              position={[3.295, -0.149, 0.38]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_906.geometry}
              material={materials.Grass_C}
              position={[3.24, -0.158, 0.398]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_908.geometry}
              material={materials.Grass_C}
              position={[3.197, -0.162, 0.384]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_910.geometry}
              material={materials.Grass_C}
              position={[3.338, -0.115, -0.157]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_912.geometry}
              material={materials.Grass_C}
              position={[3.232, -0.125, -0.13]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_914.geometry}
              material={materials.Grass_C}
              position={[3.251, -0.123, -0.133]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_916.geometry}
              material={materials.Grass_C}
              position={[3.176, -0.13, -0.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_918.geometry}
              material={materials.Grass_C}
              position={[3.197, -0.133, -0.808]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_920.geometry}
              material={materials.Grass_C}
              position={[3.225, -0.13, -0.853]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_922.geometry}
              material={materials.Grass_C}
              position={[3.215, -0.131, -0.689]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_924.geometry}
              material={materials.Grass_C}
              position={[3.08, -0.142, -0.93]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_926.geometry}
              material={materials.Grass_C}
              position={[3.225, -0.13, -0.815]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_928.geometry}
              material={materials.Grass_C}
              position={[3.078, -0.142, -0.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_930.geometry}
              material={materials.Grass_C}
              position={[3.134, -0.138, -0.811]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_932.geometry}
              material={materials.Grass_C}
              position={[3.144, -0.137, -0.893]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_934.geometry}
              material={materials.Grass_C}
              position={[3.259, -0.128, -0.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_936.geometry}
              material={materials.Grass_C}
              position={[2.977, -0.115, -1.42]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_938.geometry}
              material={materials.Grass_C}
              position={[2.933, -0.134, -1.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_940.geometry}
              material={materials.Grass_C}
              position={[2.857, -0.11, -1.511]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_942.geometry}
              material={materials.Grass_C}
              position={[2.922, -0.118, -1.407]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_944.geometry}
              material={materials.Grass_C}
              position={[2.849, -0.122, -1.394]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_946.geometry}
              material={materials.Grass_C}
              position={[2.943, -0.12, -1.373]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_948.geometry}
              material={materials.Grass_C}
              position={[2.509, -0.042, -2.049]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_950.geometry}
              material={materials.Grass_C}
              position={[2.711, -0.07, -1.854]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_952.geometry}
              material={materials.Grass_C}
              position={[2.653, -0.062, -1.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_954.geometry}
              material={materials.Grass_C}
              position={[2.628, -0.043, -2.039]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_956.geometry}
              material={materials.Grass_C}
              position={[2.753, -0.066, -1.884]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_958.geometry}
              material={materials.Grass_C}
              position={[2.496, -0.057, -1.947]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_960.geometry}
              material={materials.Grass_C}
              position={[2.203, 0.002, -2.363]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_962.geometry}
              material={materials.Grass_C}
              position={[2.225, 0.003, -2.368]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_964.geometry}
              material={materials.Grass_C}
              position={[2.158, 0.019, -2.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_966.geometry}
              material={materials.Grass_C}
              position={[2.347, 0.008, -2.384]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_968.geometry}
              material={materials.Grass_C}
              position={[2.129, 0.001, -2.367]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_970.geometry}
              material={materials.Grass_C}
              position={[1.732, 0.015, -2.858]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_972.geometry}
              material={materials.Grass_C}
              position={[1.731, 0.012, -2.71]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_974.geometry}
              material={materials.Grass_C}
              position={[1.828, 0.022, -2.774]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_976.geometry}
              material={materials.Grass_C}
              position={[1.093, -0.03, -2.987]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_978.geometry}
              material={materials.Grass_C}
              position={[0.346, -0.067, -3.293]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_980.geometry}
              material={materials.Grass_C}
              position={[0.345, -0.068, -3.287]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_982.geometry}
              material={materials.Grass_C}
              position={[0.55, -0.062, -3.149]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_984.geometry}
              material={materials.Grass_C}
              position={[0.315, -0.079, -3.189]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_986.geometry}
              material={materials.Grass_C}
              position={[-0.22, -0.17, -2.869]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_988.geometry}
              material={materials.Grass_C}
              position={[-0.04, -0.14, -2.963]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_990.geometry}
              material={materials.Grass_C}
              position={[-0.249, -0.178, -2.822]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_992.geometry}
              material={materials.Grass_C}
              position={[-0.778, -0.263, -2.74]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_994.geometry}
              material={materials.Grass_C}
              position={[-0.811, -0.271, -2.725]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_996.geometry}
              material={materials.Grass_C}
              position={[-2.762, -0.228, -0.936]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_998.geometry}
              material={materials.Grass_C}
              position={[-2.651, -0.233, 1.296]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1000.geometry}
              material={materials.Grass_C}
              position={[-2.307, -0.22, 1.725]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1002.geometry}
              material={materials.Grass_C}
              position={[-1.982, -0.147, 2.196]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1004.geometry}
              material={materials.Grass_C}
              position={[-1.906, -0.147, 2.257]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1006.geometry}
              material={materials.Grass_C}
              position={[-2.056, -0.144, 2.146]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1008.geometry}
              material={materials.Grass_C}
              position={[-2.045, -0.158, 2.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1010.geometry}
              material={materials.Grass_C}
              position={[-1.414, -0.148, 2.556]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1012.geometry}
              material={materials.Grass_C}
              position={[-1.475, -0.139, 2.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1014.geometry}
              material={materials.Grass_C}
              position={[-0.952, -0.124, 2.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1016.geometry}
              material={materials.Grass_C}
              position={[-0.979, -0.127, 2.761]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1018.geometry}
              material={materials.Grass_C}
              position={[-0.33, -0.107, 2.948]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1020.geometry}
              material={materials.Grass_C}
              position={[-0.41, -0.116, 2.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1022.geometry}
              material={materials.Grass_C}
              position={[-0.452, -0.115, 2.813]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1024.geometry}
              material={materials.Grass_C}
              position={[-0.294, -0.117, 2.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1026.geometry}
              material={materials.Grass_C}
              position={[0.07, -0.133, 2.982]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1028.geometry}
              material={materials.Grass_C}
              position={[0.096, -0.147, 2.826]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1030.geometry}
              material={materials.Grass_C}
              position={[0.656, -0.222, 2.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1032.geometry}
              material={materials.Grass_C}
              position={[0.72, -0.228, 2.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1034.geometry}
              material={materials.Grass_C}
              position={[0.754, -0.232, 2.811]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1036.geometry}
              material={materials.Grass_C}
              position={[0.714, -0.234, 2.764]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1038.geometry}
              material={materials.Grass_C}
              position={[2.734, -0.322, 0.997]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1040.geometry}
              material={materials.Grass_C}
              position={[2.913, -0.212, 0.486]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1042.geometry}
              material={materials.Grass_C}
              position={[2.862, -0.221, 0.502]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1044.geometry}
              material={materials.Grass_C}
              position={[2.802, -0.234, 0.542]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1046.geometry}
              material={materials.Grass_C}
              position={[2.953, -0.198, 0.411]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1048.geometry}
              material={materials.Grass_C}
              position={[2.931, -0.197, 0.379]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1050.geometry}
              material={materials.Grass_C}
              position={[2.897, -0.204, 0.402]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1052.geometry}
              material={materials.Grass_C}
              position={[2.918, -0.191, 0.315]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1054.geometry}
              material={materials.Grass_C}
              position={[2.894, -0.164, -0.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1056.geometry}
              material={materials.Grass_C}
              position={[2.858, -0.165, -0.122]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1058.geometry}
              material={materials.Grass_C}
              position={[2.835, -0.165, -0.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1060.geometry}
              material={materials.Grass_C}
              position={[2.851, -0.169, -0.06]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1062.geometry}
              material={materials.Grass_C}
              position={[2.992, -0.152, -0.039]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1064.geometry}
              material={materials.Grass_C}
              position={[2.876, -0.16, -0.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1066.geometry}
              material={materials.Grass_C}
              position={[2.743, -0.172, -0.786]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1068.geometry}
              material={materials.Grass_C}
              position={[2.726, -0.174, -0.723]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1070.geometry}
              material={materials.Grass_C}
              position={[2.867, -0.161, -0.729]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1072.geometry}
              material={materials.Grass_C}
              position={[2.83, -0.164, -0.73]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1074.geometry}
              material={materials.Grass_C}
              position={[2.776, -0.169, -0.728]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1076.geometry}
              material={materials.Grass_C}
              position={[2.799, -0.167, -0.83]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1078.geometry}
              material={materials.Grass_C}
              position={[2.739, -0.173, -0.732]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1080.geometry}
              material={materials.Grass_C}
              position={[2.582, -0.149, -1.266]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1082.geometry}
              material={materials.Grass_C}
              position={[2.667, -0.137, -1.333]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1084.geometry}
              material={materials.Grass_C}
              position={[2.677, -0.146, -1.243]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1086.geometry}
              material={materials.Grass_C}
              position={[2.208, -0.088, -1.779]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1088.geometry}
              material={materials.Grass_C}
              position={[2.381, -0.112, -1.607]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1090.geometry}
              material={materials.Grass_C}
              position={[2.241, -0.095, -1.728]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1092.geometry}
              material={materials.Grass_C}
              position={[2.419, -0.1, -1.671]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1094.geometry}
              material={materials.Grass_C}
              position={[2.368, -0.101, -1.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1096.geometry}
              material={materials.Grass_C}
              position={[1.891, -0.044, -2.088]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1098.geometry}
              material={materials.Grass_C}
              position={[1.942, -0.026, -2.208]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1100.geometry}
              material={materials.Grass_C}
              position={[1.913, -0.027, -2.204]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1102.geometry}
              material={materials.Grass_C}
              position={[1.982, -0.051, -2.027]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1104.geometry}
              material={materials.Grass_C}
              position={[1.94, -0.033, -2.16]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1106.geometry}
              material={materials.Grass_C}
              position={[1.647, -0.004, -2.502]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1108.geometry}
              material={materials.Grass_C}
              position={[1.513, -0.013, -2.492]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1110.geometry}
              material={materials.Grass_C}
              position={[1.491, -0.017, -2.453]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1112.geometry}
              material={materials.Grass_C}
              position={[1.433, -0.011, -2.595]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1114.geometry}
              material={materials.Grass_C}
              position={[0.959, -0.041, -2.729]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1116.geometry}
              material={materials.Grass_C}
              position={[0.955, -0.04, -2.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1118.geometry}
              material={materials.Grass_C}
              position={[0.879, -0.046, -2.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1120.geometry}
              material={materials.Grass_C}
              position={[0.512, -0.081, -2.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1122.geometry}
              material={materials.Grass_C}
              position={[0.482, -0.085, -2.849]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1124.geometry}
              material={materials.Grass_C}
              position={[0.419, -0.092, -2.88]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1126.geometry}
              material={materials.Grass_C}
              position={[0.475, -0.089, -2.795]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1128.geometry}
              material={materials.Grass_C}
              position={[0.459, -0.088, -2.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1130.geometry}
              material={materials.Grass_C}
              position={[0.533, -0.079, -2.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1132.geometry}
              material={materials.Grass_C}
              position={[0.345, -0.099, -2.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1134.geometry}
              material={materials.Grass_C}
              position={[-0.171, -0.198, -2.473]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1136.geometry}
              material={materials.Grass_C}
              position={[-0.175, -0.191, -2.567]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1138.geometry}
              material={materials.Grass_C}
              position={[-0.092, -0.184, -2.491]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1140.geometry}
              material={materials.Grass_C}
              position={[-0.049, -0.173, -2.541]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1142.geometry}
              material={materials.Grass_C}
              position={[-0.63, -0.299, -2.4]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1144.geometry}
              material={materials.Grass_C}
              position={[-0.343, -0.137, 2.615]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1146.geometry}
              material={materials.Grass_C}
              position={[-0.475, -0.137, 2.599]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1148.geometry}
              material={materials.Grass_C}
              position={[0.607, -0.269, 2.436]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1150.geometry}
              material={materials.Grass_C}
              position={[2.588, -0.251, 0.457]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1152.geometry}
              material={materials.Grass_C}
              position={[2.643, -0.195, -0.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1154.geometry}
              material={materials.Grass_C}
              position={[2.587, -0.199, -0.04]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1156.geometry}
              material={materials.Grass_C}
              position={[2.586, -0.191, -0.19]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1158.geometry}
              material={materials.Grass_C}
              position={[2.583, -0.193, -0.153]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1160.geometry}
              material={materials.Grass_C}
              position={[2.495, -0.205, -0.099]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1162.geometry}
              material={materials.Grass_C}
              position={[2.517, -0.192, -0.645]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1164.geometry}
              material={materials.Grass_C}
              position={[2.428, -0.199, -0.528]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1166.geometry}
              material={materials.Grass_C}
              position={[2.558, -0.189, -0.655]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1168.geometry}
              material={materials.Grass_C}
              position={[2.46, -0.197, -0.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1170.geometry}
              material={materials.Grass_C}
              position={[2.558, -0.188, -0.544]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1172.geometry}
              material={materials.Grass_C}
              position={[2.347, -0.186, -1.049]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1174.geometry}
              material={materials.Grass_C}
              position={[2.368, -0.177, -1.132]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1176.geometry}
              material={materials.Grass_C}
              position={[2.309, -0.187, -1.071]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1178.geometry}
              material={materials.Grass_C}
              position={[2.069, -0.152, -1.429]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1180.geometry}
              material={materials.Grass_C}
              position={[2.108, -0.133, -1.532]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1182.geometry}
              material={materials.Grass_C}
              position={[2.062, -0.157, -1.398]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1184.geometry}
              material={materials.Grass_C}
              position={[2.013, -0.14, -1.509]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1186.geometry}
              material={materials.Grass_C}
              position={[1.765, -0.098, -1.791]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1188.geometry}
              material={materials.Grass_C}
              position={[1.846, -0.078, -1.888]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1190.geometry}
              material={materials.Grass_C}
              position={[1.844, -0.078, -1.889]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1192.geometry}
              material={materials.Grass_C}
              position={[1.664, -0.091, -1.849]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1194.geometry}
              material={materials.Grass_C}
              position={[1.332, -0.06, -2.127]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1196.geometry}
              material={materials.Grass_C}
              position={[1.339, -0.043, -2.265]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1198.geometry}
              material={materials.Grass_C}
              position={[1.232, -0.047, -2.279]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1200.geometry}
              material={materials.Grass_C}
              position={[1.246, -0.046, -2.277]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1202.geometry}
              material={materials.Grass_C}
              position={[1.419, -0.047, -2.19]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1204.geometry}
              material={materials.Grass_C}
              position={[0.813, -0.062, -2.43]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1206.geometry}
              material={materials.Grass_C}
              position={[0.903, -0.055, -2.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1208.geometry}
              material={materials.Grass_C}
              position={[0.817, -0.063, -2.403]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1210.geometry}
              material={materials.Grass_C}
              position={[0.974, -0.051, -2.407]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1212.geometry}
              material={materials.Grass_C}
              position={[0.393, -0.107, -2.596]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1214.geometry}
              material={materials.Grass_C}
              position={[0.289, -0.125, -2.47]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1216.geometry}
              material={materials.Grass_C}
              position={[0.472, -0.095, -2.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1218.geometry}
              material={materials.Grass_C}
              position={[0.482, -0.095, -2.549]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1220.geometry}
              material={materials.Grass_C}
              position={[-0.057, -0.196, -2.231]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1222.geometry}
              material={materials.Grass_C}
              position={[-0.055, -0.19, -2.307]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1224.geometry}
              material={materials.Grass_C}
              position={[-0.133, -0.217, -2.166]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1226.geometry}
              material={materials.Grass_C}
              position={[-0.822, -0.257, 2.107]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1228.geometry}
              material={materials.Grass_C}
              position={[-0.328, -0.225, 2.193]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1230.geometry}
              material={materials.Grass_C}
              position={[0.071, -0.243, 2.215]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1232.geometry}
              material={materials.Grass_C}
              position={[0.584, -0.329, 2.112]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1234.geometry}
              material={materials.Grass_C}
              position={[0.589, -0.335, 2.087]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1236.geometry}
              material={materials.Grass_C}
              position={[2.262, -0.263, 0.323]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1238.geometry}
              material={materials.Grass_C}
              position={[2.28, -0.219, -0.168]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1240.geometry}
              material={materials.Grass_C}
              position={[2.286, -0.218, -0.17]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1242.geometry}
              material={materials.Grass_C}
              position={[2.156, -0.224, -0.517]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1244.geometry}
              material={materials.Grass_C}
              position={[2.159, -0.224, -0.526]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1246.geometry}
              material={materials.Grass_C}
              position={[2.169, -0.223, -0.518]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1248.geometry}
              material={materials.Grass_C}
              position={[2.158, -0.224, -0.563]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1250.geometry}
              material={materials.Grass_C}
              position={[2.224, -0.217, -0.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1252.geometry}
              material={materials.Grass_C}
              position={[2.151, -0.224, -0.553]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1254.geometry}
              material={materials.Grass_C}
              position={[1.991, -0.228, -0.899]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1256.geometry}
              material={materials.Grass_C}
              position={[2.053, -0.213, -1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1258.geometry}
              material={materials.Grass_C}
              position={[2.076, -0.223, -0.872]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1260.geometry}
              material={materials.Grass_C}
              position={[1.955, -0.228, -0.937]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1262.geometry}
              material={materials.Grass_C}
              position={[1.785, -0.167, -1.436]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1264.geometry}
              material={materials.Grass_C}
              position={[1.749, -0.175, -1.404]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1266.geometry}
              material={materials.Grass_C}
              position={[1.907, -0.184, -1.299]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1268.geometry}
              material={materials.Grass_C}
              position={[1.522, -0.128, -1.698]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1270.geometry}
              material={materials.Grass_C}
              position={[1.43, -0.146, -1.637]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1272.geometry}
              material={materials.Grass_C}
              position={[1.458, -0.147, -1.624]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1274.geometry}
              material={materials.Grass_C}
              position={[1.498, -0.147, -1.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1276.geometry}
              material={materials.Grass_C}
              position={[1.434, -0.141, -1.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1278.geometry}
              material={materials.Grass_C}
              position={[1.567, -0.153, -1.57]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1280.geometry}
              material={materials.Grass_C}
              position={[1.583, -0.132, -1.662]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1282.geometry}
              material={materials.Grass_C}
              position={[1.459, -0.118, -1.765]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1284.geometry}
              material={materials.Grass_C}
              position={[1.14, -0.107, -1.908]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1286.geometry}
              material={materials.Grass_C}
              position={[0.726, -0.103, -2.078]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1288.geometry}
              material={materials.Grass_C}
              position={[0.704, -0.104, -2.087]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1290.geometry}
              material={materials.Grass_C}
              position={[0.81, -0.087, -2.147]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1292.geometry}
              material={materials.Grass_C}
              position={[0.727, -0.097, -2.126]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1294.geometry}
              material={materials.Grass_C}
              position={[0.711, -0.102, -2.095]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1296.geometry}
              material={materials.Grass_C}
              position={[0.752, -0.099, -2.094]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1298.geometry}
              material={materials.Grass_C}
              position={[0.239, -0.147, -2.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1300.geometry}
              material={materials.Grass_C}
              position={[0.251, -0.138, -2.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1302.geometry}
              material={materials.Grass_C}
              position={[0.223, -0.147, -2.221]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1304.geometry}
              material={materials.Grass_C}
              position={[0.26, -0.147, -2.151]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1306.geometry}
              material={materials.Grass_C}
              position={[-0.092, -0.24, -1.922]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1308.geometry}
              material={materials.Grass_C}
              position={[1.997, -0.25, -0.062]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1310.geometry}
              material={materials.Grass_C}
              position={[1.977, -0.255, -0.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1312.geometry}
              material={materials.Grass_C}
              position={[1.939, -0.246, -0.443]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1314.geometry}
              material={materials.Grass_C}
              position={[1.911, -0.25, -0.439]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1316.geometry}
              material={materials.Grass_C}
              position={[1.79, -0.258, -0.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1318.geometry}
              material={materials.Grass_C}
              position={[1.784, -0.25, -0.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1320.geometry}
              material={materials.Grass_C}
              position={[1.812, -0.254, -0.8]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1322.geometry}
              material={materials.Grass_C}
              position={[1.758, -0.266, -0.729]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1324.geometry}
              material={materials.Grass_C}
              position={[1.738, -0.257, -0.874]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1326.geometry}
              material={materials.Grass_C}
              position={[1.631, -0.231, -1.148]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1328.geometry}
              material={materials.Grass_C}
              position={[1.372, -0.188, -1.464]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1330.geometry}
              material={materials.Grass_C}
              position={[1.192, -0.207, -1.448]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1332.geometry}
              material={materials.Grass_C}
              position={[1.025, -0.179, -1.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1334.geometry}
              material={materials.Grass_C}
              position={[0.959, -0.176, -1.64]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1336.geometry}
              material={materials.Grass_C}
              position={[1.011, -0.187, -1.583]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1338.geometry}
              material={materials.Grass_C}
              position={[0.677, -0.152, -1.826]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1340.geometry}
              material={materials.Grass_C}
              position={[0.562, -0.17, -1.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1342.geometry}
              material={materials.Grass_C}
              position={[0.663, -0.15, -1.842]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1344.geometry}
              material={materials.Grass_C}
              position={[0.221, -0.193, -1.859]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1346.geometry}
              material={materials.Grass_C}
              position={[0.211, -0.183, -1.931]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1348.geometry}
              material={materials.Grass_C}
              position={[1.453, -0.32, -0.683]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1350.geometry}
              material={materials.Grass_C}
              position={[1.395, -0.328, -0.716]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1352.geometry}
              material={materials.Grass_C}
              position={[1.231, -0.31, -0.982]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1354.geometry}
              material={materials.Grass_C}
              position={[1.191, -0.264, -1.217]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1356.geometry}
              material={materials.Grass_C}
              position={[0.768, -0.255, -1.384]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1358.geometry}
              material={materials.Grass_C}
              position={[0.587, -0.209, -1.611]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1360.geometry}
              material={materials.Grass_C}
              position={[0.459, -0.242, -1.511]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1362.geometry}
              material={materials.Grass_C}
              position={[0.47, -0.214, -1.628]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1364.geometry}
              material={materials.Grass_C}
              position={[0.416, -0.227, -1.591]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1366.geometry}
              material={materials.Grass_C}
              position={[0.703, -0.216, -1.547]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1368.geometry}
              material={materials.Grass_C}
              position={[0.684, -0.241, -1.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1370.geometry}
              material={materials.Grass_C}
              position={[1.026, -0.267, -1.269]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1372.geometry}
              material={materials.Grass_C}
              position={[0.947, -0.238, -1.407]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1374.geometry}
              material={materials.Grass_C}
              position={[1.125, -0.309, -1.054]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1376.geometry}
              material={materials.Grass_C}
              position={[1.422, -0.301, -0.871]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1378.geometry}
              material={materials.Grass_C}
              position={[1.391, -0.305, -0.884]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1380.geometry}
              material={materials.Grass_C}
              position={[0.404, -0.168, -1.879]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1382.geometry}
              material={materials.Grass_C}
              position={[0.442, -0.177, -1.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1384.geometry}
              material={materials.Grass_C}
              position={[0.364, -0.195, -1.758]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1386.geometry}
              material={materials.Grass_C}
              position={[0.495, -0.205, -1.655]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1388.geometry}
              material={materials.Grass_C}
              position={[0.453, -0.206, -1.668]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1390.geometry}
              material={materials.Grass_C}
              position={[0.605, -0.19, -1.682]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1392.geometry}
              material={materials.Grass_C}
              position={[0.558, -0.177, -1.759]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1394.geometry}
              material={materials.Grass_C}
              position={[0.659, -0.189, -1.67]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1396.geometry}
              material={materials.Grass_C}
              position={[0.775, -0.154, -1.781]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1398.geometry}
              material={materials.Grass_C}
              position={[0.768, -0.183, -1.661]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1400.geometry}
              material={materials.Grass_C}
              position={[0.877, -0.218, -1.499]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1402.geometry}
              material={materials.Grass_C}
              position={[0.927, -0.216, -1.494]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1404.geometry}
              material={materials.Grass_C}
              position={[0.903, -0.191, -1.596]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1406.geometry}
              material={materials.Grass_C}
              position={[0.909, -0.223, -1.473]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1408.geometry}
              material={materials.Grass_C}
              position={[0.885, -0.191, -1.599]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1410.geometry}
              material={materials.Grass_C}
              position={[1.12, -0.186, -1.557]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1412.geometry}
              material={materials.Grass_C}
              position={[1.119, -0.22, -1.423]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1414.geometry}
              material={materials.Grass_C}
              position={[1.142, -0.208, -1.462]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1416.geometry}
              material={materials.Grass_C}
              position={[1.117, -0.202, -1.492]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1418.geometry}
              material={materials.Grass_C}
              position={[1.149, -0.245, -1.311]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1420.geometry}
              material={materials.Grass_C}
              position={[1.442, -0.281, -0.985]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1422.geometry}
              material={materials.Grass_C}
              position={[1.473, -0.257, -1.098]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1424.geometry}
              material={materials.Grass_C}
              position={[1.435, -0.262, -1.094]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1426.geometry}
              material={materials.Grass_C}
              position={[1.667, -0.246, -1.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1428.geometry}
              material={materials.Grass_C}
              position={[1.625, -0.246, -1.07]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1430.geometry}
              material={materials.Grass_C}
              position={[1.719, -0.251, -0.957]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1432.geometry}
              material={materials.Grass_C}
              position={[1.597, -0.276, -0.872]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1434.geometry}
              material={materials.Grass_C}
              position={[1.571, -0.268, -0.959]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1436.geometry}
              material={materials.Grass_C}
              position={[1.674, -0.274, -0.778]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1438.geometry}
              material={materials.Grass_C}
              position={[1.596, -0.282, -0.823]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1440.geometry}
              material={materials.Grass_C}
              position={[1.807, -0.261, -0.643]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1442.geometry}
              material={materials.Grass_C}
              position={[1.734, -0.279, -0.405]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1444.geometry}
              material={materials.Grass_C}
              position={[1.944, -0.248, -0.319]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1446.geometry}
              material={materials.Grass_C}
              position={[1.894, -0.255, -0.286]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1448.geometry}
              material={materials.Grass_C}
              position={[1.718, -0.289, -0.211]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1450.geometry}
              material={materials.Grass_C}
              position={[0.189, -0.153, -2.214]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1452.geometry}
              material={materials.Grass_C}
              position={[0.202, -0.16, -2.109]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1454.geometry}
              material={materials.Grass_C}
              position={[0.101, -0.173, -2.153]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1456.geometry}
              material={materials.Grass_C}
              position={[0.314, -0.147, -2.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1458.geometry}
              material={materials.Grass_C}
              position={[0.389, -0.132, -2.131]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1460.geometry}
              material={materials.Grass_C}
              position={[0.255, -0.158, -2.064]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1462.geometry}
              material={materials.Grass_C}
              position={[0.35, -0.137, -2.132]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1464.geometry}
              material={materials.Grass_C}
              position={[0.637, -0.099, -2.174]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1466.geometry}
              material={materials.Grass_C}
              position={[0.474, -0.122, -2.134]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1468.geometry}
              material={materials.Grass_C}
              position={[0.572, -0.114, -2.105]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1470.geometry}
              material={materials.Grass_C}
              position={[0.579, -0.105, -2.183]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1472.geometry}
              material={materials.Grass_C}
              position={[0.417, -0.14, -2.044]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1474.geometry}
              material={materials.Grass_C}
              position={[0.749, -0.121, -1.955]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1476.geometry}
              material={materials.Grass_C}
              position={[0.734, -0.127, -1.925]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1478.geometry}
              material={materials.Grass_C}
              position={[0.614, -0.123, -2.011]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1480.geometry}
              material={materials.Grass_C}
              position={[0.704, -0.117, -2.002]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1482.geometry}
              material={materials.Grass_C}
              position={[0.606, -0.134, -1.95]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1484.geometry}
              material={materials.Grass_C}
              position={[0.6, -0.133, -1.954]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1486.geometry}
              material={materials.Grass_C}
              position={[0.909, -0.099, -2.02]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1488.geometry}
              material={materials.Grass_C}
              position={[1.052, -0.092, -2.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1490.geometry}
              material={materials.Grass_C}
              position={[0.878, -0.097, -2.044]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1492.geometry}
              material={materials.Grass_C}
              position={[1.018, -0.113, -1.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1494.geometry}
              material={materials.Grass_C}
              position={[0.855, -0.124, -1.899]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1496.geometry}
              material={materials.Grass_C}
              position={[0.845, -0.127, -1.886]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1498.geometry}
              material={materials.Grass_C}
              position={[1.05, -0.132, -1.804]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1500.geometry}
              material={materials.Grass_C}
              position={[1.127, -0.121, -1.835]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1502.geometry}
              material={materials.Grass_C}
              position={[1.286, -0.135, -1.726]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1504.geometry}
              material={materials.Grass_C}
              position={[1.222, -0.146, -1.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1506.geometry}
              material={materials.Grass_C}
              position={[1.273, -0.163, -1.606]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1508.geometry}
              material={materials.Grass_C}
              position={[1.211, -0.126, -1.788]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1510.geometry}
              material={materials.Grass_C}
              position={[1.207, -0.127, -1.785]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1512.geometry}
              material={materials.Grass_C}
              position={[1.374, -0.149, -1.641]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1514.geometry}
              material={materials.Grass_C}
              position={[1.339, -0.167, -1.567]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1516.geometry}
              material={materials.Grass_C}
              position={[1.603, -0.161, -1.515]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1518.geometry}
              material={materials.Grass_C}
              position={[1.75, -0.162, -1.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1520.geometry}
              material={materials.Grass_C}
              position={[1.503, -0.202, -1.353]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1522.geometry}
              material={materials.Grass_C}
              position={[1.591, -0.203, -1.321]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1524.geometry}
              material={materials.Grass_C}
              position={[1.562, -0.205, -1.318]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1526.geometry}
              material={materials.Grass_C}
              position={[1.76, -0.204, -1.24]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1528.geometry}
              material={materials.Grass_C}
              position={[1.736, -0.212, -1.209]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1530.geometry}
              material={materials.Grass_C}
              position={[2.011, -0.205, -1.107]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1532.geometry}
              material={materials.Grass_C}
              position={[1.995, -0.208, -1.092]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1534.geometry}
              material={materials.Grass_C}
              position={[1.88, -0.237, -0.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1536.geometry}
              material={materials.Grass_C}
              position={[1.946, -0.231, -0.913]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1538.geometry}
              material={materials.Grass_C}
              position={[1.938, -0.24, -0.817]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1540.geometry}
              material={materials.Grass_C}
              position={[1.83, -0.24, -0.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1542.geometry}
              material={materials.Grass_C}
              position={[1.88, -0.241, -0.873]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1544.geometry}
              material={materials.Grass_C}
              position={[2.091, -0.223, -0.851]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1546.geometry}
              material={materials.Grass_C}
              position={[2.046, -0.229, -0.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1548.geometry}
              material={materials.Grass_C}
              position={[1.979, -0.238, -0.748]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1550.geometry}
              material={materials.Grass_C}
              position={[2.014, -0.238, -0.574]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1552.geometry}
              material={materials.Grass_C}
              position={[1.984, -0.241, -0.474]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1554.geometry}
              material={materials.Grass_C}
              position={[2.018, -0.237, -0.444]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1556.geometry}
              material={materials.Grass_C}
              position={[2.053, -0.234, -0.451]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1558.geometry}
              material={materials.Grass_C}
              position={[2.175, -0.225, -0.249]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1560.geometry}
              material={materials.Grass_C}
              position={[2.045, -0.237, -0.269]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1562.geometry}
              material={materials.Grass_C}
              position={[2.001, -0.24, -0.337]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1564.geometry}
              material={materials.Grass_C}
              position={[2.011, -0.239, -0.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1566.geometry}
              material={materials.Grass_C}
              position={[2.104, -0.242, -0.001]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1568.geometry}
              material={materials.Grass_C}
              position={[2.15, -0.236, -0.029]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1570.geometry}
              material={materials.Grass_C}
              position={[2.091, -0.242, -0.023]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1572.geometry}
              material={materials.Grass_C}
              position={[2.196, -0.251, 0.203]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1574.geometry}
              material={materials.Grass_C}
              position={[0.297, -0.31, 2.006]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1576.geometry}
              material={materials.Grass_C}
              position={[-0.184, -0.235, -2.109]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1578.geometry}
              material={materials.Grass_C}
              position={[0.003, -0.164, -2.565]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1580.geometry}
              material={materials.Grass_C}
              position={[0.157, -0.142, -2.566]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1582.geometry}
              material={materials.Grass_C}
              position={[0.039, -0.157, -2.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1584.geometry}
              material={materials.Grass_C}
              position={[0.201, -0.136, -2.559]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1586.geometry}
              material={materials.Grass_C}
              position={[0.083, -0.152, -2.571]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1588.geometry}
              material={materials.Grass_C}
              position={[0.067, -0.166, -2.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1590.geometry}
              material={materials.Grass_C}
              position={[0.134, -0.151, -2.423]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1592.geometry}
              material={materials.Grass_C}
              position={[0.3, -0.125, -2.438]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1594.geometry}
              material={materials.Grass_C}
              position={[0.329, -0.127, -2.295]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1596.geometry}
              material={materials.Grass_C}
              position={[0.445, -0.104, -2.418]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1598.geometry}
              material={materials.Grass_C}
              position={[0.252, -0.134, -2.395]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1600.geometry}
              material={materials.Grass_C}
              position={[0.622, -0.079, -2.475]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1602.geometry}
              material={materials.Grass_C}
              position={[0.627, -0.079, -2.458]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1604.geometry}
              material={materials.Grass_C}
              position={[0.632, -0.076, -2.549]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1606.geometry}
              material={materials.Grass_C}
              position={[0.503, -0.093, -2.504]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1608.geometry}
              material={materials.Grass_C}
              position={[0.544, -0.085, -2.589]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1610.geometry}
              material={materials.Grass_C}
              position={[0.482, -0.098, -2.417]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1612.geometry}
              material={materials.Grass_C}
              position={[0.536, -0.1, -2.297]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1614.geometry}
              material={materials.Grass_C}
              position={[0.624, -0.083, -2.382]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1616.geometry}
              material={materials.Grass_C}
              position={[0.477, -0.103, -2.354]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1618.geometry}
              material={materials.Grass_C}
              position={[0.696, -0.078, -2.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1620.geometry}
              material={materials.Grass_C}
              position={[0.566, -0.09, -2.391]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1622.geometry}
              material={materials.Grass_C}
              position={[0.667, -0.078, -2.376]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1624.geometry}
              material={materials.Grass_C}
              position={[0.828, -0.071, -2.286]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1626.geometry}
              material={materials.Grass_C}
              position={[0.739, -0.087, -2.197]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1628.geometry}
              material={materials.Grass_C}
              position={[0.728, -0.079, -2.29]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1630.geometry}
              material={materials.Grass_C}
              position={[0.833, -0.072, -2.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1632.geometry}
              material={materials.Grass_C}
              position={[0.732, -0.077, -2.302]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1634.geometry}
              material={materials.Grass_C}
              position={[1.137, -0.055, -2.256]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1636.geometry}
              material={materials.Grass_C}
              position={[1.196, -0.045, -2.317]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1638.geometry}
              material={materials.Grass_C}
              position={[1.031, -0.045, -2.442]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1640.geometry}
              material={materials.Grass_C}
              position={[1.168, -0.058, -2.209]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1642.geometry}
              material={materials.Grass_C}
              position={[1.149, -0.047, -2.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1644.geometry}
              material={materials.Grass_C}
              position={[0.929, -0.072, -2.207]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1646.geometry}
              material={materials.Grass_C}
              position={[1.102, -0.074, -2.119]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1648.geometry}
              material={materials.Grass_C}
              position={[1.139, -0.063, -2.177]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1650.geometry}
              material={materials.Grass_C}
              position={[0.953, -0.082, -2.115]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1652.geometry}
              material={materials.Grass_C}
              position={[0.982, -0.069, -2.207]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1654.geometry}
              material={materials.Grass_C}
              position={[0.953, -0.069, -2.216]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1656.geometry}
              material={materials.Grass_C}
              position={[1.029, -0.062, -2.238]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1658.geometry}
              material={materials.Grass_C}
              position={[1.217, -0.079, -2.045]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1660.geometry}
              material={materials.Grass_C}
              position={[1.149, -0.076, -2.087]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1662.geometry}
              material={materials.Grass_C}
              position={[1.161, -0.067, -2.142]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1664.geometry}
              material={materials.Grass_C}
              position={[1.267, -0.085, -1.989]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1666.geometry}
              material={materials.Grass_C}
              position={[1.233, -0.067, -2.112]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1668.geometry}
              material={materials.Grass_C}
              position={[1.616, -0.066, -2.005]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1670.geometry}
              material={materials.Grass_C}
              position={[1.398, -0.065, -2.071]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1672.geometry}
              material={materials.Grass_C}
              position={[1.614, -0.069, -1.989]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1674.geometry}
              material={materials.Grass_C}
              position={[1.374, -0.082, -1.976]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1676.geometry}
              material={materials.Grass_C}
              position={[1.372, -0.08, -1.988]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1678.geometry}
              material={materials.Grass_C}
              position={[1.447, -0.1, -1.861]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1680.geometry}
              material={materials.Grass_C}
              position={[1.449, -0.083, -1.952]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1682.geometry}
              material={materials.Grass_C}
              position={[1.355, -0.089, -1.941]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1684.geometry}
              material={materials.Grass_C}
              position={[1.622, -0.131, -1.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1686.geometry}
              material={materials.Grass_C}
              position={[1.622, -0.11, -1.765]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1688.geometry}
              material={materials.Grass_C}
              position={[1.652, -0.093, -1.842]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1690.geometry}
              material={materials.Grass_C}
              position={[1.867, -0.113, -1.691]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1692.geometry}
              material={materials.Grass_C}
              position={[1.883, -0.102, -1.75]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1694.geometry}
              material={materials.Grass_C}
              position={[1.807, -0.1, -1.773]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1696.geometry}
              material={materials.Grass_C}
              position={[1.795, -0.113, -1.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1698.geometry}
              material={materials.Grass_C}
              position={[1.73, -0.122, -1.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1700.geometry}
              material={materials.Grass_C}
              position={[1.738, -0.151, -1.53]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1702.geometry}
              material={materials.Grass_C}
              position={[1.761, -0.156, -1.497]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1704.geometry}
              material={materials.Grass_C}
              position={[1.864, -0.127, -1.616]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1706.geometry}
              material={materials.Grass_C}
              position={[1.745, -0.129, -1.637]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1708.geometry}
              material={materials.Grass_C}
              position={[1.972, -0.167, -1.37]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1710.geometry}
              material={materials.Grass_C}
              position={[1.896, -0.153, -1.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1712.geometry}
              material={materials.Grass_C}
              position={[2.006, -0.158, -1.413]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1714.geometry}
              material={materials.Grass_C}
              position={[1.867, -0.164, -1.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1716.geometry}
              material={materials.Grass_C}
              position={[1.895, -0.179, -1.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1718.geometry}
              material={materials.Grass_C}
              position={[2.254, -0.167, -1.27]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1720.geometry}
              material={materials.Grass_C}
              position={[2.141, -0.172, -1.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1722.geometry}
              material={materials.Grass_C}
              position={[2.238, -0.167, -1.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1724.geometry}
              material={materials.Grass_C}
              position={[2.155, -0.211, -0.939]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1726.geometry}
              material={materials.Grass_C}
              position={[2.188, -0.188, -1.136]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1728.geometry}
              material={materials.Grass_C}
              position={[2.168, -0.211, -0.921]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1730.geometry}
              material={materials.Grass_C}
              position={[2.156, -0.211, -0.929]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1732.geometry}
              material={materials.Grass_C}
              position={[2.37, -0.193, -0.962]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1734.geometry}
              material={materials.Grass_C}
              position={[2.377, -0.192, -0.971]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1736.geometry}
              material={materials.Grass_C}
              position={[2.328, -0.206, -0.75]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1738.geometry}
              material={materials.Grass_C}
              position={[2.219, -0.214, -0.765]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1740.geometry}
              material={materials.Grass_C}
              position={[2.322, -0.201, -0.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1742.geometry}
              material={materials.Grass_C}
              position={[2.365, -0.205, -0.619]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1744.geometry}
              material={materials.Grass_C}
              position={[2.218, -0.218, -0.644]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1746.geometry}
              material={materials.Grass_C}
              position={[2.277, -0.213, -0.484]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1748.geometry}
              material={materials.Grass_C}
              position={[2.251, -0.215, -0.608]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1750.geometry}
              material={materials.Grass_C}
              position={[2.302, -0.21, -0.499]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1752.geometry}
              material={materials.Grass_C}
              position={[2.348, -0.206, -0.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1754.geometry}
              material={materials.Grass_C}
              position={[2.265, -0.214, -0.533]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1756.geometry}
              material={materials.Grass_C}
              position={[2.348, -0.206, -0.618]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1758.geometry}
              material={materials.Grass_C}
              position={[2.514, -0.193, -0.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1760.geometry}
              material={materials.Grass_C}
              position={[2.606, -0.184, -0.442]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1762.geometry}
              material={materials.Grass_C}
              position={[2.603, -0.185, -0.367]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1764.geometry}
              material={materials.Grass_C}
              position={[2.602, -0.186, -0.271]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1766.geometry}
              material={materials.Grass_C}
              position={[2.378, -0.204, -0.457]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1768.geometry}
              material={materials.Grass_C}
              position={[2.326, -0.212, -0.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1770.geometry}
              material={materials.Grass_C}
              position={[2.366, -0.208, -0.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1772.geometry}
              material={materials.Grass_C}
              position={[2.349, -0.209, -0.261]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1774.geometry}
              material={materials.Grass_C}
              position={[2.404, -0.206, -0.212]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1776.geometry}
              material={materials.Grass_C}
              position={[2.431, -0.214, -0.041]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1778.geometry}
              material={materials.Grass_C}
              position={[2.448, -0.209, -0.103]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1780.geometry}
              material={materials.Grass_C}
              position={[2.334, -0.212, -0.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1782.geometry}
              material={materials.Grass_C}
              position={[2.456, -0.204, -0.184]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1784.geometry}
              material={materials.Grass_C}
              position={[2.313, -0.218, -0.131]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1786.geometry}
              material={materials.Grass_C}
              position={[2.511, -0.22, 0.12]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1788.geometry}
              material={materials.Grass_C}
              position={[2.614, -0.213, 0.15]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1790.geometry}
              material={materials.Grass_C}
              position={[2.604, -0.214, 0.155]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1792.geometry}
              material={materials.Grass_C}
              position={[2.582, -0.211, 0.095]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1794.geometry}
              material={materials.Grass_C}
              position={[2.605, -0.207, 0.079]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1796.geometry}
              material={materials.Grass_C}
              position={[2.593, -0.222, 0.232]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1798.geometry}
              material={materials.Grass_C}
              position={[2.503, -0.224, 0.151]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1800.geometry}
              material={materials.Grass_C}
              position={[2.364, -0.229, 0.081]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1802.geometry}
              material={materials.Grass_C}
              position={[2.431, -0.233, 0.184]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1804.geometry}
              material={materials.Grass_C}
              position={[2.314, -0.235, 0.114]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1806.geometry}
              material={materials.Grass_C}
              position={[2.456, -0.218, 0.038]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1808.geometry}
              material={materials.Grass_C}
              position={[2.366, -0.236, 0.162]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1810.geometry}
              material={materials.Grass_C}
              position={[2.349, -0.258, 0.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1812.geometry}
              material={materials.Grass_C}
              position={[2.46, -0.315, 0.726]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1814.geometry}
              material={materials.Grass_C}
              position={[2.325, -0.415, 1.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1816.geometry}
              material={materials.Grass_C}
              position={[0.581, -0.292, 2.294]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1818.geometry}
              material={materials.Grass_C}
              position={[0.493, -0.273, 2.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1820.geometry}
              material={materials.Grass_C}
              position={[0.436, -0.231, 2.48]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1822.geometry}
              material={materials.Grass_C}
              position={[0.08, -0.209, 2.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1824.geometry}
              material={materials.Grass_C}
              position={[-0.081, -0.16, 2.564]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1826.geometry}
              material={materials.Grass_C}
              position={[-0.404, -0.199, 2.28]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1828.geometry}
              material={materials.Grass_C}
              position={[-0.617, -0.169, 2.416]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1830.geometry}
              material={materials.Grass_C}
              position={[-0.482, -0.271, -2.37]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1832.geometry}
              material={materials.Grass_C}
              position={[-0.428, -0.243, -2.504]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1834.geometry}
              material={materials.Grass_C}
              position={[-0.401, -0.227, -2.595]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1836.geometry}
              material={materials.Grass_C}
              position={[-0.416, -0.263, -2.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1838.geometry}
              material={materials.Grass_C}
              position={[-0.421, -0.256, -2.39]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1840.geometry}
              material={materials.Grass_C}
              position={[-0.165, -0.209, -2.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1842.geometry}
              material={materials.Grass_C}
              position={[-0.091, -0.195, -2.325]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1844.geometry}
              material={materials.Grass_C}
              position={[-0.213, -0.209, -2.426]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1846.geometry}
              material={materials.Grass_C}
              position={[-0.219, -0.209, -2.441]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1848.geometry}
              material={materials.Grass_C}
              position={[-0.005, -0.169, -2.477]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1850.geometry}
              material={materials.Grass_C}
              position={[0.222, -0.109, -2.966]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1852.geometry}
              material={materials.Grass_C}
              position={[0.041, -0.132, -2.949]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1854.geometry}
              material={materials.Grass_C}
              position={[0.059, -0.139, -2.855]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1856.geometry}
              material={materials.Grass_C}
              position={[0.153, -0.123, -2.894]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1858.geometry}
              material={materials.Grass_C}
              position={[0.074, -0.141, -2.799]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1860.geometry}
              material={materials.Grass_C}
              position={[0.016, -0.153, -2.731]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1862.geometry}
              material={materials.Grass_C}
              position={[0.054, -0.146, -2.772]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1864.geometry}
              material={materials.Grass_C}
              position={[0.219, -0.125, -2.755]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1866.geometry}
              material={materials.Grass_C}
              position={[0.31, -0.112, -2.768]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1868.geometry}
              material={materials.Grass_C}
              position={[0.43, -0.096, -2.757]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1870.geometry}
              material={materials.Grass_C}
              position={[0.373, -0.107, -2.681]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1872.geometry}
              material={materials.Grass_C}
              position={[0.481, -0.093, -2.619]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1874.geometry}
              material={materials.Grass_C}
              position={[0.672, -0.066, -2.764]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1876.geometry}
              material={materials.Grass_C}
              position={[0.8, -0.052, -2.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1878.geometry}
              material={materials.Grass_C}
              position={[0.617, -0.067, -2.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1880.geometry}
              material={materials.Grass_C}
              position={[0.642, -0.074, -2.572]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1882.geometry}
              material={materials.Grass_C}
              position={[0.715, -0.064, -2.657]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1884.geometry}
              material={materials.Grass_C}
              position={[0.707, -0.066, -2.575]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1886.geometry}
              material={materials.Grass_C}
              position={[0.729, -0.063, -2.624]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1888.geometry}
              material={materials.Grass_C}
              position={[0.789, -0.055, -2.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1890.geometry}
              material={materials.Grass_C}
              position={[0.615, -0.074, -2.718]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1892.geometry}
              material={materials.Grass_C}
              position={[0.921, -0.05, -2.488]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1894.geometry}
              material={materials.Grass_C}
              position={[0.815, -0.055, -2.593]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1896.geometry}
              material={materials.Grass_C}
              position={[0.89, -0.05, -2.55]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1898.geometry}
              material={materials.Grass_C}
              position={[1.024, -0.042, -2.512]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1900.geometry}
              material={materials.Grass_C}
              position={[1.361, -0.014, -2.644]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1902.geometry}
              material={materials.Grass_C}
              position={[1.393, -0.012, -2.621]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1904.geometry}
              material={materials.Grass_C}
              position={[1.227, -0.022, -2.686]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1906.geometry}
              material={materials.Grass_C}
              position={[1.116, -0.03, -2.65]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1908.geometry}
              material={materials.Grass_C}
              position={[1.282, -0.021, -2.623]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1910.geometry}
              material={materials.Grass_C}
              position={[1.209, -0.024, -2.672]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1912.geometry}
              material={materials.Grass_C}
              position={[1.225, -0.04, -2.345]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1914.geometry}
              material={materials.Grass_C}
              position={[1.094, -0.036, -2.543]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1916.geometry}
              material={materials.Grass_C}
              position={[1.223, -0.032, -2.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1918.geometry}
              material={materials.Grass_C}
              position={[1.082, -0.036, -2.554]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1920.geometry}
              material={materials.Grass_C}
              position={[1.075, -0.044, -2.419]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1922.geometry}
              material={materials.Grass_C}
              position={[1.077, -0.037, -2.547]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1924.geometry}
              material={materials.Grass_C}
              position={[1.213, -0.03, -2.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1926.geometry}
              material={materials.Grass_C}
              position={[1.374, -0.04, -2.27]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1928.geometry}
              material={materials.Grass_C}
              position={[1.755, -0.023, -2.276]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1930.geometry}
              material={materials.Grass_C}
              position={[1.799, -0.011, -2.368]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1932.geometry}
              material={materials.Grass_C}
              position={[1.761, -0.01, -2.389]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1934.geometry}
              material={materials.Grass_C}
              position={[1.787, -0.009, -2.385]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1936.geometry}
              material={materials.Grass_C}
              position={[1.714, -0.022, -2.303]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1938.geometry}
              material={materials.Grass_C}
              position={[1.578, -0.024, -2.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1940.geometry}
              material={materials.Grass_C}
              position={[1.502, -0.04, -2.218]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1942.geometry}
              material={materials.Grass_C}
              position={[1.568, -0.04, -2.199]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1944.geometry}
              material={materials.Grass_C}
              position={[1.692, -0.047, -2.108]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1946.geometry}
              material={materials.Grass_C}
              position={[1.551, -0.039, -2.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1948.geometry}
              material={materials.Grass_C}
              position={[1.551, -0.034, -2.248]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1950.geometry}
              material={materials.Grass_C}
              position={[1.918, -0.062, -1.975]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1952.geometry}
              material={materials.Grass_C}
              position={[1.812, -0.052, -2.056]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1954.geometry}
              material={materials.Grass_C}
              position={[1.832, -0.062, -1.991]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1956.geometry}
              material={materials.Grass_C}
              position={[2.105, -0.065, -1.929]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1958.geometry}
              material={materials.Grass_C}
              position={[2.102, -0.065, -1.931]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1960.geometry}
              material={materials.Grass_C}
              position={[2.133, -0.072, -1.881]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1962.geometry}
              material={materials.Grass_C}
              position={[2.099, -0.043, -2.063]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1964.geometry}
              material={materials.Grass_C}
              position={[2.2, -0.069, -1.892]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1966.geometry}
              material={materials.Grass_C}
              position={[2.045, -0.053, -2.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1968.geometry}
              material={materials.Grass_C}
              position={[2.025, -0.077, -1.869]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1970.geometry}
              material={materials.Grass_C}
              position={[2.022, -0.072, -1.896]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1972.geometry}
              material={materials.Grass_C}
              position={[2.15, -0.087, -1.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1974.geometry}
              material={materials.Grass_C}
              position={[2.228, -0.132, -1.515]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1976.geometry}
              material={materials.Grass_C}
              position={[2.299, -0.122, -1.562]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1978.geometry}
              material={materials.Grass_C}
              position={[2.084, -0.105, -1.696]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1980.geometry}
              material={materials.Grass_C}
              position={[2.203, -0.099, -1.709]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1982.geometry}
              material={materials.Grass_C}
              position={[2.196, -0.098, -1.719]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1984.geometry}
              material={materials.Grass_C}
              position={[2.162, -0.103, -1.694]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1986.geometry}
              material={materials.Grass_C}
              position={[2.261, -0.128, -1.53]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1988.geometry}
              material={materials.Grass_C}
              position={[2.466, -0.124, -1.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1990.geometry}
              material={materials.Grass_C}
              position={[2.528, -0.137, -1.396]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1992.geometry}
              material={materials.Grass_C}
              position={[2.432, -0.115, -1.57]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1994.geometry}
              material={materials.Grass_C}
              position={[2.475, -0.113, -1.575]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1996.geometry}
              material={materials.Grass_C}
              position={[2.409, -0.138, -1.421]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_1998.geometry}
              material={materials.Grass_C}
              position={[2.393, -0.136, -1.438]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2000.geometry}
              material={materials.Grass_C}
              position={[2.288, -0.156, -1.335]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2002.geometry}
              material={materials.Grass_C}
              position={[2.254, -0.142, -1.443]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2004.geometry}
              material={materials.Grass_C}
              position={[2.303, -0.136, -1.463]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2006.geometry}
              material={materials.Grass_C}
              position={[2.408, -0.164, -1.227]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2008.geometry}
              material={materials.Grass_C}
              position={[2.459, -0.174, -1.101]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2010.geometry}
              material={materials.Grass_C}
              position={[2.427, -0.174, -1.123]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2012.geometry}
              material={materials.Grass_C}
              position={[2.468, -0.174, -1.097]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2014.geometry}
              material={materials.Grass_C}
              position={[2.492, -0.177, -1.06]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2016.geometry}
              material={materials.Grass_C}
              position={[2.796, -0.157, -1.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2018.geometry}
              material={materials.Grass_C}
              position={[2.74, -0.171, -0.853]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2020.geometry}
              material={materials.Grass_C}
              position={[2.689, -0.176, -0.837]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2022.geometry}
              material={materials.Grass_C}
              position={[2.744, -0.165, -0.953]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2024.geometry}
              material={materials.Grass_C}
              position={[2.716, -0.169, -0.923]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2026.geometry}
              material={materials.Grass_C}
              position={[2.579, -0.174, -1.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2028.geometry}
              material={materials.Grass_C}
              position={[2.635, -0.178, -0.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2030.geometry}
              material={materials.Grass_C}
              position={[2.552, -0.183, -0.891]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2032.geometry}
              material={materials.Grass_C}
              position={[2.501, -0.187, -0.882]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2034.geometry}
              material={materials.Grass_C}
              position={[2.674, -0.178, -0.662]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2036.geometry}
              material={materials.Grass_C}
              position={[2.585, -0.186, -0.723]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2038.geometry}
              material={materials.Grass_C}
              position={[2.71, -0.175, -0.599]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2040.geometry}
              material={materials.Grass_C}
              position={[2.576, -0.187, -0.772]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2042.geometry}
              material={materials.Grass_C}
              position={[2.558, -0.189, -0.738]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2044.geometry}
              material={materials.Grass_C}
              position={[2.712, -0.175, -0.569]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2046.geometry}
              material={materials.Grass_C}
              position={[2.63, -0.182, -0.555]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2048.geometry}
              material={materials.Grass_C}
              position={[2.603, -0.185, -0.621]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2050.geometry}
              material={materials.Grass_C}
              position={[2.891, -0.154, -0.285]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2052.geometry}
              material={materials.Grass_C}
              position={[2.841, -0.16, -0.295]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2054.geometry}
              material={materials.Grass_C}
              position={[2.927, -0.154, -0.475]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2056.geometry}
              material={materials.Grass_C}
              position={[2.806, -0.164, -0.287]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2058.geometry}
              material={materials.Grass_C}
              position={[2.843, -0.16, -0.348]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2060.geometry}
              material={materials.Grass_C}
              position={[2.896, -0.157, -0.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2062.geometry}
              material={materials.Grass_C}
              position={[2.872, -0.157, -0.333]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2064.geometry}
              material={materials.Grass_C}
              position={[2.634, -0.182, -0.432]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2066.geometry}
              material={materials.Grass_C}
              position={[2.633, -0.182, -0.478]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2068.geometry}
              material={materials.Grass_C}
              position={[2.688, -0.177, -0.491]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2070.geometry}
              material={materials.Grass_C}
              position={[2.687, -0.177, -0.35]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2072.geometry}
              material={materials.Grass_C}
              position={[2.714, -0.174, -0.456]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2074.geometry}
              material={materials.Grass_C}
              position={[2.654, -0.193, -0.03]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2076.geometry}
              material={materials.Grass_C}
              position={[2.747, -0.177, -0.127]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2078.geometry}
              material={materials.Grass_C}
              position={[2.756, -0.171, -0.226]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2080.geometry}
              material={materials.Grass_C}
              position={[2.678, -0.183, -0.172]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2082.geometry}
              material={materials.Grass_C}
              position={[2.725, -0.18, -0.123]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2084.geometry}
              material={materials.Grass_C}
              position={[2.829, -0.194, 0.219]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2086.geometry}
              material={materials.Grass_C}
              position={[2.82, -0.186, 0.123]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2088.geometry}
              material={materials.Grass_C}
              position={[2.741, -0.206, 0.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2090.geometry}
              material={materials.Grass_C}
              position={[2.663, -0.194, 0.005]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2092.geometry}
              material={materials.Grass_C}
              position={[2.783, -0.183, 0.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2094.geometry}
              material={materials.Grass_C}
              position={[2.81, -0.179, 0.028]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2096.geometry}
              material={materials.Grass_C}
              position={[2.691, -0.212, 0.239]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2098.geometry}
              material={materials.Grass_C}
              position={[2.756, -0.184, 0.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2100.geometry}
              material={materials.Grass_C}
              position={[2.734, -0.225, 0.395]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2102.geometry}
              material={materials.Grass_C}
              position={[2.849, -0.263, 0.776]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2104.geometry}
              material={materials.Grass_C}
              position={[2.862, -0.247, 0.684]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2106.geometry}
              material={materials.Grass_C}
              position={[2.833, -0.239, 0.607]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2108.geometry}
              material={materials.Grass_C}
              position={[2.866, -0.246, 0.682]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2110.geometry}
              material={materials.Grass_C}
              position={[1.078, -0.308, 2.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2112.geometry}
              material={materials.Grass_C}
              position={[0.955, -0.305, 2.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2114.geometry}
              material={materials.Grass_C}
              position={[0.868, -0.28, 2.635]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2116.geometry}
              material={materials.Grass_C}
              position={[0.95, -0.31, 2.561]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2118.geometry}
              material={materials.Grass_C}
              position={[0.42, -0.175, 2.937]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2120.geometry}
              material={materials.Grass_C}
              position={[0.483, -0.198, 2.794]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2122.geometry}
              material={materials.Grass_C}
              position={[0.333, -0.172, 2.864]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2124.geometry}
              material={materials.Grass_C}
              position={[0.455, -0.182, 2.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2126.geometry}
              material={materials.Grass_C}
              position={[0.502, -0.187, 2.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2128.geometry}
              material={materials.Grass_C}
              position={[0.415, -0.175, 2.927]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2130.geometry}
              material={materials.Grass_C}
              position={[0.281, -0.184, 2.664]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2132.geometry}
              material={materials.Grass_C}
              position={[0.529, -0.213, 2.711]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2134.geometry}
              material={materials.Grass_C}
              position={[0.523, -0.216, 2.679]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2136.geometry}
              material={materials.Grass_C}
              position={[0.41, -0.19, 2.775]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2138.geometry}
              material={materials.Grass_C}
              position={[0.313, -0.18, 2.749]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2140.geometry}
              material={materials.Grass_C}
              position={[0.283, -0.185, 2.656]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2142.geometry}
              material={materials.Grass_C}
              position={[0.319, -0.184, 2.714]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2144.geometry}
              material={materials.Grass_C}
              position={[0.322, -0.18, 2.76]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2146.geometry}
              material={materials.Grass_C}
              position={[-0.041, -0.138, 2.764]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2148.geometry}
              material={materials.Grass_C}
              position={[-0.381, -0.124, 2.733]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2150.geometry}
              material={materials.Grass_C}
              position={[-0.288, -0.118, 2.797]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2152.geometry}
              material={materials.Grass_C}
              position={[-0.333, -0.12, 2.77]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2154.geometry}
              material={materials.Grass_C}
              position={[-0.734, -0.127, 2.727]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2156.geometry}
              material={materials.Grass_C}
              position={[-0.646, -0.119, 2.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2158.geometry}
              material={materials.Grass_C}
              position={[-0.673, -0.113, 2.865]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2160.geometry}
              material={materials.Grass_C}
              position={[-0.75, -0.118, 2.825]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2162.geometry}
              material={materials.Grass_C}
              position={[-0.646, -0.111, 2.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2164.geometry}
              material={materials.Grass_C}
              position={[-0.776, -0.148, 2.567]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2166.geometry}
              material={materials.Grass_C}
              position={[-0.704, -0.138, 2.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2168.geometry}
              material={materials.Grass_C}
              position={[-0.581, -0.13, 2.67]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2170.geometry}
              material={materials.Grass_C}
              position={[-0.712, -0.147, 2.558]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2172.geometry}
              material={materials.Grass_C}
              position={[-0.554, -0.12, 2.749]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2174.geometry}
              material={materials.Grass_C}
              position={[-0.889, -0.145, 2.606]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2176.geometry}
              material={materials.Grass_C}
              position={[-0.805, -0.142, 2.617]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2178.geometry}
              material={materials.Grass_C}
              position={[-1.256, -0.146, 2.611]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2180.geometry}
              material={materials.Grass_C}
              position={[-1.234, -0.14, 2.652]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2182.geometry}
              material={materials.Grass_C}
              position={[-1.312, -0.155, 2.545]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2184.geometry}
              material={materials.Grass_C}
              position={[-1.314, -0.162, 2.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2186.geometry}
              material={materials.Grass_C}
              position={[-1.268, -0.16, 2.52]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2188.geometry}
              material={materials.Grass_C}
              position={[-1.173, -0.152, 2.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2190.geometry}
              material={materials.Grass_C}
              position={[-1.222, -0.186, 2.396]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2192.geometry}
              material={materials.Grass_C}
              position={[-1.26, -0.179, 2.425]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2194.geometry}
              material={materials.Grass_C}
              position={[-1.056, -0.159, 2.534]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2196.geometry}
              material={materials.Grass_C}
              position={[-1.034, -0.172, 2.447]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2198.geometry}
              material={materials.Grass_C}
              position={[-1.443, -0.211, 2.276]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2200.geometry}
              material={materials.Grass_C}
              position={[-1.432, -0.202, 2.309]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2202.geometry}
              material={materials.Grass_C}
              position={[-1.807, -0.174, 2.24]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2204.geometry}
              material={materials.Grass_C}
              position={[-1.778, -0.144, 2.359]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2206.geometry}
              material={materials.Grass_C}
              position={[-1.538, -0.227, 2.202]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2208.geometry}
              material={materials.Grass_C}
              position={[-1.627, -0.234, 2.15]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2210.geometry}
              material={materials.Grass_C}
              position={[-1.839, -0.204, 2.128]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2212.geometry}
              material={materials.Grass_C}
              position={[-2.125, -0.219, 1.888]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2214.geometry}
              material={materials.Grass_C}
              position={[-2.171, -0.212, 1.868]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2216.geometry}
              material={materials.Grass_C}
              position={[-2.143, -0.154, 2.048]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2218.geometry}
              material={materials.Grass_C}
              position={[-2.029, -0.266, 1.841]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2220.geometry}
              material={materials.Grass_C}
              position={[-2.524, -0.215, 1.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2222.geometry}
              material={materials.Grass_C}
              position={[-2.439, -0.306, 1.338]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2224.geometry}
              material={materials.Grass_C}
              position={[-2.927, -0.205, -0.11]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2226.geometry}
              material={materials.Grass_C}
              position={[-2.778, -0.248, -0.136]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2228.geometry}
              material={materials.Grass_C}
              position={[-2.761, -0.234, -0.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2230.geometry}
              material={materials.Grass_C}
              position={[-0.784, -0.281, -2.653]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2232.geometry}
              material={materials.Grass_C}
              position={[-0.526, -0.21, -2.849]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2234.geometry}
              material={materials.Grass_C}
              position={[-0.559, -0.219, -2.818]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2236.geometry}
              material={materials.Grass_C}
              position={[-0.527, -0.212, -2.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2238.geometry}
              material={materials.Grass_C}
              position={[-0.439, -0.209, -2.781]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2240.geometry}
              material={materials.Grass_C}
              position={[-0.319, -0.206, -2.647]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2242.geometry}
              material={materials.Grass_C}
              position={[-0.395, -0.22, -2.64]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2244.geometry}
              material={materials.Grass_C}
              position={[-0.113, -0.173, -2.695]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2246.geometry}
              material={materials.Grass_C}
              position={[-0.009, -0.15, -2.825]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2248.geometry}
              material={materials.Grass_C}
              position={[-0.051, -0.159, -2.77]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2250.geometry}
              material={materials.Grass_C}
              position={[-0.012, -0.153, -2.797]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2252.geometry}
              material={materials.Grass_C}
              position={[-0.246, -0.182, -2.782]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2254.geometry}
              material={materials.Grass_C}
              position={[-0.214, -0.19, -2.652]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2256.geometry}
              material={materials.Grass_C}
              position={[-0.06, -0.159, -2.794]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2258.geometry}
              material={materials.Grass_C}
              position={[0.274, -0.082, -3.193]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2260.geometry}
              material={materials.Grass_C}
              position={[0.057, -0.103, -3.197]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2262.geometry}
              material={materials.Grass_C}
              position={[0.029, -0.105, -3.2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2264.geometry}
              material={materials.Grass_C}
              position={[0.281, -0.082, -3.192]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2266.geometry}
              material={materials.Grass_C}
              position={[0.239, -0.073, -3.316]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2268.geometry}
              material={materials.Grass_C}
              position={[0.022, -0.104, -3.216]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2270.geometry}
              material={materials.Grass_C}
              position={[0.107, -0.091, -3.254]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2272.geometry}
              material={materials.Grass_C}
              position={[0.056, -0.098, -3.238]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2274.geometry}
              material={materials.Grass_C}
              position={[0.167, -0.083, -3.276]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2276.geometry}
              material={materials.Grass_C}
              position={[0.257, -0.084, -3.193]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2278.geometry}
              material={materials.Grass_C}
              position={[0.274, -0.074, -3.278]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2280.geometry}
              material={materials.Grass_C}
              position={[0.252, -0.102, -3.01]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2282.geometry}
              material={materials.Grass_C}
              position={[0.221, -0.096, -3.111]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2284.geometry}
              material={materials.Grass_C}
              position={[0.015, -0.12, -3.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2286.geometry}
              material={materials.Grass_C}
              position={[-0.001, -0.119, -3.106]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2288.geometry}
              material={materials.Grass_C}
              position={[0.147, -0.103, -3.114]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2290.geometry}
              material={materials.Grass_C}
              position={[0.487, -0.077, -3.002]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2292.geometry}
              material={materials.Grass_C}
              position={[0.309, -0.084, -3.144]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2294.geometry}
              material={materials.Grass_C}
              position={[0.45, -0.074, -3.104]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2296.geometry}
              material={materials.Grass_C}
              position={[0.648, -0.053, -3.19]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2298.geometry}
              material={materials.Grass_C}
              position={[0.786, -0.052, -2.94]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2300.geometry}
              material={materials.Grass_C}
              position={[0.625, -0.064, -2.974]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2302.geometry}
              material={materials.Grass_C}
              position={[0.907, -0.043, -2.893]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2304.geometry}
              material={materials.Grass_C}
              position={[1.009, -0.035, -2.968]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2306.geometry}
              material={materials.Grass_C}
              position={[0.941, -0.04, -2.932]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2308.geometry}
              material={materials.Grass_C}
              position={[1.405, -0.009, -2.943]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2310.geometry}
              material={materials.Grass_C}
              position={[1.446, -0.006, -2.939]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2312.geometry}
              material={materials.Grass_C}
              position={[1.273, -0.018, -2.803]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2314.geometry}
              material={materials.Grass_C}
              position={[1.228, -0.021, -2.859]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2316.geometry}
              material={materials.Grass_C}
              position={[1.462, -0.009, -2.616]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2318.geometry}
              material={materials.Grass_C}
              position={[1.666, -0.002, -2.517]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2320.geometry}
              material={materials.Grass_C}
              position={[1.611, 0.004, -2.711]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2322.geometry}
              material={materials.Grass_C}
              position={[1.838, 0.022, -2.741]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2324.geometry}
              material={materials.Grass_C}
              position={[1.868, 0.013, -2.589]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2326.geometry}
              material={materials.Grass_C}
              position={[1.99, 0.013, -2.515]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2328.geometry}
              material={materials.Grass_C}
              position={[1.914, 0.018, -2.631]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2330.geometry}
              material={materials.Grass_C}
              position={[1.861, 0.007, -2.525]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2332.geometry}
              material={materials.Grass_C}
              position={[1.901, -0.003, -2.392]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2334.geometry}
              material={materials.Grass_C}
              position={[1.96, 0.009, -2.479]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2336.geometry}
              material={materials.Grass_C}
              position={[1.898, 0.005, -2.481]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2338.geometry}
              material={materials.Grass_C}
              position={[2.122, -0.033, -2.124]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2340.geometry}
              material={materials.Grass_C}
              position={[2.082, -0.006, -2.322]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2342.geometry}
              material={materials.Grass_C}
              position={[2.049, 0.002, -2.39]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2344.geometry}
              material={materials.Grass_C}
              position={[2.059, -0.006, -2.33]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2346.geometry}
              material={materials.Grass_C}
              position={[2.006, 0.001, -2.39]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2348.geometry}
              material={materials.Grass_C}
              position={[2.196, -0.015, -2.24]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2350.geometry}
              material={materials.Grass_C}
              position={[2.334, -0.001, -2.32]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2352.geometry}
              material={materials.Grass_C}
              position={[2.456, -0.032, -2.117]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2354.geometry}
              material={materials.Grass_C}
              position={[2.525, -0.024, -2.167]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2356.geometry}
              material={materials.Grass_C}
              position={[2.462, -0.033, -2.105]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2358.geometry}
              material={materials.Grass_C}
              position={[2.382, -0.003, -2.31]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2360.geometry}
              material={materials.Grass_C}
              position={[2.441, -0.045, -2.028]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2362.geometry}
              material={materials.Grass_C}
              position={[2.414, -0.005, -2.294]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2364.geometry}
              material={materials.Grass_C}
              position={[2.427, -0.032, -2.113]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2366.geometry}
              material={materials.Grass_C}
              position={[2.277, -0.037, -2.091]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2368.geometry}
              material={materials.Grass_C}
              position={[2.213, -0.037, -2.092]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2370.geometry}
              material={materials.Grass_C}
              position={[2.192, -0.032, -2.127]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2372.geometry}
              material={materials.Grass_C}
              position={[2.324, -0.044, -2.038]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2374.geometry}
              material={materials.Grass_C}
              position={[2.435, -0.062, -1.916]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2376.geometry}
              material={materials.Grass_C}
              position={[2.35, -0.073, -1.849]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2378.geometry}
              material={materials.Grass_C}
              position={[2.515, -0.091, -1.723]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2380.geometry}
              material={materials.Grass_C}
              position={[2.489, -0.063, -1.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2382.geometry}
              material={materials.Grass_C}
              position={[2.544, -0.091, -1.72]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2384.geometry}
              material={materials.Grass_C}
              position={[2.477, -0.088, -1.743]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2386.geometry}
              material={materials.Grass_C}
              position={[2.438, -0.073, -1.844]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2388.geometry}
              material={materials.Grass_C}
              position={[2.346, -0.066, -1.901]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2390.geometry}
              material={materials.Grass_C}
              position={[2.42, -0.08, -1.798]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2392.geometry}
              material={materials.Grass_C}
              position={[2.89, -0.093, -1.654]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2394.geometry}
              material={materials.Grass_C}
              position={[2.712, -0.083, -1.757]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2396.geometry}
              material={materials.Grass_C}
              position={[2.911, -0.099, -1.6]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2398.geometry}
              material={materials.Grass_C}
              position={[2.923, -0.1, -1.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2400.geometry}
              material={materials.Grass_C}
              position={[2.821, -0.111, -1.519]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2402.geometry}
              material={materials.Grass_C}
              position={[2.73, -0.09, -1.696]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2404.geometry}
              material={materials.Grass_C}
              position={[2.672, -0.095, -1.661]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2406.geometry}
              material={materials.Grass_C}
              position={[2.62, -0.108, -1.577]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2408.geometry}
              material={materials.Grass_C}
              position={[2.568, -0.092, -1.707]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2410.geometry}
              material={materials.Grass_C}
              position={[2.712, -0.138, -1.308]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2412.geometry}
              material={materials.Grass_C}
              position={[2.827, -0.14, -1.226]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2414.geometry}
              material={materials.Grass_C}
              position={[2.773, -0.14, -1.251]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2416.geometry}
              material={materials.Grass_C}
              position={[2.809, -0.147, -1.175]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2418.geometry}
              material={materials.Grass_C}
              position={[2.657, -0.135, -1.36]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2420.geometry}
              material={materials.Grass_C}
              position={[3.099, -0.135, -1.049]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2422.geometry}
              material={materials.Grass_C}
              position={[3.068, -0.128, -1.216]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2424.geometry}
              material={materials.Grass_C}
              position={[3.078, -0.127, -1.23]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2426.geometry}
              material={materials.Grass_C}
              position={[3.167, -0.134, -0.981]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2428.geometry}
              material={materials.Grass_C}
              position={[2.999, -0.141, -1.051]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2430.geometry}
              material={materials.Grass_C}
              position={[3.112, -0.132, -1.08]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2432.geometry}
              material={materials.Grass_C}
              position={[3.117, -0.132, -1.073]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2434.geometry}
              material={materials.Grass_C}
              position={[3.058, -0.128, -1.222]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2436.geometry}
              material={materials.Grass_C}
              position={[2.999, -0.136, -1.133]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2438.geometry}
              material={materials.Grass_C}
              position={[2.953, -0.139, -1.144]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2440.geometry}
              material={materials.Grass_C}
              position={[2.855, -0.15, -1.065]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2442.geometry}
              material={materials.Grass_C}
              position={[2.981, -0.151, -0.843]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2444.geometry}
              material={materials.Grass_C}
              position={[2.919, -0.156, -0.859]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2446.geometry}
              material={materials.Grass_C}
              position={[2.914, -0.157, -0.778]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2448.geometry}
              material={materials.Grass_C}
              position={[2.96, -0.153, -0.69]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2450.geometry}
              material={materials.Grass_C}
              position={[3.024, -0.147, -0.645]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2452.geometry}
              material={materials.Grass_C}
              position={[2.898, -0.158, -0.806]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2454.geometry}
              material={materials.Grass_C}
              position={[2.955, -0.153, -0.86]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2456.geometry}
              material={materials.Grass_C}
              position={[3.274, -0.126, -0.631]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2458.geometry}
              material={materials.Grass_C}
              position={[3.217, -0.13, -0.61]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2460.geometry}
              material={materials.Grass_C}
              position={[3.232, -0.124, -0.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2462.geometry}
              material={materials.Grass_C}
              position={[3.225, -0.127, -0.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2464.geometry}
              material={materials.Grass_C}
              position={[3.221, -0.128, -0.529]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2466.geometry}
              material={materials.Grass_C}
              position={[3.19, -0.133, -0.631]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2468.geometry}
              material={materials.Grass_C}
              position={[3.186, -0.129, -0.435]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2470.geometry}
              material={materials.Grass_C}
              position={[3.023, -0.145, -0.477]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2472.geometry}
              material={materials.Grass_C}
              position={[3.034, -0.14, -0.329]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2474.geometry}
              material={materials.Grass_C}
              position={[2.969, -0.147, -0.354]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2476.geometry}
              material={materials.Grass_C}
              position={[3.088, -0.137, -0.409]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2478.geometry}
              material={materials.Grass_C}
              position={[3.01, -0.15, -0.046]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2480.geometry}
              material={materials.Grass_C}
              position={[3.161, -0.133, -0.053]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2482.geometry}
              material={materials.Grass_C}
              position={[3.055, -0.146, -0.023]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2484.geometry}
              material={materials.Grass_C}
              position={[3.143, -0.131, -0.224]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2486.geometry}
              material={materials.Grass_C}
              position={[3.002, -0.145, -0.221]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2488.geometry}
              material={materials.Grass_C}
              position={[3.026, -0.141, -0.266]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2490.geometry}
              material={materials.Grass_C}
              position={[3.187, -0.131, 0.003]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2492.geometry}
              material={materials.Grass_C}
              position={[3.297, -0.122, 0.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2494.geometry}
              material={materials.Grass_C}
              position={[3.166, -0.14, 0.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2496.geometry}
              material={materials.Grass_C}
              position={[3.137, -0.143, 0.073]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2498.geometry}
              material={materials.Grass_C}
              position={[3.116, -0.156, 0.208]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2500.geometry}
              material={materials.Grass_C}
              position={[3.088, -0.145, 0.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2502.geometry}
              material={materials.Grass_C}
              position={[3.013, -0.16, 0.098]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2504.geometry}
              material={materials.Grass_C}
              position={[3.135, -0.138, 0.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2506.geometry}
              material={materials.Grass_C}
              position={[3.12, -0.148, 0.117]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2508.geometry}
              material={materials.Grass_C}
              position={[3.121, -0.186, 0.51]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2510.geometry}
              material={materials.Grass_C}
              position={[3.042, -0.175, 0.319]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2512.geometry}
              material={materials.Grass_C}
              position={[3.002, -0.181, 0.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2514.geometry}
              material={materials.Grass_C}
              position={[3.022, -0.198, 0.494]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2516.geometry}
              material={materials.Grass_C}
              position={[2.967, -0.198, 0.429]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2518.geometry}
              material={materials.Grass_C}
              position={[3.085, -0.217, 0.72]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2520.geometry}
              material={materials.Grass_C}
              position={[3.277, -0.181, 0.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2522.geometry}
              material={materials.Grass_C}
              position={[3.141, -0.212, 0.758]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2524.geometry}
              material={materials.Grass_C}
              position={[3.183, -0.217, 0.861]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2526.geometry}
              material={materials.Grass_C}
              position={[3.123, -0.216, 0.763]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2528.geometry}
              material={materials.Grass_C}
              position={[3.133, -0.199, 0.635]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2530.geometry}
              material={materials.Grass_C}
              position={[3.088, -0.221, 0.761]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2532.geometry}
              material={materials.Grass_C}
              position={[2.921, -0.256, 0.809]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2534.geometry}
              material={materials.Grass_C}
              position={[3.03, -0.237, 0.806]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2536.geometry}
              material={materials.Grass_C}
              position={[2.945, -0.239, 0.715]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2538.geometry}
              material={materials.Grass_C}
              position={[2.987, -0.22, 0.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2540.geometry}
              material={materials.Grass_C}
              position={[2.928, -0.283, 1.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2542.geometry}
              material={materials.Grass_C}
              position={[2.827, -0.299, 0.977]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2544.geometry}
              material={materials.Grass_C}
              position={[2.938, -0.297, 1.145]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2546.geometry}
              material={materials.Grass_C}
              position={[2.886, -0.325, 1.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2548.geometry}
              material={materials.Grass_C}
              position={[2.574, -0.414, 1.827]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2550.geometry}
              material={materials.Grass_C}
              position={[1.356, -0.327, 2.735]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2552.geometry}
              material={materials.Grass_C}
              position={[1.358, -0.337, 2.703]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2554.geometry}
              material={materials.Grass_C}
              position={[1.363, -0.306, 2.812]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2556.geometry}
              material={materials.Grass_C}
              position={[1.338, -0.296, 2.841]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2558.geometry}
              material={materials.Grass_C}
              position={[0.936, -0.208, 3.047]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2560.geometry}
              material={materials.Grass_C}
              position={[1.095, -0.215, 3.08]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2562.geometry}
              material={materials.Grass_C}
              position={[0.956, -0.201, 3.091]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2564.geometry}
              material={materials.Grass_C}
              position={[1.128, -0.233, 3.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2566.geometry}
              material={materials.Grass_C}
              position={[0.984, -0.185, 3.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2568.geometry}
              material={materials.Grass_C}
              position={[1.162, -0.239, 3.002]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2570.geometry}
              material={materials.Grass_C}
              position={[0.933, -0.229, 2.946]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2572.geometry}
              material={materials.Grass_C}
              position={[0.897, -0.243, 2.851]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2574.geometry}
              material={materials.Grass_C}
              position={[0.919, -0.237, 2.898]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2576.geometry}
              material={materials.Grass_C}
              position={[1.12, -0.284, 2.8]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2578.geometry}
              material={materials.Grass_C}
              position={[0.619, -0.18, 3.049]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2580.geometry}
              material={materials.Grass_C}
              position={[0.705, -0.192, 3.028]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2582.geometry}
              material={materials.Grass_C}
              position={[0.644, -0.187, 3.024]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2584.geometry}
              material={materials.Grass_C}
              position={[0.363, -0.141, 3.171]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2586.geometry}
              material={materials.Grass_C}
              position={[0.518, -0.16, 3.127]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2588.geometry}
              material={materials.Grass_C}
              position={[0.653, -0.145, 3.284]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2590.geometry}
              material={materials.Grass_C}
              position={[0.388, -0.138, 3.207]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2592.geometry}
              material={materials.Grass_C}
              position={[0.572, -0.153, 3.198]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2594.geometry}
              material={materials.Grass_C}
              position={[0.584, -0.162, 3.152]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2596.geometry}
              material={materials.Grass_C}
              position={[0.428, -0.145, 3.178]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2598.geometry}
              material={materials.Grass_C}
              position={[0.441, -0.129, 3.299]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2600.geometry}
              material={materials.Grass_C}
              position={[0.578, -0.171, 3.083]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2602.geometry}
              material={materials.Grass_C}
              position={[0.577, -0.178, 3.036]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2604.geometry}
              material={materials.Grass_C}
              position={[0.566, -0.171, 3.081]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2606.geometry}
              material={materials.Grass_C}
              position={[0.472, -0.168, 3.038]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2608.geometry}
              material={materials.Grass_C}
              position={[0.536, -0.176, 3.025]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2610.geometry}
              material={materials.Grass_C}
              position={[0.415, -0.161, 3.047]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2612.geometry}
              material={materials.Grass_C}
              position={[0.582, -0.183, 3.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2614.geometry}
              material={materials.Grass_C}
              position={[0.111, -0.123, 3.161]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2616.geometry}
              material={materials.Grass_C}
              position={[0.212, -0.145, 3.012]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2618.geometry}
              material={materials.Grass_C}
              position={[0.088, -0.126, 3.102]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2620.geometry}
              material={materials.Grass_C}
              position={[-0.143, -0.105, 3.217]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2622.geometry}
              material={materials.Grass_C}
              position={[-0.118, -0.107, 3.193]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2624.geometry}
              material={materials.Grass_C}
              position={[-0.243, -0.101, 3.249]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2626.geometry}
              material={materials.Grass_C}
              position={[-0.242, -0.103, 3.16]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2628.geometry}
              material={materials.Grass_C}
              position={[-0.05, -0.112, 3.162]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2630.geometry}
              material={materials.Grass_C}
              position={[-0.037, -0.114, 3.146]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2632.geometry}
              material={materials.Grass_C}
              position={[-0.612, -0.099, 3.1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2634.geometry}
              material={materials.Grass_C}
              position={[-0.424, -0.101, 3.086]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2636.geometry}
              material={materials.Grass_C}
              position={[-0.486, -0.1, 3.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2638.geometry}
              material={materials.Grass_C}
              position={[-0.512, -0.103, 3.023]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2640.geometry}
              material={materials.Grass_C}
              position={[-0.805, -0.093, 3.243]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2642.geometry}
              material={materials.Grass_C}
              position={[-0.781, -0.112, 2.886]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2644.geometry}
              material={materials.Grass_C}
              position={[-0.858, -0.113, 2.891]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2646.geometry}
              material={materials.Grass_C}
              position={[-0.761, -0.104, 3.007]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2648.geometry}
              material={materials.Grass_C}
              position={[-0.97, -0.103, 3.004]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2650.geometry}
              material={materials.Grass_C}
              position={[-1.107, -0.116, 2.87]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2652.geometry}
              material={materials.Grass_C}
              position={[-1.046, -0.122, 2.809]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2654.geometry}
              material={materials.Grass_C}
              position={[-1.098, -0.107, 2.959]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2656.geometry}
              material={materials.Grass_C}
              position={[-0.951, -0.111, 2.913]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2658.geometry}
              material={materials.Grass_C}
              position={[-1.085, -0.111, 2.911]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2660.geometry}
              material={materials.Grass_C}
              position={[-1.28, -0.107, 2.923]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2662.geometry}
              material={materials.Grass_C}
              position={[-1.298, -0.095, 3.09]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2664.geometry}
              material={materials.Grass_C}
              position={[-1.397, -0.136, 2.649]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2666.geometry}
              material={materials.Grass_C}
              position={[-1.297, -0.12, 2.799]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2668.geometry}
              material={materials.Grass_C}
              position={[-1.213, -0.127, 2.759]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2670.geometry}
              material={materials.Grass_C}
              position={[-1.319, -0.132, 2.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2672.geometry}
              material={materials.Grass_C}
              position={[-1.34, -0.115, 2.83]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2674.geometry}
              material={materials.Grass_C}
              position={[-1.311, -0.112, 2.863]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2676.geometry}
              material={materials.Grass_C}
              position={[-1.474, -0.115, 2.777]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2678.geometry}
              material={materials.Grass_C}
              position={[-1.662, -0.108, 2.652]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2680.geometry}
              material={materials.Grass_C}
              position={[-1.584, -0.129, 2.569]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2682.geometry}
              material={materials.Grass_C}
              position={[-1.507, -0.122, 2.69]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2684.geometry}
              material={materials.Grass_C}
              position={[-1.592, -0.115, 2.663]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2686.geometry}
              material={materials.Grass_C}
              position={[-1.491, -0.116, 2.757]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2688.geometry}
              material={materials.Grass_C}
              position={[-1.992, -0.069, 2.526]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2690.geometry}
              material={materials.Grass_C}
              position={[-1.98, -0.075, 2.497]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2692.geometry}
              material={materials.Grass_C}
              position={[-1.953, -0.091, 2.439]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2694.geometry}
              material={materials.Grass_C}
              position={[-1.829, -0.11, 2.472]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2696.geometry}
              material={materials.Grass_C}
              position={[-1.805, -0.101, 2.553]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2698.geometry}
              material={materials.Grass_C}
              position={[-1.715, -0.117, 2.544]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2700.geometry}
              material={materials.Grass_C}
              position={[-1.861, -0.1, 2.495]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2702.geometry}
              material={materials.Grass_C}
              position={[-1.883, -0.113, 2.405]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2704.geometry}
              material={materials.Grass_C}
              position={[-1.905, -0.087, 2.516]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2706.geometry}
              material={materials.Grass_C}
              position={[-1.774, -0.101, 2.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2708.geometry}
              material={materials.Grass_C}
              position={[-1.929, -0.108, 2.388]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2710.geometry}
              material={materials.Grass_C}
              position={[-1.863, -0.103, 2.473]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2712.geometry}
              material={materials.Grass_C}
              position={[-2.14, -0.084, 2.278]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2714.geometry}
              material={materials.Grass_C}
              position={[-2.114, -0.093, 2.269]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2716.geometry}
              material={materials.Grass_C}
              position={[-2.153, -0.114, 2.162]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2718.geometry}
              material={materials.Grass_C}
              position={[-2.114, -0.096, 2.257]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2720.geometry}
              material={materials.Grass_C}
              position={[-1.951, -0.109, 2.36]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2722.geometry}
              material={materials.Grass_C}
              position={[-2.377, -0.066, 2.108]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2724.geometry}
              material={materials.Grass_C}
              position={[-2.479, -0.051, 2.058]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2726.geometry}
              material={materials.Grass_C}
              position={[-2.388, -0.017, 2.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2728.geometry}
              material={materials.Grass_C}
              position={[-2.504, -0.045, 2.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2730.geometry}
              material={materials.Grass_C}
              position={[-2.328, -0.105, 2.03]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2732.geometry}
              material={materials.Grass_C}
              position={[-2.577, -0.096, 1.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2734.geometry}
              material={materials.Grass_C}
              position={[-2.587, -0.115, 1.749]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2736.geometry}
              material={materials.Grass_C}
              position={[-2.48, -0.119, 1.842]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2738.geometry}
              material={materials.Grass_C}
              position={[-2.451, -0.096, 1.938]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2740.geometry}
              material={materials.Grass_C}
              position={[-2.441, -0.117, 1.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2742.geometry}
              material={materials.Grass_C}
              position={[-2.586, -0.092, 1.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2744.geometry}
              material={materials.Grass_C}
              position={[-2.782, -0.078, 1.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2746.geometry}
              material={materials.Grass_C}
              position={[-2.623, -0.147, 1.613]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2748.geometry}
              material={materials.Grass_C}
              position={[-2.662, -0.208, 1.374]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2750.geometry}
              material={materials.Grass_C}
              position={[-2.676, -0.194, 1.405]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2752.geometry}
              material={materials.Grass_C}
              position={[-2.781, -0.177, 1.329]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2754.geometry}
              material={materials.Grass_C}
              position={[-3.038, -0.126, 1.224]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2756.geometry}
              material={materials.Grass_C}
              position={[-2.962, -0.154, 1.182]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2758.geometry}
              material={materials.Grass_C}
              position={[-2.977, -0.147, 1.198]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2760.geometry}
              material={materials.Grass_C}
              position={[-3.06, -0.158, 1.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2762.geometry}
              material={materials.Grass_C}
              position={[-2.972, -0.189, 0.963]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2764.geometry}
              material={materials.Grass_C}
              position={[-2.832, -0.216, 1.078]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2766.geometry}
              material={materials.Grass_C}
              position={[-3.05, -0.191, 0.661]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2768.geometry}
              material={materials.Grass_C}
              position={[-3.031, -0.197, 0.646]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2770.geometry}
              material={materials.Grass_C}
              position={[-2.978, -0.211, 0.653]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2772.geometry}
              material={materials.Grass_C}
              position={[-3.289, -0.141, 0.537]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2774.geometry}
              material={materials.Grass_C}
              position={[-3.243, -0.15, 0.449]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2776.geometry}
              material={materials.Grass_C}
              position={[-3.182, -0.161, 0.381]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2778.geometry}
              material={materials.Grass_C}
              position={[-3.264, -0.146, 0.438]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2780.geometry}
              material={materials.Grass_C}
              position={[-3.119, -0.174, 0.336]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2782.geometry}
              material={materials.Grass_C}
              position={[-3.293, -0.121, -0.144]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2784.geometry}
              material={materials.Grass_C}
              position={[-3.316, -0.126, -0.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2786.geometry}
              material={materials.Grass_C}
              position={[-3.3, -0.111, -0.282]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2788.geometry}
              material={materials.Grass_C}
              position={[-3.28, -0.113, -0.303]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2790.geometry}
              material={materials.Grass_C}
              position={[-3.001, -0.187, -0.037]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2792.geometry}
              material={materials.Grass_C}
              position={[-3.035, -0.173, -0.22]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2794.geometry}
              material={materials.Grass_C}
              position={[-2.988, -0.188, -0.098]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2796.geometry}
              material={materials.Grass_C}
              position={[-3.156, -0.145, -0.2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2798.geometry}
              material={materials.Grass_C}
              position={[-2.993, -0.178, -0.401]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2800.geometry}
              material={materials.Grass_C}
              position={[-3.184, -0.115, -0.899]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2802.geometry}
              material={materials.Grass_C}
              position={[-3.135, -0.131, -0.689]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2804.geometry}
              material={materials.Grass_C}
              position={[-2.992, -0.166, -0.828]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2806.geometry}
              material={materials.Grass_C}
              position={[-2.977, -0.171, -1.235]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2808.geometry}
              material={materials.Grass_C}
              position={[-2.82, -0.218, -1.471]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2810.geometry}
              material={materials.Grass_C}
              position={[-2.884, -0.199, -1.394]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2812.geometry}
              material={materials.Grass_C}
              position={[-2.949, -0.18, -1.316]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2814.geometry}
              material={materials.Grass_C}
              position={[-2.8, -0.223, -1.414]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2816.geometry}
              material={materials.Grass_C}
              position={[-2.67, -0.251, -1.843]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2818.geometry}
              material={materials.Grass_C}
              position={[-2.56, -0.277, -1.883]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2820.geometry}
              material={materials.Grass_C}
              position={[-2.655, -0.255, -1.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2822.geometry}
              material={materials.Grass_C}
              position={[-2.647, -0.246, -1.978]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2824.geometry}
              material={materials.Grass_C}
              position={[-2.465, -0.292, -2.02]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2826.geometry}
              material={materials.Grass_C}
              position={[-2.552, -0.263, -2.061]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2828.geometry}
              material={materials.Grass_C}
              position={[-2.159, -0.283, -2.439]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2830.geometry}
              material={materials.Grass_C}
              position={[-2.158, -0.322, -2.28]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2832.geometry}
              material={materials.Grass_C}
              position={[-1.747, -0.244, -2.821]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2834.geometry}
              material={materials.Grass_C}
              position={[-1.09, -0.234, -2.99]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2836.geometry}
              material={materials.Grass_C}
              position={[-1.182, -0.236, -2.987]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2838.geometry}
              material={materials.Grass_C}
              position={[-1.073, -0.204, -3.12]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2840.geometry}
              material={materials.Grass_C}
              position={[-1.123, -0.212, -3.086]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2842.geometry}
              material={materials.Grass_C}
              position={[-1.127, -0.201, -3.13]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2844.geometry}
              material={materials.Grass_C}
              position={[-0.604, -0.201, -2.971]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2846.geometry}
              material={materials.Grass_C}
              position={[-0.577, -0.158, -3.241]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2848.geometry}
              material={materials.Grass_C}
              position={[-0.349, -0.169, -3.003]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2850.geometry}
              material={materials.Grass_C}
              position={[-0.558, -0.185, -3.045]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2852.geometry}
              material={materials.Grass_C}
              position={[-0.339, -0.166, -3.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2854.geometry}
              material={materials.Grass_C}
              position={[-0.092, -0.141, -3.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2856.geometry}
              material={materials.Grass_C}
              position={[-0.156, -0.139, -3.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2858.geometry}
              material={materials.Grass_C}
              position={[-0.221, -0.153, -3.018]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2860.geometry}
              material={materials.Grass_C}
              position={[-0.273, -0.158, -3.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2862.geometry}
              material={materials.Grass_C}
              position={[-0.257, -0.154, -3.04]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2864.geometry}
              material={materials.Grass_C}
              position={[-0.134, -0.133, -3.111]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2866.geometry}
              material={materials.Grass_C}
              position={[-0.071, -0.132, -3.065]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2868.geometry}
              material={materials.Grass_C}
              position={[-0.154, -0.134, -3.114]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2870.geometry}
              material={materials.Grass_C}
              position={[0.178, -0.045, -3.612]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2872.geometry}
              material={materials.Grass_C}
              position={[0.127, -0.039, -3.689]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2874.geometry}
              material={materials.Grass_C}
              position={[0.008, -0.048, -3.659]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2876.geometry}
              material={materials.Grass_C}
              position={[0.162, -0.042, -3.647]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2878.geometry}
              material={materials.Grass_C}
              position={[0.243, -0.035, -3.69]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2880.geometry}
              material={materials.Grass_C}
              position={[0.114, -0.069, -3.438]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2882.geometry}
              material={materials.Grass_C}
              position={[0.2, -0.059, -3.472]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2884.geometry}
              material={materials.Grass_C}
              position={[0.315, -0.057, -3.418]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2886.geometry}
              material={materials.Grass_C}
              position={[0.274, -0.052, -3.499]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2888.geometry}
              material={materials.Grass_C}
              position={[0.18, -0.058, -3.495]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2890.geometry}
              material={materials.Grass_C}
              position={[0.527, -0.052, -3.344]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2892.geometry}
              material={materials.Grass_C}
              position={[0.45, -0.056, -3.34]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2894.geometry}
              material={materials.Grass_C}
              position={[0.483, -0.051, -3.385]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2896.geometry}
              material={materials.Grass_C}
              position={[0.623, -0.048, -3.322]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2898.geometry}
              material={materials.Grass_C}
              position={[0.655, -0.042, -3.4]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2900.geometry}
              material={materials.Grass_C}
              position={[0.543, -0.052, -3.333]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2902.geometry}
              material={materials.Grass_C}
              position={[1.033, -0.027, -3.529]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2904.geometry}
              material={materials.Grass_C}
              position={[0.692, -0.041, -3.397]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2906.geometry}
              material={materials.Grass_C}
              position={[0.882, -0.034, -3.391]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2908.geometry}
              material={materials.Grass_C}
              position={[1.093, -0.029, -3.189]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2910.geometry}
              material={materials.Grass_C}
              position={[1.616, 0.004, -3.049]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2912.geometry}
              material={materials.Grass_C}
              position={[1.837, 0.023, -2.947]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2914.geometry}
              material={materials.Grass_C}
              position={[2.066, 0.038, -2.982]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2916.geometry}
              material={materials.Grass_C}
              position={[2.073, 0.036, -2.843]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2918.geometry}
              material={materials.Grass_C}
              position={[1.998, 0.035, -2.892]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2920.geometry}
              material={materials.Grass_C}
              position={[2.197, 0.043, -2.886]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2922.geometry}
              material={materials.Grass_C}
              position={[2.166, 0.04, -2.836]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2924.geometry}
              material={materials.Grass_C}
              position={[2.029, 0.036, -2.908]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2926.geometry}
              material={materials.Grass_C}
              position={[2.029, 0.036, -2.984]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2928.geometry}
              material={materials.Grass_C}
              position={[2.254, 0.042, -2.754]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2930.geometry}
              material={materials.Grass_C}
              position={[2.125, 0.028, -2.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2932.geometry}
              material={materials.Grass_C}
              position={[2.139, 0.03, -2.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2934.geometry}
              material={materials.Grass_C}
              position={[2.159, 0.038, -2.746]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2936.geometry}
              material={materials.Grass_C}
              position={[2.083, 0.033, -2.74]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2938.geometry}
              material={materials.Grass_C}
              position={[2.172, 0.033, -2.645]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2940.geometry}
              material={materials.Grass_C}
              position={[2.229, 0.036, -2.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2942.geometry}
              material={materials.Grass_C}
              position={[2.322, 0.02, -2.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2944.geometry}
              material={materials.Grass_C}
              position={[2.25, 0.031, -2.621]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2946.geometry}
              material={materials.Grass_C}
              position={[2.153, 0.03, -2.621]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2948.geometry}
              material={materials.Grass_C}
              position={[2.27, 0.03, -2.607]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2950.geometry}
              material={materials.Grass_C}
              position={[2.366, 0.025, -2.539]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2952.geometry}
              material={materials.Grass_C}
              position={[2.301, 0.018, -2.485]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2954.geometry}
              material={materials.Grass_C}
              position={[2.733, -0.005, -2.321]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2956.geometry}
              material={materials.Grass_C}
              position={[2.664, 0.011, -2.44]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2958.geometry}
              material={materials.Grass_C}
              position={[2.687, -0.001, -2.35]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2960.geometry}
              material={materials.Grass_C}
              position={[2.655, -0.003, -2.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2962.geometry}
              material={materials.Grass_C}
              position={[2.571, -0.003, -2.32]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2964.geometry}
              material={materials.Grass_C}
              position={[2.534, 0, -2.337]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2966.geometry}
              material={materials.Grass_C}
              position={[2.471, 0.018, -2.461]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2968.geometry}
              material={materials.Grass_C}
              position={[2.5, -0.003, -2.309]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2970.geometry}
              material={materials.Grass_C}
              position={[2.601, -0.012, -2.258]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2972.geometry}
              material={materials.Grass_C}
              position={[2.467, -0.008, -2.272]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2974.geometry}
              material={materials.Grass_C}
              position={[2.696, -0.027, -2.153]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2976.geometry}
              material={materials.Grass_C}
              position={[2.845, -0.054, -1.979]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2978.geometry}
              material={materials.Grass_C}
              position={[2.761, -0.031, -2.135]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2980.geometry}
              material={materials.Grass_C}
              position={[2.788, -0.059, -1.936]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2982.geometry}
              material={materials.Grass_C}
              position={[3.112, -0.087, -1.704]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2984.geometry}
              material={materials.Grass_C}
              position={[3.081, -0.09, -1.665]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2986.geometry}
              material={materials.Grass_C}
              position={[3.095, -0.065, -1.91]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2988.geometry}
              material={materials.Grass_C}
              position={[3.001, -0.075, -1.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2990.geometry}
              material={materials.Grass_C}
              position={[2.823, -0.074, -1.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2992.geometry}
              material={materials.Grass_C}
              position={[2.881, -0.077, -1.792]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2994.geometry}
              material={materials.Grass_C}
              position={[2.972, -0.094, -1.633]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2996.geometry}
              material={materials.Grass_C}
              position={[3.202, -0.115, -1.338]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2998.geometry}
              material={materials.Grass_C}
              position={[3.154, -0.118, -1.319]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3000.geometry}
              material={materials.Grass_C}
              position={[3.097, -0.116, -1.353]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3002.geometry}
              material={materials.Grass_C}
              position={[3.071, -0.105, -1.498]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3004.geometry}
              material={materials.Grass_C}
              position={[3.034, -0.099, -1.58]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3006.geometry}
              material={materials.Grass_C}
              position={[3.396, -0.114, -1.145]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3008.geometry}
              material={materials.Grass_C}
              position={[3.374, -0.107, -1.377]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3010.geometry}
              material={materials.Grass_C}
              position={[3.362, -0.11, -1.303]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3012.geometry}
              material={materials.Grass_C}
              position={[3.442, -0.115, -1.059]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3014.geometry}
              material={materials.Grass_C}
              position={[3.157, -0.124, -1.179]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3016.geometry}
              material={materials.Grass_C}
              position={[3.28, -0.118, -1.171]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3018.geometry}
              material={materials.Grass_C}
              position={[3.16, -0.122, -1.23]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3020.geometry}
              material={materials.Grass_C}
              position={[3.219, -0.129, -1.021]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3022.geometry}
              material={materials.Grass_C}
              position={[3.271, -0.118, -1.196]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3024.geometry}
              material={materials.Grass_C}
              position={[3.302, -0.121, -1.085]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3026.geometry}
              material={materials.Grass_C}
              position={[3.215, -0.127, -1.068]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3028.geometry}
              material={materials.Grass_C}
              position={[3.157, -0.119, -1.297]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3030.geometry}
              material={materials.Grass_C}
              position={[3.181, -0.12, -1.243]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3032.geometry}
              material={materials.Grass_C}
              position={[3.374, -0.119, -0.831]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3034.geometry}
              material={materials.Grass_C}
              position={[3.322, -0.123, -0.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3036.geometry}
              material={materials.Grass_C}
              position={[3.343, -0.122, -0.871]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3038.geometry}
              material={materials.Grass_C}
              position={[3.515, -0.11, -0.6]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3040.geometry}
              material={materials.Grass_C}
              position={[3.553, -0.108, -0.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3042.geometry}
              material={materials.Grass_C}
              position={[3.467, -0.111, -0.519]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3044.geometry}
              material={materials.Grass_C}
              position={[3.499, -0.109, -0.465]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3046.geometry}
              material={materials.Grass_C}
              position={[3.467, -0.11, -0.476]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3048.geometry}
              material={materials.Grass_C}
              position={[3.416, -0.113, -0.426]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3050.geometry}
              material={materials.Grass_C}
              position={[3.325, -0.119, -0.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3052.geometry}
              material={materials.Grass_C}
              position={[3.331, -0.121, -0.584]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3054.geometry}
              material={materials.Grass_C}
              position={[3.465, -0.108, -0.223]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3056.geometry}
              material={materials.Grass_C}
              position={[3.48, -0.107, -0.079]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3058.geometry}
              material={materials.Grass_C}
              position={[3.421, -0.11, -0.067]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3060.geometry}
              material={materials.Grass_C}
              position={[3.5, -0.105, -0.062]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3062.geometry}
              material={materials.Grass_C}
              position={[3.459, -0.108, -0.083]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3064.geometry}
              material={materials.Grass_C}
              position={[3.469, -0.107, -0.037]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3066.geometry}
              material={materials.Grass_C}
              position={[3.398, -0.112, -0.208]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3068.geometry}
              material={materials.Grass_C}
              position={[3.636, -0.112, 0.313]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3070.geometry}
              material={materials.Grass_C}
              position={[3.621, -0.11, 0.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3072.geometry}
              material={materials.Grass_C}
              position={[3.599, -0.115, 0.329]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3074.geometry}
              material={materials.Grass_C}
              position={[3.558, -0.109, 0.128]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3076.geometry}
              material={materials.Grass_C}
              position={[3.584, -0.115, 0.293]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3078.geometry}
              material={materials.Grass_C}
              position={[3.613, -0.107, 0.126]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3080.geometry}
              material={materials.Grass_C}
              position={[3.521, -0.117, 0.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3082.geometry}
              material={materials.Grass_C}
              position={[3.624, -0.104, 0.051]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3084.geometry}
              material={materials.Grass_C}
              position={[3.541, -0.105, 0.033]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3086.geometry}
              material={materials.Grass_C}
              position={[3.59, -0.11, 0.168]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3088.geometry}
              material={materials.Grass_C}
              position={[3.475, -0.121, 0.248]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3090.geometry}
              material={materials.Grass_C}
              position={[3.452, -0.125, 0.29]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3092.geometry}
              material={materials.Grass_C}
              position={[3.332, -0.133, 0.248]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3094.geometry}
              material={materials.Grass_C}
              position={[3.475, -0.116, 0.164]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3096.geometry}
              material={materials.Grass_C}
              position={[3.324, -0.138, 0.312]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3098.geometry}
              material={materials.Grass_C}
              position={[3.395, -0.14, 0.41]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3100.geometry}
              material={materials.Grass_C}
              position={[3.463, -0.13, 0.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3102.geometry}
              material={materials.Grass_C}
              position={[3.437, -0.144, 0.501]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3104.geometry}
              material={materials.Grass_C}
              position={[3.368, -0.164, 0.622]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3106.geometry}
              material={materials.Grass_C}
              position={[3.425, -0.16, 0.661]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3108.geometry}
              material={materials.Grass_C}
              position={[3.451, -0.176, 0.978]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3110.geometry}
              material={materials.Grass_C}
              position={[3.533, -0.159, 0.932]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3112.geometry}
              material={materials.Grass_C}
              position={[3.469, -0.175, 1.044]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3114.geometry}
              material={materials.Grass_C}
              position={[3.442, -0.179, 0.998]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3116.geometry}
              material={materials.Grass_C}
              position={[3.42, -0.181, 0.949]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3118.geometry}
              material={materials.Grass_C}
              position={[3.422, -0.178, 0.901]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3120.geometry}
              material={materials.Grass_C}
              position={[3.453, -0.172, 0.892]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3122.geometry}
              material={materials.Grass_C}
              position={[3.48, -0.158, 0.732]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3124.geometry}
              material={materials.Grass_C}
              position={[3.431, -0.175, 0.888]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3126.geometry}
              material={materials.Grass_C}
              position={[3.437, -0.162, 0.71]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3128.geometry}
              material={materials.Grass_C}
              position={[3.357, -0.187, 0.868]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3130.geometry}
              material={materials.Grass_C}
              position={[3.278, -0.203, 0.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3132.geometry}
              material={materials.Grass_C}
              position={[3.376, -0.182, 0.848]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3134.geometry}
              material={materials.Grass_C}
              position={[3.339, -0.174, 0.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3136.geometry}
              material={materials.Grass_C}
              position={[3.338, -0.178, 0.722]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3138.geometry}
              material={materials.Grass_C}
              position={[3.274, -0.205, 0.904]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3140.geometry}
              material={materials.Grass_C}
              position={[3.27, -0.209, 0.941]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3142.geometry}
              material={materials.Grass_C}
              position={[3.312, -0.206, 1.046]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3144.geometry}
              material={materials.Grass_C}
              position={[3.231, -0.224, 1.194]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3146.geometry}
              material={materials.Grass_C}
              position={[3.274, -0.212, 0.998]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3148.geometry}
              material={materials.Grass_C}
              position={[3.282, -0.212, 1.174]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3150.geometry}
              material={materials.Grass_C}
              position={[3.338, -0.201, 1.034]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3152.geometry}
              material={materials.Grass_C}
              position={[3.236, -0.221, 1.312]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3154.geometry}
              material={materials.Grass_C}
              position={[3.227, -0.223, 1.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3156.geometry}
              material={materials.Grass_C}
              position={[3.34, -0.201, 1.028]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3158.geometry}
              material={materials.Grass_C}
              position={[3.382, -0.177, 1.401]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3160.geometry}
              material={materials.Grass_C}
              position={[3.13, -0.239, 1.562]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3162.geometry}
              material={materials.Grass_C}
              position={[3.235, -0.207, 1.534]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3164.geometry}
              material={materials.Grass_C}
              position={[3.107, -0.243, 1.612]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3166.geometry}
              material={materials.Grass_C}
              position={[3.156, -0.226, 1.604]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3168.geometry}
              material={materials.Grass_C}
              position={[3.115, -0.253, 1.424]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3170.geometry}
              material={materials.Grass_C}
              position={[3.01, -0.281, 1.572]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3172.geometry}
              material={materials.Grass_C}
              position={[3.086, -0.253, 1.575]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3174.geometry}
              material={materials.Grass_C}
              position={[2.997, -0.29, 1.494]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3176.geometry}
              material={materials.Grass_C}
              position={[3.12, -0.252, 1.42]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3178.geometry}
              material={materials.Grass_C}
              position={[2.949, -0.271, 1.855]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3180.geometry}
              material={materials.Grass_C}
              position={[2.453, -0.361, 2.323]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3182.geometry}
              material={materials.Grass_C}
              position={[1.865, -0.257, 3.003]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3184.geometry}
              material={materials.Grass_C}
              position={[1.943, -0.229, 3.085]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3186.geometry}
              material={materials.Grass_C}
              position={[1.898, -0.262, 2.983]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3188.geometry}
              material={materials.Grass_C}
              position={[1.769, -0.306, 2.853]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3190.geometry}
              material={materials.Grass_C}
              position={[1.875, -0.273, 2.948]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3192.geometry}
              material={materials.Grass_C}
              position={[1.828, -0.295, 2.884]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3194.geometry}
              material={materials.Grass_C}
              position={[1.415, -0.217, 3.143]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3196.geometry}
              material={materials.Grass_C}
              position={[1.592, -0.253, 3.034]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3198.geometry}
              material={materials.Grass_C}
              position={[1.319, -0.171, 3.311]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3200.geometry}
              material={materials.Grass_C}
              position={[1.4, -0.158, 3.379]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3202.geometry}
              material={materials.Grass_C}
              position={[1.124, -0.15, 3.378]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3204.geometry}
              material={materials.Grass_C}
              position={[1.316, -0.164, 3.343]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3206.geometry}
              material={materials.Grass_C}
              position={[1.164, -0.14, 3.432]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3208.geometry}
              material={materials.Grass_C}
              position={[1.325, -0.177, 3.288]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3210.geometry}
              material={materials.Grass_C}
              position={[1.203, -0.153, 3.378]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3212.geometry}
              material={materials.Grass_C}
              position={[1.043, -0.167, 3.285]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3214.geometry}
              material={materials.Grass_C}
              position={[1.023, -0.174, 3.245]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3216.geometry}
              material={materials.Grass_C}
              position={[1.103, -0.176, 3.256]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3218.geometry}
              material={materials.Grass_C}
              position={[1.152, -0.188, 3.212]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3220.geometry}
              material={materials.Grass_C}
              position={[1.089, -0.171, 3.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3222.geometry}
              material={materials.Grass_C}
              position={[0.76, -0.138, 3.359]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3224.geometry}
              material={materials.Grass_C}
              position={[0.816, -0.141, 3.361]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3226.geometry}
              material={materials.Grass_C}
              position={[0.754, -0.135, 3.372]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3228.geometry}
              material={materials.Grass_C}
              position={[0.943, -0.164, 3.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3230.geometry}
              material={materials.Grass_C}
              position={[0.872, -0.149, 3.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3232.geometry}
              material={materials.Grass_C}
              position={[0.962, -0.166, 3.27]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3234.geometry}
              material={materials.Grass_C}
              position={[0.632, -0.096, 3.573]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3236.geometry}
              material={materials.Grass_C}
              position={[0.652, -0.109, 3.495]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3238.geometry}
              material={materials.Grass_C}
              position={[0.361, -0.09, 3.567]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3240.geometry}
              material={materials.Grass_C}
              position={[0.59, -0.094, 3.584]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3242.geometry}
              material={materials.Grass_C}
              position={[0.556, -0.108, 3.483]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3244.geometry}
              material={materials.Grass_C}
              position={[0.663, -0.1, 3.55]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3246.geometry}
              material={materials.Grass_C}
              position={[0.401, -0.124, 3.319]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3248.geometry}
              material={materials.Grass_C}
              position={[0.631, -0.135, 3.336]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3250.geometry}
              material={materials.Grass_C}
              position={[0.649, -0.119, 3.435]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3252.geometry}
              material={materials.Grass_C}
              position={[0.411, -0.116, 3.376]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3254.geometry}
              material={materials.Grass_C}
              position={[0.357, -0.101, 3.472]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3256.geometry}
              material={materials.Grass_C}
              position={[0.16, -0.107, 3.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3258.geometry}
              material={materials.Grass_C}
              position={[0.299, -0.108, 3.401]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3260.geometry}
              material={materials.Grass_C}
              position={[0.086, -0.102, 3.397]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3262.geometry}
              material={materials.Grass_C}
              position={[0.319, -0.114, 3.36]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3264.geometry}
              material={materials.Grass_C}
              position={[0, -0.095, 3.457]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3266.geometry}
              material={materials.Grass_C}
              position={[0.03, -0.092, 3.507]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3268.geometry}
              material={materials.Grass_C}
              position={[-0.019, -0.086, 3.588]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3270.geometry}
              material={materials.Grass_C}
              position={[-0.28, -0.092, 3.487]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3272.geometry}
              material={materials.Grass_C}
              position={[-0.238, -0.085, 3.638]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3274.geometry}
              material={materials.Grass_C}
              position={[-0.087, -0.1, 3.356]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3276.geometry}
              material={materials.Grass_C}
              position={[-0.1, -0.094, 3.447]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3278.geometry}
              material={materials.Grass_C}
              position={[-0.126, -0.095, 3.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3280.geometry}
              material={materials.Grass_C}
              position={[-0.162, -0.099, 3.344]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3282.geometry}
              material={materials.Grass_C}
              position={[-0.474, -0.091, 3.465]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3284.geometry}
              material={materials.Grass_C}
              position={[-0.78, -0.091, 3.313]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3286.geometry}
              material={materials.Grass_C}
              position={[-0.926, -0.091, 3.266]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3288.geometry}
              material={materials.Grass_C}
              position={[-0.792, -0.088, 3.402]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3290.geometry}
              material={materials.Grass_C}
              position={[-1.3, -0.092, 3.167]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3292.geometry}
              material={materials.Grass_C}
              position={[-1.186, -0.09, 3.236]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3294.geometry}
              material={materials.Grass_C}
              position={[-1.232, -0.09, 3.213]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3296.geometry}
              material={materials.Grass_C}
              position={[-1.391, -0.085, 3.275]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3298.geometry}
              material={materials.Grass_C}
              position={[-1.372, -0.086, 3.301]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3300.geometry}
              material={materials.Grass_C}
              position={[-1.367, -0.094, 3.058]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3302.geometry}
              material={materials.Grass_C}
              position={[-1.598, -0.089, 2.948]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3304.geometry}
              material={materials.Grass_C}
              position={[-1.672, -0.078, 3.012]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3306.geometry}
              material={materials.Grass_C}
              position={[-1.733, -0.074, 2.93]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3308.geometry}
              material={materials.Grass_C}
              position={[-1.819, -0.07, 2.818]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3310.geometry}
              material={materials.Grass_C}
              position={[-1.706, -0.076, 2.953]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3312.geometry}
              material={materials.Grass_C}
              position={[-2.207, -0.007, 2.792]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3314.geometry}
              material={materials.Grass_C}
              position={[-2.085, -0.026, 2.835]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3316.geometry}
              material={materials.Grass_C}
              position={[-2.199, -0.01, 2.723]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3318.geometry}
              material={materials.Grass_C}
              position={[-2.233, -0.002, 2.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3320.geometry}
              material={materials.Grass_C}
              position={[-2.248, 0.001, 2.855]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3322.geometry}
              material={materials.Grass_C}
              position={[-2.078, -0.027, 2.856]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3324.geometry}
              material={materials.Grass_C}
              position={[-2.175, -0.011, 2.896]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3326.geometry}
              material={materials.Grass_C}
              position={[-2.197, -0.009, 2.797]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3328.geometry}
              material={materials.Grass_C}
              position={[-1.976, -0.047, 2.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3330.geometry}
              material={materials.Grass_C}
              position={[-2.107, -0.035, 2.616]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3332.geometry}
              material={materials.Grass_C}
              position={[-2.07, -0.035, 2.718]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3334.geometry}
              material={materials.Grass_C}
              position={[-1.928, -0.057, 2.761]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3336.geometry}
              material={materials.Grass_C}
              position={[-2.003, -0.042, 2.798]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3338.geometry}
              material={materials.Grass_C}
              position={[-2.449, 0.02, 2.464]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3340.geometry}
              material={materials.Grass_C}
              position={[-2.319, -0.002, 2.519]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3342.geometry}
              material={materials.Grass_C}
              position={[-2.401, 0.006, 2.426]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3344.geometry}
              material={materials.Grass_C}
              position={[-2.388, 0, 2.389]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3346.geometry}
              material={materials.Grass_C}
              position={[-2.514, 0.035, 2.495]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3348.geometry}
              material={materials.Grass_C}
              position={[-2.557, 0.044, 2.526]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3350.geometry}
              material={materials.Grass_C}
              position={[-2.436, 0.01, 2.404]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3352.geometry}
              material={materials.Grass_C}
              position={[-2.391, -0.006, 2.347]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3354.geometry}
              material={materials.Grass_C}
              position={[-2.545, 0.01, 2.259]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3356.geometry}
              material={materials.Grass_C}
              position={[-2.474, 0.003, 2.305]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3358.geometry}
              material={materials.Grass_C}
              position={[-2.615, 0.028, 2.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3360.geometry}
              material={materials.Grass_C}
              position={[-2.697, -0.012, 1.985]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3362.geometry}
              material={materials.Grass_C}
              position={[-2.669, 0.002, 2.075]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3364.geometry}
              material={materials.Grass_C}
              position={[-2.787, 0, 1.957]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3366.geometry}
              material={materials.Grass_C}
              position={[-2.705, 0.015, 2.101]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3368.geometry}
              material={materials.Grass_C}
              position={[-2.707, 0.033, 2.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3370.geometry}
              material={materials.Grass_C}
              position={[-2.698, -0.005, 2.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3372.geometry}
              material={materials.Grass_C}
              position={[-2.647, 0.002, 2.094]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3374.geometry}
              material={materials.Grass_C}
              position={[-2.716, 0.034, 2.18]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3376.geometry}
              material={materials.Grass_C}
              position={[-2.864, 0.026, 2.004]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3378.geometry}
              material={materials.Grass_C}
              position={[-3.163, 0.017, 1.785]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3380.geometry}
              material={materials.Grass_C}
              position={[-2.95, 0.021, 1.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3382.geometry}
              material={materials.Grass_C}
              position={[-3.107, 0.009, 1.771]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3384.geometry}
              material={materials.Grass_C}
              position={[-3.213, 0.012, 1.731]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3386.geometry}
              material={materials.Grass_C}
              position={[-2.913, -0.022, 1.759]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3388.geometry}
              material={materials.Grass_C}
              position={[-2.934, 0.018, 1.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3390.geometry}
              material={materials.Grass_C}
              position={[-3.058, -0.066, 1.463]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3392.geometry}
              material={materials.Grass_C}
              position={[-3.2, -0.063, 1.371]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3394.geometry}
              material={materials.Grass_C}
              position={[-3.111, -0.026, 1.592]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3396.geometry}
              material={materials.Grass_C}
              position={[-3.36, -0.092, 1.092]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3398.geometry}
              material={materials.Grass_C}
              position={[-3.4, -0.081, 1.14]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3400.geometry}
              material={materials.Grass_C}
              position={[-3.199, -0.085, 1.263]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3402.geometry}
              material={materials.Grass_C}
              position={[-3.225, -0.091, 1.201]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3404.geometry}
              material={materials.Grass_C}
              position={[-3.225, -0.094, 1.182]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3406.geometry}
              material={materials.Grass_C}
              position={[-3.357, -0.122, 0.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3408.geometry}
              material={materials.Grass_C}
              position={[-3.302, -0.131, 0.769]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3410.geometry}
              material={materials.Grass_C}
              position={[-3.39, -0.111, 0.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3412.geometry}
              material={materials.Grass_C}
              position={[-3.369, -0.129, 0.607]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3414.geometry}
              material={materials.Grass_C}
              position={[-3.429, -0.12, 0.461]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3416.geometry}
              material={materials.Grass_C}
              position={[-3.379, -0.118, 0.042]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3418.geometry}
              material={materials.Grass_C}
              position={[-3.41, -0.116, 0.088]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3420.geometry}
              material={materials.Grass_C}
              position={[-3.531, -0.076, -0.31]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3422.geometry}
              material={materials.Grass_C}
              position={[-3.541, -0.078, -0.272]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3424.geometry}
              material={materials.Grass_C}
              position={[-3.398, -0.114, -0.012]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3426.geometry}
              material={materials.Grass_C}
              position={[-3.392, -0.105, -0.158]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3428.geometry}
              material={materials.Grass_C}
              position={[-3.351, -0.102, -0.273]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3430.geometry}
              material={materials.Grass_C}
              position={[-3.434, -0.083, -0.378]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3432.geometry}
              material={materials.Grass_C}
              position={[-3.33, -0.086, -0.633]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3434.geometry}
              material={materials.Grass_C}
              position={[-3.469, -0.074, -0.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3436.geometry}
              material={materials.Grass_C}
              position={[-3.442, -0.077, -0.462]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3438.geometry}
              material={materials.Grass_C}
              position={[-3.439, -0.05, -1.033]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3440.geometry}
              material={materials.Grass_C}
              position={[-3.391, -0.062, -1.025]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3442.geometry}
              material={materials.Grass_C}
              position={[-3.464, -0.055, -0.81]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3444.geometry}
              material={materials.Grass_C}
              position={[-3.496, -0.038, -1.017]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3446.geometry}
              material={materials.Grass_C}
              position={[-3.359, -0.071, -0.975]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3448.geometry}
              material={materials.Grass_C}
              position={[-3.362, -0.075, -0.829]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3450.geometry}
              material={materials.Grass_C}
              position={[-3.31, -0.089, -0.669]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3452.geometry}
              material={materials.Grass_C}
              position={[-3.353, -0.077, -0.858]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3454.geometry}
              material={materials.Grass_C}
              position={[-3.403, -0.068, -0.778]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3456.geometry}
              material={materials.Grass_C}
              position={[-3.296, -0.091, -0.754]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3458.geometry}
              material={materials.Grass_C}
              position={[-3.362, -0.076, -0.801]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3460.geometry}
              material={materials.Grass_C}
              position={[-3.269, -0.092, -1.079]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3462.geometry}
              material={materials.Grass_C}
              position={[-3.263, -0.094, -1.104]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3464.geometry}
              material={materials.Grass_C}
              position={[-3.223, -0.104, -1.132]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3466.geometry}
              material={materials.Grass_C}
              position={[-3.213, -0.107, -1.117]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3468.geometry}
              material={materials.Grass_C}
              position={[-3.25, -0.093, -1.585]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3470.geometry}
              material={materials.Grass_C}
              position={[-3.168, -0.116, -1.64]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3472.geometry}
              material={materials.Grass_C}
              position={[-3.244, -0.095, -1.565]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3474.geometry}
              material={materials.Grass_C}
              position={[-3.191, -0.111, -1.498]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3476.geometry}
              material={materials.Grass_C}
              position={[-3.337, -0.071, -1.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3478.geometry}
              material={materials.Grass_C}
              position={[-3.339, -0.07, -1.395]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3480.geometry}
              material={materials.Grass_C}
              position={[-3.062, -0.148, -1.412]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3482.geometry}
              material={materials.Grass_C}
              position={[-3.112, -0.134, -1.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3484.geometry}
              material={materials.Grass_C}
              position={[-3.049, -0.152, -1.448]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3486.geometry}
              material={materials.Grass_C}
              position={[-3.154, -0.122, -1.366]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3488.geometry}
              material={materials.Grass_C}
              position={[-2.801, -0.216, -1.841]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3490.geometry}
              material={materials.Grass_C}
              position={[-3.011, -0.159, -1.696]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3492.geometry}
              material={materials.Grass_C}
              position={[-2.949, -0.178, -1.678]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3494.geometry}
              material={materials.Grass_C}
              position={[-2.823, -0.209, -1.876]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3496.geometry}
              material={materials.Grass_C}
              position={[-2.857, -0.201, -1.794]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3498.geometry}
              material={materials.Grass_C}
              position={[-2.907, -0.185, -1.864]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3500.geometry}
              material={materials.Grass_C}
              position={[-3.006, -0.158, -1.773]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3502.geometry}
              material={materials.Grass_C}
              position={[-2.822, -0.167, -2.271]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3504.geometry}
              material={materials.Grass_C}
              position={[-2.773, -0.186, -2.216]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3506.geometry}
              material={materials.Grass_C}
              position={[-2.984, -0.154, -2.04]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3508.geometry}
              material={materials.Grass_C}
              position={[-2.92, -0.165, -2.078]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3510.geometry}
              material={materials.Grass_C}
              position={[-3.011, -0.146, -2.064]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3512.geometry}
              material={materials.Grass_C}
              position={[-2.823, -0.185, -2.115]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3514.geometry}
              material={materials.Grass_C}
              position={[-2.937, -0.164, -2.05]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3516.geometry}
              material={materials.Grass_C}
              position={[-2.849, -0.192, -1.985]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3518.geometry}
              material={materials.Grass_C}
              position={[-2.867, -0.186, -2.006]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3520.geometry}
              material={materials.Grass_C}
              position={[-2.709, -0.212, -2.134]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3522.geometry}
              material={materials.Grass_C}
              position={[-2.656, -0.229, -2.111]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3524.geometry}
              material={materials.Grass_C}
              position={[-2.689, -0.231, -2.01]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3526.geometry}
              material={materials.Grass_C}
              position={[-2.718, -0.224, -2.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3528.geometry}
              material={materials.Grass_C}
              position={[-2.557, -0.241, -2.194]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3530.geometry}
              material={materials.Grass_C}
              position={[-2.443, -0.227, -2.409]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3532.geometry}
              material={materials.Grass_C}
              position={[-2.404, -0.251, -2.343]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3534.geometry}
              material={materials.Grass_C}
              position={[-2.504, -0.152, -2.659]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3536.geometry}
              material={materials.Grass_C}
              position={[-2.326, -0.186, -2.664]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3538.geometry}
              material={materials.Grass_C}
              position={[-2.293, -0.195, -2.657]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3540.geometry}
              material={materials.Grass_C}
              position={[-2.464, -0.192, -2.534]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3542.geometry}
              material={materials.Grass_C}
              position={[-2.418, -0.231, -2.419]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3544.geometry}
              material={materials.Grass_C}
              position={[-2.175, -0.224, -2.649]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3546.geometry}
              material={materials.Grass_C}
              position={[-2.206, -0.226, -2.616]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3548.geometry}
              material={materials.Grass_C}
              position={[-2.235, -0.238, -2.549]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3550.geometry}
              material={materials.Grass_C}
              position={[-2.39, -0.236, -2.423]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3552.geometry}
              material={materials.Grass_C}
              position={[-2.218, -0.206, -2.679]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3554.geometry}
              material={materials.Grass_C}
              position={[-1.939, -0.225, -2.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3556.geometry}
              material={materials.Grass_C}
              position={[-1.905, -0.234, -2.781]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3558.geometry}
              material={materials.Grass_C}
              position={[-2.137, -0.229, -2.654]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3560.geometry}
              material={materials.Grass_C}
              position={[-2.066, -0.194, -2.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3562.geometry}
              material={materials.Grass_C}
              position={[-1.968, -0.211, -2.817]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3564.geometry}
              material={materials.Grass_C}
              position={[-2.059, -0.195, -2.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3566.geometry}
              material={materials.Grass_C}
              position={[-2.16, -0.199, -2.738]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3568.geometry}
              material={materials.Grass_C}
              position={[-1.939, -0.156, -3.019]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3570.geometry}
              material={materials.Grass_C}
              position={[-2.014, -0.134, -3.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3572.geometry}
              material={materials.Grass_C}
              position={[-1.778, -0.141, -3.158]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3574.geometry}
              material={materials.Grass_C}
              position={[-1.886, -0.185, -2.945]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3576.geometry}
              material={materials.Grass_C}
              position={[-1.696, -0.206, -2.967]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3578.geometry}
              material={materials.Grass_C}
              position={[-1.593, -0.227, -2.94]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3580.geometry}
              material={materials.Grass_C}
              position={[-1.919, -0.199, -2.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3582.geometry}
              material={materials.Grass_C}
              position={[-1.725, -0.229, -2.878]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3584.geometry}
              material={materials.Grass_C}
              position={[-1.84, -0.197, -2.929]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3586.geometry}
              material={materials.Grass_C}
              position={[-1.428, -0.174, -3.187]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3588.geometry}
              material={materials.Grass_C}
              position={[-1.407, -0.203, -3.081]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3590.geometry}
              material={materials.Grass_C}
              position={[-1.495, -0.204, -3.053]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3592.geometry}
              material={materials.Grass_C}
              position={[-1.586, -0.194, -3.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3594.geometry}
              material={materials.Grass_C}
              position={[-1.322, -0.148, -3.345]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3596.geometry}
              material={materials.Grass_C}
              position={[-1.118, -0.156, -3.371]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3598.geometry}
              material={materials.Grass_C}
              position={[-1.214, -0.155, -3.346]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3600.geometry}
              material={materials.Grass_C}
              position={[-1.186, -0.155, -3.355]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3602.geometry}
              material={materials.Grass_C}
              position={[-1.307, -0.171, -3.238]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3604.geometry}
              material={materials.Grass_C}
              position={[-0.998, -0.174, -3.284]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3606.geometry}
              material={materials.Grass_C}
              position={[-1.145, -0.174, -3.262]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3608.geometry}
              material={materials.Grass_C}
              position={[-1.033, -0.183, -3.23]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3610.geometry}
              material={materials.Grass_C}
              position={[-1.069, -0.17, -3.297]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3612.geometry}
              material={materials.Grass_C}
              position={[-1.197, -0.196, -3.151]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3614.geometry}
              material={materials.Grass_C}
              position={[-0.846, -0.161, -3.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3616.geometry}
              material={materials.Grass_C}
              position={[-0.795, -0.161, -3.316]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3618.geometry}
              material={materials.Grass_C}
              position={[-0.705, -0.15, -3.366]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3620.geometry}
              material={materials.Grass_C}
              position={[-0.928, -0.178, -3.249]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3622.geometry}
              material={materials.Grass_C}
              position={[-0.876, -0.168, -3.295]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3624.geometry}
              material={materials.Grass_C}
              position={[-0.395, -0.089, -3.601]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3626.geometry}
              material={materials.Grass_C}
              position={[-0.685, -0.125, -3.529]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3628.geometry}
              material={materials.Grass_C}
              position={[-0.628, -0.127, -3.478]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3630.geometry}
              material={materials.Grass_C}
              position={[-0.461, -0.094, -3.609]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3632.geometry}
              material={materials.Grass_C}
              position={[-0.507, -0.097, -3.614]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3634.geometry}
              material={materials.Grass_C}
              position={[-0.551, -0.127, -3.431]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3636.geometry}
              material={materials.Grass_C}
              position={[-0.346, -0.117, -3.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3638.geometry}
              material={materials.Grass_C}
              position={[-0.602, -0.13, -3.446]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3640.geometry}
              material={materials.Grass_C}
              position={[-0.336, -0.115, -3.381]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3642.geometry}
              material={materials.Grass_C}
              position={[-0.381, -0.125, -3.344]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3644.geometry}
              material={materials.Grass_C}
              position={[-0.352, -0.11, -3.427]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3646.geometry}
              material={materials.Grass_C}
              position={[-0.611, -0.134, -3.425]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3648.geometry}
              material={materials.Grass_C}
              position={[-0.419, -0.124, -3.376]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3650.geometry}
              material={materials.Grass_C}
              position={[-0.12, -0.081, -3.484]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3652.geometry}
              material={materials.Grass_C}
              position={[-0.209, -0.087, -3.5]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3654.geometry}
              material={materials.Grass_C}
              position={[-0.224, -0.109, -3.354]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3656.geometry}
              material={materials.Grass_C}
              position={[-0.076, -0.079, -3.473]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3658.geometry}
              material={materials.Grass_C}
              position={[-0.147, -0.08, -3.51]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3660.geometry}
              material={materials.Grass_C}
              position={[-0.054, -0.085, -3.409]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3662.geometry}
              material={materials.Grass_C}
              position={[-0.301, -0.103, -3.445]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3664.geometry}
              material={materials.Grass_C}
              position={[-0.222, -0.101, -3.41]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3666.geometry}
              material={materials.Grass_C}
              position={[-0.069, -0.076, -3.484]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3668.geometry}
              material={materials.Grass_C}
              position={[0.331, -0.001, -4.039]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3670.geometry}
              material={materials.Grass_C}
              position={[0.277, -0.01, -3.954]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3672.geometry}
              material={materials.Grass_C}
              position={[0.325, -0.013, -3.9]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3674.geometry}
              material={materials.Grass_C}
              position={[0.296, -0.013, -3.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3676.geometry}
              material={materials.Grass_C}
              position={[0.097, -0.006, -4.064]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3678.geometry}
              material={materials.Grass_C}
              position={[0.166, -0.03, -3.769]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3680.geometry}
              material={materials.Grass_C}
              position={[0.185, -0.029, -3.774]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3682.geometry}
              material={materials.Grass_C}
              position={[0.22, -0.035, -3.698]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3684.geometry}
              material={materials.Grass_C}
              position={[0.196, -0.029, -3.765]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3686.geometry}
              material={materials.Grass_C}
              position={[0.257, -0.033, -3.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3688.geometry}
              material={materials.Grass_C}
              position={[0.033, -0.04, -3.714]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3690.geometry}
              material={materials.Grass_C}
              position={[0.066, -0.026, -3.842]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3692.geometry}
              material={materials.Grass_C}
              position={[0.336, -0.03, -3.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3694.geometry}
              material={materials.Grass_C}
              position={[-0.006, -0.041, -3.721]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3696.geometry}
              material={materials.Grass_C}
              position={[0.049, -0.027, -3.835]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3698.geometry}
              material={materials.Grass_C}
              position={[0.156, -0.032, -3.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3700.geometry}
              material={materials.Grass_C}
              position={[0.12, -0.034, -3.748]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3702.geometry}
              material={materials.Grass_C}
              position={[0.087, -0.031, -3.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3704.geometry}
              material={materials.Grass_C}
              position={[0.119, -0.03, -3.785]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3706.geometry}
              material={materials.Grass_C}
              position={[0.215, -0.025, -3.799]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3708.geometry}
              material={materials.Grass_C}
              position={[0.427, -0.017, -3.837]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3710.geometry}
              material={materials.Grass_C}
              position={[0.696, -0.02, -3.769]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3712.geometry}
              material={materials.Grass_C}
              position={[0.597, -0.021, -3.761]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3714.geometry}
              material={materials.Grass_C}
              position={[0.677, -0.018, -3.798]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3716.geometry}
              material={materials.Grass_C}
              position={[0.506, -0.027, -3.694]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3718.geometry}
              material={materials.Grass_C}
              position={[0.658, -0.022, -3.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3720.geometry}
              material={materials.Grass_C}
              position={[0.878, -0.012, -3.93]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3722.geometry}
              material={materials.Grass_C}
              position={[0.94, -0.025, -3.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3724.geometry}
              material={materials.Grass_C}
              position={[1.981, 0.03, -3.123]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3726.geometry}
              material={materials.Grass_C}
              position={[2.319, 0.046, -3.11]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3728.geometry}
              material={materials.Grass_C}
              position={[2.409, 0.051, -2.971]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3730.geometry}
              material={materials.Grass_C}
              position={[2.428, 0.048, -3.161]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3732.geometry}
              material={materials.Grass_C}
              position={[2.364, 0.045, -3.212]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3734.geometry}
              material={materials.Grass_C}
              position={[2.219, 0.042, -3.152]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3736.geometry}
              material={materials.Grass_C}
              position={[2.352, 0.046, -3.176]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3738.geometry}
              material={materials.Grass_C}
              position={[2.379, 0.047, -3.157]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3740.geometry}
              material={materials.Grass_C}
              position={[2.251, 0.043, -3.134]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3742.geometry}
              material={materials.Grass_C}
              position={[2.45, 0.05, -3.101]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3744.geometry}
              material={materials.Grass_C}
              position={[2.37, 0.049, -2.997]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3746.geometry}
              material={materials.Grass_C}
              position={[2.281, 0.046, -2.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3748.geometry}
              material={materials.Grass_C}
              position={[2.246, 0.045, -2.885]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3750.geometry}
              material={materials.Grass_C}
              position={[2.124, 0.038, -3.161]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3752.geometry}
              material={materials.Grass_C}
              position={[2.266, 0.045, -2.968]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3754.geometry}
              material={materials.Grass_C}
              position={[2.369, 0.05, -2.93]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3756.geometry}
              material={materials.Grass_C}
              position={[2.208, 0.043, -2.991]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3758.geometry}
              material={materials.Grass_C}
              position={[2.557, 0.034, -2.628]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3760.geometry}
              material={materials.Grass_C}
              position={[2.541, 0.039, -2.728]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3762.geometry}
              material={materials.Grass_C}
              position={[2.467, 0.049, -2.891]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3764.geometry}
              material={materials.Grass_C}
              position={[2.619, 0.04, -2.746]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3766.geometry}
              material={materials.Grass_C}
              position={[2.426, 0.046, -2.816]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3768.geometry}
              material={materials.Grass_C}
              position={[2.462, 0.04, -2.719]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3770.geometry}
              material={materials.Grass_C}
              position={[2.831, 0.022, -2.617]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3772.geometry}
              material={materials.Grass_C}
              position={[2.971, 0.012, -2.603]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3774.geometry}
              material={materials.Grass_C}
              position={[2.825, 0.031, -2.724]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3776.geometry}
              material={materials.Grass_C}
              position={[3.042, 0.006, -2.58]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3778.geometry}
              material={materials.Grass_C}
              position={[2.917, 0.017, -2.62]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3780.geometry}
              material={materials.Grass_C}
              position={[2.809, 0.008, -2.46]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3782.geometry}
              material={materials.Grass_C}
              position={[2.756, 0.03, -2.658]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3784.geometry}
              material={materials.Grass_C}
              position={[2.868, -0.004, -2.372]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3786.geometry}
              material={materials.Grass_C}
              position={[2.905, 0.002, -2.434]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3788.geometry}
              material={materials.Grass_C}
              position={[2.621, 0.029, -2.581]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3790.geometry}
              material={materials.Grass_C}
              position={[2.865, 0.013, -2.526]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3792.geometry}
              material={materials.Grass_C}
              position={[2.649, 0.03, -2.61]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3794.geometry}
              material={materials.Grass_C}
              position={[2.937, -0.003, -2.406]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3796.geometry}
              material={materials.Grass_C}
              position={[3.075, -0.034, -2.197]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3798.geometry}
              material={materials.Grass_C}
              position={[2.895, -0.02, -2.243]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3800.geometry}
              material={materials.Grass_C}
              position={[2.948, -0.024, -2.232]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3802.geometry}
              material={materials.Grass_C}
              position={[3.241, -0.051, -2.118]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3804.geometry}
              material={materials.Grass_C}
              position={[3.372, -0.058, -2.122]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3806.geometry}
              material={materials.Grass_C}
              position={[3.337, -0.07, -1.945]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3808.geometry}
              material={materials.Grass_C}
              position={[3.343, -0.06, -2.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3810.geometry}
              material={materials.Grass_C}
              position={[3.128, -0.065, -1.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3812.geometry}
              material={materials.Grass_C}
              position={[3.196, -0.065, -1.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3814.geometry}
              material={materials.Grass_C}
              position={[3.151, -0.053, -2.056]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3816.geometry}
              material={materials.Grass_C}
              position={[3.235, -0.058, -2.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3818.geometry}
              material={materials.Grass_C}
              position={[3.125, -0.064, -1.929]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3820.geometry}
              material={materials.Grass_C}
              position={[3.272, -0.075, -1.854]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3822.geometry}
              material={materials.Grass_C}
              position={[3.192, -0.074, -1.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3824.geometry}
              material={materials.Grass_C}
              position={[3.201, -0.073, -1.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3826.geometry}
              material={materials.Grass_C}
              position={[3.349, -0.089, -1.691]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3828.geometry}
              material={materials.Grass_C}
              position={[3.309, -0.089, -1.686]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3830.geometry}
              material={materials.Grass_C}
              position={[3.328, -0.09, -1.668]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3832.geometry}
              material={materials.Grass_C}
              position={[3.378, -0.101, -1.476]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3834.geometry}
              material={materials.Grass_C}
              position={[3.459, -0.1, -1.492]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3836.geometry}
              material={materials.Grass_C}
              position={[3.735, -0.101, -1.214]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3838.geometry}
              material={materials.Grass_C}
              position={[3.642, -0.101, -1.377]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3840.geometry}
              material={materials.Grass_C}
              position={[3.594, -0.101, -1.354]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3842.geometry}
              material={materials.Grass_C}
              position={[3.563, -0.1, -1.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3844.geometry}
              material={materials.Grass_C}
              position={[3.597, -0.102, -1.329]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3846.geometry}
              material={materials.Grass_C}
              position={[3.56, -0.108, -1.102]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3848.geometry}
              material={materials.Grass_C}
              position={[3.452, -0.103, -1.428]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3850.geometry}
              material={materials.Grass_C}
              position={[3.567, -0.101, -1.386]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3852.geometry}
              material={materials.Grass_C}
              position={[3.511, -0.105, -1.311]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3854.geometry}
              material={materials.Grass_C}
              position={[3.503, -0.102, -1.445]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3856.geometry}
              material={materials.Grass_C}
              position={[3.636, -0.106, -0.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3858.geometry}
              material={materials.Grass_C}
              position={[3.559, -0.109, -0.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3860.geometry}
              material={materials.Grass_C}
              position={[3.619, -0.106, -0.866]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3862.geometry}
              material={materials.Grass_C}
              position={[3.58, -0.108, -0.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3864.geometry}
              material={materials.Grass_C}
              position={[3.684, -0.104, -0.957]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3866.geometry}
              material={materials.Grass_C}
              position={[3.654, -0.105, -0.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3868.geometry}
              material={materials.Grass_C}
              position={[3.691, -0.104, -0.889]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3870.geometry}
              material={materials.Grass_C}
              position={[3.662, -0.105, -0.928]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3872.geometry}
              material={materials.Grass_C}
              position={[3.898, -0.1, -0.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3874.geometry}
              material={materials.Grass_C}
              position={[3.878, -0.101, -0.727]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3876.geometry}
              material={materials.Grass_C}
              position={[3.84, -0.101, -0.625]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3878.geometry}
              material={materials.Grass_C}
              position={[3.675, -0.103, -0.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3880.geometry}
              material={materials.Grass_C}
              position={[3.794, -0.1, -0.317]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3882.geometry}
              material={materials.Grass_C}
              position={[3.787, -0.101, -0.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3884.geometry}
              material={materials.Grass_C}
              position={[3.883, -0.101, 0.102]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3886.geometry}
              material={materials.Grass_C}
              position={[3.956, -0.101, 0.071]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3888.geometry}
              material={materials.Grass_C}
              position={[3.904, -0.101, 0.183]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3890.geometry}
              material={materials.Grass_C}
              position={[3.986, -0.1, 0.18]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3892.geometry}
              material={materials.Grass_C}
              position={[3.776, -0.105, 0.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3894.geometry}
              material={materials.Grass_C}
              position={[3.702, -0.103, 0.08]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3896.geometry}
              material={materials.Grass_C}
              position={[3.661, -0.109, 0.258]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3898.geometry}
              material={materials.Grass_C}
              position={[3.771, -0.107, 0.382]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3900.geometry}
              material={materials.Grass_C}
              position={[3.796, -0.106, 0.4]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3902.geometry}
              material={materials.Grass_C}
              position={[3.625, -0.133, 0.634]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3904.geometry}
              material={materials.Grass_C}
              position={[3.734, -0.12, 0.601]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3906.geometry}
              material={materials.Grass_C}
              position={[3.734, -0.113, 0.455]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3908.geometry}
              material={materials.Grass_C}
              position={[3.702, -0.127, 0.684]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3910.geometry}
              material={materials.Grass_C}
              position={[3.604, -0.14, 0.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3912.geometry}
              material={materials.Grass_C}
              position={[3.719, -0.122, 0.609]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3914.geometry}
              material={materials.Grass_C}
              position={[3.733, -0.112, 0.429]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3916.geometry}
              material={materials.Grass_C}
              position={[3.903, -0.109, 0.851]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3918.geometry}
              material={materials.Grass_C}
              position={[3.835, -0.107, 1.093]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3920.geometry}
              material={materials.Grass_C}
              position={[3.88, -0.108, 0.949]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3922.geometry}
              material={materials.Grass_C}
              position={[3.79, -0.12, 0.861]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3924.geometry}
              material={materials.Grass_C}
              position={[3.849, -0.115, 0.807]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3926.geometry}
              material={materials.Grass_C}
              position={[3.765, -0.123, 0.902]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3928.geometry}
              material={materials.Grass_C}
              position={[3.688, -0.134, 0.887]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3930.geometry}
              material={materials.Grass_C}
              position={[3.555, -0.154, 0.893]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3932.geometry}
              material={materials.Grass_C}
              position={[3.703, -0.132, 0.871]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3934.geometry}
              material={materials.Grass_C}
              position={[3.526, -0.145, 1.338]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3936.geometry}
              material={materials.Grass_C}
              position={[3.571, -0.138, 1.301]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3938.geometry}
              material={materials.Grass_C}
              position={[3.485, -0.162, 1.235]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3940.geometry}
              material={materials.Grass_C}
              position={[3.443, -0.17, 1.271]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3942.geometry}
              material={materials.Grass_C}
              position={[3.416, -0.168, 1.398]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3944.geometry}
              material={materials.Grass_C}
              position={[3.45, -0.164, 1.339]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3946.geometry}
              material={materials.Grass_C}
              position={[3.506, -0.164, 1.133]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3948.geometry}
              material={materials.Grass_C}
              position={[3.617, -0.144, 1.118]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3950.geometry}
              material={materials.Grass_C}
              position={[3.59, -0.1, 1.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3952.geometry}
              material={materials.Grass_C}
              position={[3.62, -0.096, 1.56]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3954.geometry}
              material={materials.Grass_C}
              position={[3.454, -0.135, 1.582]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3956.geometry}
              material={materials.Grass_C}
              position={[3.343, -0.154, 1.672]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3958.geometry}
              material={materials.Grass_C}
              position={[3.377, -0.15, 1.628]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3960.geometry}
              material={materials.Grass_C}
              position={[3.433, -0.154, 1.488]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3962.geometry}
              material={materials.Grass_C}
              position={[3.295, -0.157, 1.751]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3964.geometry}
              material={materials.Grass_C}
              position={[3.385, -0.126, 1.756]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3966.geometry}
              material={materials.Grass_C}
              position={[3.344, -0.141, 1.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3968.geometry}
              material={materials.Grass_C}
              position={[3.261, -0.176, 1.702]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3970.geometry}
              material={materials.Grass_C}
              position={[3.382, -0.155, 1.583]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3972.geometry}
              material={materials.Grass_C}
              position={[3.478, -0.126, 1.596]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3974.geometry}
              material={materials.Grass_C}
              position={[3.5, -0.132, 1.52]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3976.geometry}
              material={materials.Grass_C}
              position={[3.212, -0.184, 1.76]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3978.geometry}
              material={materials.Grass_C}
              position={[3.213, -0.165, 1.875]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3980.geometry}
              material={materials.Grass_C}
              position={[3.305, -0.148, 1.782]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3982.geometry}
              material={materials.Grass_C}
              position={[3.268, -0.124, 1.982]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3984.geometry}
              material={materials.Grass_C}
              position={[3.012, -0.139, 2.384]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3986.geometry}
              material={materials.Grass_C}
              position={[3.109, -0.104, 2.374]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3988.geometry}
              material={materials.Grass_C}
              position={[3.049, -0.143, 2.296]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3990.geometry}
              material={materials.Grass_C}
              position={[3.002, -0.187, 2.185]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3992.geometry}
              material={materials.Grass_C}
              position={[3.136, -0.148, 2.117]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3994.geometry}
              material={materials.Grass_C}
              position={[3.03, -0.165, 2.234]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3996.geometry}
              material={materials.Grass_C}
              position={[2.685, -0.231, 2.523]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_3998.geometry}
              material={materials.Grass_C}
              position={[2.657, -0.226, 2.586]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4000.geometry}
              material={materials.Grass_C}
              position={[2.54, -0.188, 2.873]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4002.geometry}
              material={materials.Grass_C}
              position={[2.516, -0.185, 2.914]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4004.geometry}
              material={materials.Grass_C}
              position={[2.757, -0.129, 2.849]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4006.geometry}
              material={materials.Grass_C}
              position={[2.733, -0.152, 2.782]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4008.geometry}
              material={materials.Grass_C}
              position={[2.492, -0.189, 2.924]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4010.geometry}
              material={materials.Grass_C}
              position={[2.648, -0.153, 2.888]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4012.geometry}
              material={materials.Grass_C}
              position={[2.764, -0.123, 2.865]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4014.geometry}
              material={materials.Grass_C}
              position={[2.595, -0.157, 2.942]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4016.geometry}
              material={materials.Grass_C}
              position={[2.6, -0.14, 3.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4018.geometry}
              material={materials.Grass_C}
              position={[2.411, -0.228, 2.854]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4020.geometry}
              material={materials.Grass_C}
              position={[2.396, -0.219, 2.91]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4022.geometry}
              material={materials.Grass_C}
              position={[2.206, -0.196, 3.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4024.geometry}
              material={materials.Grass_C}
              position={[2.272, -0.196, 3.074]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4026.geometry}
              material={materials.Grass_C}
              position={[2.262, -0.241, 2.918]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4028.geometry}
              material={materials.Grass_C}
              position={[1.998, -0.151, 3.383]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4030.geometry}
              material={materials.Grass_C}
              position={[2.026, -0.149, 3.388]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4032.geometry}
              material={materials.Grass_C}
              position={[1.912, -0.158, 3.367]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4034.geometry}
              material={materials.Grass_C}
              position={[2.207, -0.15, 3.337]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4036.geometry}
              material={materials.Grass_C}
              position={[2.006, -0.219, 3.11]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4038.geometry}
              material={materials.Grass_C}
              position={[2.018, -0.229, 3.071]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4040.geometry}
              material={materials.Grass_C}
              position={[1.809, -0.171, 3.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4042.geometry}
              material={materials.Grass_C}
              position={[1.98, -0.176, 3.274]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4044.geometry}
              material={materials.Grass_C}
              position={[1.991, -0.193, 3.206]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4046.geometry}
              material={materials.Grass_C}
              position={[1.884, -0.175, 3.295]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4048.geometry}
              material={materials.Grass_C}
              position={[1.819, -0.17, 3.328]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4050.geometry}
              material={materials.Grass_C}
              position={[1.68, -0.184, 3.28]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4052.geometry}
              material={materials.Grass_C}
              position={[1.612, -0.17, 3.338]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4054.geometry}
              material={materials.Grass_C}
              position={[1.482, -0.139, 3.474]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4056.geometry}
              material={materials.Grass_C}
              position={[1.458, -0.161, 3.367]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4058.geometry}
              material={materials.Grass_C}
              position={[1.449, -0.16, 3.372]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4060.geometry}
              material={materials.Grass_C}
              position={[1.372, -0.115, 3.582]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4062.geometry}
              material={materials.Grass_C}
              position={[1.265, -0.082, 3.753]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4064.geometry}
              material={materials.Grass_C}
              position={[1.14, -0.093, 3.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4066.geometry}
              material={materials.Grass_C}
              position={[1.343, -0.086, 3.74]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4068.geometry}
              material={materials.Grass_C}
              position={[1.143, -0.076, 3.767]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4070.geometry}
              material={materials.Grass_C}
              position={[1.39, -0.096, 3.69]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4072.geometry}
              material={materials.Grass_C}
              position={[1.077, -0.121, 3.518]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4074.geometry}
              material={materials.Grass_C}
              position={[1.349, -0.144, 3.435]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4076.geometry}
              material={materials.Grass_C}
              position={[1.307, -0.144, 3.432]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4078.geometry}
              material={materials.Grass_C}
              position={[1.325, -0.139, 3.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4080.geometry}
              material={materials.Grass_C}
              position={[1.373, -0.142, 3.452]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4082.geometry}
              material={materials.Grass_C}
              position={[0.843, -0.084, 3.683]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4084.geometry}
              material={materials.Grass_C}
              position={[0.96, -0.086, 3.692]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4086.geometry}
              material={materials.Grass_C}
              position={[0.969, -0.089, 3.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4088.geometry}
              material={materials.Grass_C}
              position={[0.885, -0.105, 3.571]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4090.geometry}
              material={materials.Grass_C}
              position={[1.025, -0.105, 3.591]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4092.geometry}
              material={materials.Grass_C}
              position={[0.948, -0.102, 3.595]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4094.geometry}
              material={materials.Grass_C}
              position={[0.897, -0.103, 3.583]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4096.geometry}
              material={materials.Grass_C}
              position={[0.823, -0.079, 3.713]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4098.geometry}
              material={materials.Grass_C}
              position={[1.06, -0.103, 3.606]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4100.geometry}
              material={materials.Grass_C}
              position={[0.617, -0.052, 3.927]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4102.geometry}
              material={materials.Grass_C}
              position={[0.433, -0.066, 3.798]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4104.geometry}
              material={materials.Grass_C}
              position={[0.648, -0.067, 3.778]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4106.geometry}
              material={materials.Grass_C}
              position={[0.527, -0.053, 3.936]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4108.geometry}
              material={materials.Grass_C}
              position={[0.655, -0.05, 3.941]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4110.geometry}
              material={materials.Grass_C}
              position={[0.655, -0.055, 3.895]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4112.geometry}
              material={materials.Grass_C}
              position={[0.49, -0.056, 3.908]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4114.geometry}
              material={materials.Grass_C}
              position={[0.565, -0.069, 3.77]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4116.geometry}
              material={materials.Grass_C}
              position={[0.502, -0.068, 3.775]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4118.geometry}
              material={materials.Grass_C}
              position={[0.471, -0.078, 3.689]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4120.geometry}
              material={materials.Grass_C}
              position={[0.406, -0.083, 3.634]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4122.geometry}
              material={materials.Grass_C}
              position={[0.623, -0.083, 3.662]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4124.geometry}
              material={materials.Grass_C}
              position={[0.505, -0.084, 3.644]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4126.geometry}
              material={materials.Grass_C}
              position={[0.387, -0.074, 3.72]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4128.geometry}
              material={materials.Grass_C}
              position={[0.091, -0.072, 3.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4130.geometry}
              material={materials.Grass_C}
              position={[0.023, -0.08, 3.689]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4132.geometry}
              material={materials.Grass_C}
              position={[0.343, -0.073, 3.724]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4134.geometry}
              material={materials.Grass_C}
              position={[0.065, -0.076, 3.751]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4136.geometry}
              material={materials.Grass_C}
              position={[0.178, -0.08, 3.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4138.geometry}
              material={materials.Grass_C}
              position={[0.32, -0.074, 3.721]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4140.geometry}
              material={materials.Grass_C}
              position={[0.151, -0.071, 3.806]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4142.geometry}
              material={materials.Grass_C}
              position={[0.289, -0.072, 3.753]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4144.geometry}
              material={materials.Grass_C}
              position={[0.348, -0.072, 3.743]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4146.geometry}
              material={materials.Grass_C}
              position={[-0.224, -0.073, 3.852]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4148.geometry}
              material={materials.Grass_C}
              position={[-0.188, -0.068, 3.933]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4150.geometry}
              material={materials.Grass_C}
              position={[-0.206, -0.069, 3.914]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4152.geometry}
              material={materials.Grass_C}
              position={[-0.328, -0.068, 3.972]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4154.geometry}
              material={materials.Grass_C}
              position={[-0.246, -0.068, 3.951]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4156.geometry}
              material={materials.Grass_C}
              position={[-0.274, -0.068, 3.952]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4158.geometry}
              material={materials.Grass_C}
              position={[-0.155, -0.074, 3.833]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4160.geometry}
              material={materials.Grass_C}
              position={[-0.304, -0.069, 3.944]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4162.geometry}
              material={materials.Grass_C}
              position={[-0.352, -0.074, 3.859]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4164.geometry}
              material={materials.Grass_C}
              position={[-0.106, -0.08, 3.714]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4166.geometry}
              material={materials.Grass_C}
              position={[-0.093, -0.079, 3.719]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4168.geometry}
              material={materials.Grass_C}
              position={[-0.221, -0.077, 3.775]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4170.geometry}
              material={materials.Grass_C}
              position={[-0.34, -0.083, 3.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4172.geometry}
              material={materials.Grass_C}
              position={[-0.792, -0.071, 3.853]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4174.geometry}
              material={materials.Grass_C}
              position={[-0.9, -0.07, 3.826]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4176.geometry}
              material={materials.Grass_C}
              position={[-1.067, -0.072, 3.696]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4178.geometry}
              material={materials.Grass_C}
              position={[-0.822, -0.075, 3.728]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4180.geometry}
              material={materials.Grass_C}
              position={[-2.701, 0.072, 2.719]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4182.geometry}
              material={materials.Grass_C}
              position={[-2.649, 0.064, 2.675]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4184.geometry}
              material={materials.Grass_C}
              position={[-2.344, 0.016, 2.846]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4186.geometry}
              material={materials.Grass_C}
              position={[-2.488, 0.038, 2.744]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4188.geometry}
              material={materials.Grass_C}
              position={[-2.58, 0.052, 2.637]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4190.geometry}
              material={materials.Grass_C}
              position={[-2.45, 0.033, 2.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4192.geometry}
              material={materials.Grass_C}
              position={[-2.569, 0.051, 2.641]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4194.geometry}
              material={materials.Grass_C}
              position={[-2.963, 0.092, 2.437]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4196.geometry}
              material={materials.Grass_C}
              position={[-2.868, 0.089, 2.671]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4198.geometry}
              material={materials.Grass_C}
              position={[-3.033, 0.105, 2.587]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4200.geometry}
              material={materials.Grass_C}
              position={[-2.782, 0.079, 2.634]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4202.geometry}
              material={materials.Grass_C}
              position={[-2.736, 0.064, 2.451]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4204.geometry}
              material={materials.Grass_C}
              position={[-2.759, 0.07, 2.502]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4206.geometry}
              material={materials.Grass_C}
              position={[-2.716, 0.072, 2.653]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4208.geometry}
              material={materials.Grass_C}
              position={[-2.784, 0.078, 2.614]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4210.geometry}
              material={materials.Grass_C}
              position={[-2.735, 0.074, 2.651]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4212.geometry}
              material={materials.Grass_C}
              position={[-3.098, 0.072, 2.174]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4214.geometry}
              material={materials.Grass_C}
              position={[-3.045, 0.059, 2.081]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4216.geometry}
              material={materials.Grass_C}
              position={[-2.884, 0.071, 2.308]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4218.geometry}
              material={materials.Grass_C}
              position={[-2.869, 0.069, 2.301]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4220.geometry}
              material={materials.Grass_C}
              position={[-2.871, 0.066, 2.273]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4222.geometry}
              material={materials.Grass_C}
              position={[-2.87, 0.068, 2.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4224.geometry}
              material={materials.Grass_C}
              position={[-2.985, 0.08, 2.316]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4226.geometry}
              material={materials.Grass_C}
              position={[-2.962, 0.089, 2.405]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4228.geometry}
              material={materials.Grass_C}
              position={[-3.266, 0.082, 2.175]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4230.geometry}
              material={materials.Grass_C}
              position={[-3.417, 0.043, 1.912]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4232.geometry}
              material={materials.Grass_C}
              position={[-3.294, 0.048, 1.945]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4234.geometry}
              material={materials.Grass_C}
              position={[-3.271, 0.05, 1.963]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4236.geometry}
              material={materials.Grass_C}
              position={[-3.164, 0.056, 2.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4238.geometry}
              material={materials.Grass_C}
              position={[-3.3, 0.039, 1.89]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4240.geometry}
              material={materials.Grass_C}
              position={[-3.36, -0.011, 1.579]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4242.geometry}
              material={materials.Grass_C}
              position={[-3.675, -0.068, 1.19]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4244.geometry}
              material={materials.Grass_C}
              position={[-3.736, -0.071, 1.179]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4246.geometry}
              material={materials.Grass_C}
              position={[-3.568, -0.077, 1.12]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4248.geometry}
              material={materials.Grass_C}
              position={[-3.499, -0.079, 1.103]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4250.geometry}
              material={materials.Grass_C}
              position={[-3.452, -0.051, 1.314]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4252.geometry}
              material={materials.Grass_C}
              position={[-3.455, -0.042, 1.379]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4254.geometry}
              material={materials.Grass_C}
              position={[-3.538, -0.043, 1.367]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4256.geometry}
              material={materials.Grass_C}
              position={[-3.495, -0.08, 1.1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4258.geometry}
              material={materials.Grass_C}
              position={[-3.594, -0.082, 1.06]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4260.geometry}
              material={materials.Grass_C}
              position={[-3.592, -0.101, 0.748]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4262.geometry}
              material={materials.Grass_C}
              position={[-3.555, -0.092, 0.929]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4264.geometry}
              material={materials.Grass_C}
              position={[-3.89, -0.1, 0.67]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4266.geometry}
              material={materials.Grass_C}
              position={[-3.806, -0.1, 0.479]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4268.geometry}
              material={materials.Grass_C}
              position={[-3.767, -0.101, 0.392]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4270.geometry}
              material={materials.Grass_C}
              position={[-3.769, -0.076, -0.082]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4272.geometry}
              material={materials.Grass_C}
              position={[-3.746, -0.056, -0.31]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4274.geometry}
              material={materials.Grass_C}
              position={[-3.627, -0.046, -0.551]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4276.geometry}
              material={materials.Grass_C}
              position={[-3.679, -0.042, -0.53]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4278.geometry}
              material={materials.Grass_C}
              position={[-3.818, 0.022, -1.043]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4280.geometry}
              material={materials.Grass_C}
              position={[-3.682, -0.01, -0.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4282.geometry}
              material={materials.Grass_C}
              position={[-3.568, -0.029, -0.939]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4284.geometry}
              material={materials.Grass_C}
              position={[-3.646, -0.026, -0.755]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4286.geometry}
              material={materials.Grass_C}
              position={[-3.516, -0.029, -1.197]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4288.geometry}
              material={materials.Grass_C}
              position={[-3.471, -0.04, -1.194]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4290.geometry}
              material={materials.Grass_C}
              position={[-3.522, -0.029, -1.1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4292.geometry}
              material={materials.Grass_C}
              position={[-3.405, -0.053, -1.396]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4294.geometry}
              material={materials.Grass_C}
              position={[-3.587, -0.01, -1.641]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4296.geometry}
              material={materials.Grass_C}
              position={[-3.464, -0.038, -1.659]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4298.geometry}
              material={materials.Grass_C}
              position={[-3.498, -0.032, -1.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4300.geometry}
              material={materials.Grass_C}
              position={[-3.496, -0.032, -1.7]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4302.geometry}
              material={materials.Grass_C}
              position={[-3.438, -0.046, -1.752]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4304.geometry}
              material={materials.Grass_C}
              position={[-3.441, -0.043, -1.464]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4306.geometry}
              material={materials.Grass_C}
              position={[-3.287, -0.083, -1.643]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4308.geometry}
              material={materials.Grass_C}
              position={[-3.462, -0.038, -1.579]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4310.geometry}
              material={materials.Grass_C}
              position={[-3.398, -0.054, -1.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4312.geometry}
              material={materials.Grass_C}
              position={[-3.363, -0.063, -1.523]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4314.geometry}
              material={materials.Grass_C}
              position={[-3.47, -0.035, -1.45]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4316.geometry}
              material={materials.Grass_C}
              position={[-3.18, -0.11, -1.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4318.geometry}
              material={materials.Grass_C}
              position={[-3.182, -0.108, -1.913]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4320.geometry}
              material={materials.Grass_C}
              position={[-3.328, -0.073, -1.789]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4322.geometry}
              material={materials.Grass_C}
              position={[-3.185, -0.108, -1.856]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4324.geometry}
              material={materials.Grass_C}
              position={[-3.191, -0.106, -1.879]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4326.geometry}
              material={materials.Grass_C}
              position={[-3.195, -0.099, -2.187]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4328.geometry}
              material={materials.Grass_C}
              position={[-3.065, -0.108, -2.353]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4330.geometry}
              material={materials.Grass_C}
              position={[-3.069, -0.096, -2.484]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4332.geometry}
              material={materials.Grass_C}
              position={[-3.313, -0.077, -2.249]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4334.geometry}
              material={materials.Grass_C}
              position={[-3.01, -0.111, -2.433]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4336.geometry}
              material={materials.Grass_C}
              position={[-3.235, -0.09, -2.224]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4338.geometry}
              material={materials.Grass_C}
              position={[-3.059, -0.098, -2.485]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4340.geometry}
              material={materials.Grass_C}
              position={[-2.989, -0.12, -2.364]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4342.geometry}
              material={materials.Grass_C}
              position={[-3.085, -0.122, -2.158]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4344.geometry}
              material={materials.Grass_C}
              position={[-3.013, -0.134, -2.181]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4346.geometry}
              material={materials.Grass_C}
              position={[-3.049, -0.134, -2.106]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4348.geometry}
              material={materials.Grass_C}
              position={[-2.608, -0.146, -2.604]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4350.geometry}
              material={materials.Grass_C}
              position={[-2.8, -0.15, -2.401]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4352.geometry}
              material={materials.Grass_C}
              position={[-2.786, -0.156, -2.381]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4354.geometry}
              material={materials.Grass_C}
              position={[-2.812, -0.117, -2.561]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4356.geometry}
              material={materials.Grass_C}
              position={[-2.875, -0.116, -2.517]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4358.geometry}
              material={materials.Grass_C}
              position={[-2.919, -0.12, -2.459]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4360.geometry}
              material={materials.Grass_C}
              position={[-2.88, -0.141, -2.38]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4362.geometry}
              material={materials.Grass_C}
              position={[-2.743, -0.083, -2.796]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4364.geometry}
              material={materials.Grass_C}
              position={[-2.667, -0.072, -2.893]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4366.geometry}
              material={materials.Grass_C}
              position={[-2.478, -0.073, -3.005]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4368.geometry}
              material={materials.Grass_C}
              position={[-2.493, -0.064, -3.034]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4370.geometry}
              material={materials.Grass_C}
              position={[-2.463, -0.137, -2.748]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4372.geometry}
              material={materials.Grass_C}
              position={[-2.562, -0.098, -2.836]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4374.geometry}
              material={materials.Grass_C}
              position={[-2.419, -0.122, -2.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4376.geometry}
              material={materials.Grass_C}
              position={[-2.435, -0.1, -2.915]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4378.geometry}
              material={materials.Grass_C}
              position={[-2.554, -0.105, -2.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4380.geometry}
              material={materials.Grass_C}
              position={[-2.567, -0.114, -2.767]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4382.geometry}
              material={materials.Grass_C}
              position={[-2.579, -0.129, -2.698]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4384.geometry}
              material={materials.Grass_C}
              position={[-2.603, -0.144, -2.618]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4386.geometry}
              material={materials.Grass_C}
              position={[-2.138, -0.084, -3.169]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4388.geometry}
              material={materials.Grass_C}
              position={[-2.053, -0.124, -3.068]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4390.geometry}
              material={materials.Grass_C}
              position={[-1.94, -0.061, -3.43]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4392.geometry}
              material={materials.Grass_C}
              position={[-1.822, -0.128, -3.184]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4394.geometry}
              material={materials.Grass_C}
              position={[-1.809, -0.099, -3.319]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4396.geometry}
              material={materials.Grass_C}
              position={[-1.842, -0.099, -3.296]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4398.geometry}
              material={materials.Grass_C}
              position={[-1.453, -0.128, -3.39]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4400.geometry}
              material={materials.Grass_C}
              position={[-1.727, -0.115, -3.297]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4402.geometry}
              material={materials.Grass_C}
              position={[-1.447, -0.119, -3.45]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4404.geometry}
              material={materials.Grass_C}
              position={[-1.424, -0.129, -3.399]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4406.geometry}
              material={materials.Grass_C}
              position={[-1.559, -0.106, -3.451]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4408.geometry}
              material={materials.Grass_C}
              position={[-1.554, -0.11, -3.433]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4410.geometry}
              material={materials.Grass_C}
              position={[-1.78, -0.097, -3.344]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4412.geometry}
              material={materials.Grass_C}
              position={[-1.626, -0.104, -3.415]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4414.geometry}
              material={materials.Grass_C}
              position={[-1.202, -0.096, -3.763]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4416.geometry}
              material={materials.Grass_C}
              position={[-1.46, -0.092, -3.623]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4418.geometry}
              material={materials.Grass_C}
              position={[-1.173, -0.098, -3.76]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4420.geometry}
              material={materials.Grass_C}
              position={[-1.258, -0.101, -3.677]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4422.geometry}
              material={materials.Grass_C}
              position={[-1.171, -0.093, -3.806]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4424.geometry}
              material={materials.Grass_C}
              position={[-1.193, -0.113, -3.624]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4426.geometry}
              material={materials.Grass_C}
              position={[-1.31, -0.121, -3.505]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4428.geometry}
              material={materials.Grass_C}
              position={[-0.928, -0.108, -3.7]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4430.geometry}
              material={materials.Grass_C}
              position={[-0.96, -0.131, -3.542]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4432.geometry}
              material={materials.Grass_C}
              position={[-0.834, -0.123, -3.577]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4434.geometry}
              material={materials.Grass_C}
              position={[-0.913, -0.117, -3.631]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4436.geometry}
              material={materials.Grass_C}
              position={[-0.825, -0.11, -3.675]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4438.geometry}
              material={materials.Grass_C}
              position={[-0.502, -0.057, -3.924]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4440.geometry}
              material={materials.Grass_C}
              position={[-0.388, -0.063, -3.794]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4442.geometry}
              material={materials.Grass_C}
              position={[-0.655, -0.1, -3.681]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4444.geometry}
              material={materials.Grass_C}
              position={[-0.384, -0.061, -3.805]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4446.geometry}
              material={materials.Grass_C}
              position={[-0.73, -0.092, -3.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4448.geometry}
              material={materials.Grass_C}
              position={[-0.686, -0.107, -3.656]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4450.geometry}
              material={materials.Grass_C}
              position={[-0.439, -0.085, -3.657]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4452.geometry}
              material={materials.Grass_C}
              position={[-0.478, -0.089, -3.654]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4454.geometry}
              material={materials.Grass_C}
              position={[-0.262, -0.057, -3.763]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4456.geometry}
              material={materials.Grass_C}
              position={[-0.291, -0.068, -3.693]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4458.geometry}
              material={materials.Grass_C}
              position={[-0.159, -0.055, -3.71]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4460.geometry}
              material={materials.Grass_C}
              position={[-0.132, -0.048, -3.755]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4462.geometry}
              material={materials.Grass_C}
              position={[-0.293, -0.067, -3.701]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4464.geometry}
              material={materials.Grass_C}
              position={[0.229, -0.001, -4.085]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4466.geometry}
              material={materials.Grass_C}
              position={[0.368, 0.006, -4.121]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4468.geometry}
              material={materials.Grass_C}
              position={[0.121, 0.006, -4.235]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4470.geometry}
              material={materials.Grass_C}
              position={[0.202, -0.001, -4.086]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4472.geometry}
              material={materials.Grass_C}
              position={[0.209, -0.001, -4.092]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4474.geometry}
              material={materials.Grass_C}
              position={[0.143, 0.001, -4.145]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4476.geometry}
              material={materials.Grass_C}
              position={[0.197, 0.005, -4.178]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4478.geometry}
              material={materials.Grass_C}
              position={[0.097, 0, -4.16]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4480.geometry}
              material={materials.Grass_C}
              position={[0.557, 0.01, -4.202]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4482.geometry}
              material={materials.Grass_C}
              position={[0.533, -0.001, -4.036]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4484.geometry}
              material={materials.Grass_C}
              position={[0.952, -0.009, -4.015]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4486.geometry}
              material={materials.Grass_C}
              position={[0.859, -0.009, -3.981]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4488.geometry}
              material={materials.Grass_C}
              position={[1.341, -0.018, -3.983]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4490.geometry}
              material={materials.Grass_C}
              position={[1.38, -0.018, -3.897]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4492.geometry}
              material={materials.Grass_C}
              position={[1.506, -0.016, -3.743]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4494.geometry}
              material={materials.Grass_C}
              position={[1.409, -0.018, -3.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4496.geometry}
              material={materials.Grass_C}
              position={[1.296, -0.018, -3.968]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4498.geometry}
              material={materials.Grass_C}
              position={[1.265, -0.018, -3.904]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4500.geometry}
              material={materials.Grass_C}
              position={[1.379, -0.018, -3.847]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4502.geometry}
              material={materials.Grass_C}
              position={[1.532, -0.017, -3.837]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4504.geometry}
              material={materials.Grass_C}
              position={[1.551, -0.015, -3.72]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4506.geometry}
              material={materials.Grass_C}
              position={[1.801, -0.003, -3.678]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4508.geometry}
              material={materials.Grass_C}
              position={[1.803, -0.004, -3.709]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4510.geometry}
              material={materials.Grass_C}
              position={[1.847, -0.001, -3.662]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4512.geometry}
              material={materials.Grass_C}
              position={[1.668, -0.014, -3.837]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4514.geometry}
              material={materials.Grass_C}
              position={[1.902, 0.002, -3.657]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4516.geometry}
              material={materials.Grass_C}
              position={[2.2, 0.028, -3.499]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4518.geometry}
              material={materials.Grass_C}
              position={[2.029, 0.017, -3.499]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4520.geometry}
              material={materials.Grass_C}
              position={[2.232, 0.034, -3.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4522.geometry}
              material={materials.Grass_C}
              position={[1.944, 0.006, -3.612]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4524.geometry}
              material={materials.Grass_C}
              position={[2.107, 0.022, -3.489]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4526.geometry}
              material={materials.Grass_C}
              position={[2.095, 0.016, -3.6]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4528.geometry}
              material={materials.Grass_C}
              position={[2.06, 0.022, -3.444]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4530.geometry}
              material={materials.Grass_C}
              position={[2.112, 0.025, -3.454]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4532.geometry}
              material={materials.Grass_C}
              position={[2.244, 0.03, -3.512]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4534.geometry}
              material={materials.Grass_C}
              position={[2.64, 0.053, -3.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4536.geometry}
              material={materials.Grass_C}
              position={[2.649, 0.053, -3.241]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4538.geometry}
              material={materials.Grass_C}
              position={[2.485, 0.043, -3.424]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4540.geometry}
              material={materials.Grass_C}
              position={[2.509, 0.044, -3.402]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4542.geometry}
              material={materials.Grass_C}
              position={[2.595, 0.051, -3.253]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4544.geometry}
              material={materials.Grass_C}
              position={[2.473, 0.045, -3.329]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4546.geometry}
              material={materials.Grass_C}
              position={[2.427, 0.046, -3.247]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4548.geometry}
              material={materials.Grass_C}
              position={[2.423, 0.042, -3.377]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4550.geometry}
              material={materials.Grass_C}
              position={[2.544, 0.051, -3.183]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4552.geometry}
              material={materials.Grass_C}
              position={[2.549, 0.053, -3.123]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4554.geometry}
              material={materials.Grass_C}
              position={[2.627, 0.053, -3.184]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4556.geometry}
              material={materials.Grass_C}
              position={[2.6, 0.052, -3.142]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4558.geometry}
              material={materials.Grass_C}
              position={[2.695, 0.046, -2.993]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4560.geometry}
              material={materials.Grass_C}
              position={[2.614, 0.051, -3.091]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4562.geometry}
              material={materials.Grass_C}
              position={[2.743, 0.043, -2.913]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4564.geometry}
              material={materials.Grass_C}
              position={[2.858, 0.039, -2.89]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4566.geometry}
              material={materials.Grass_C}
              position={[2.576, 0.051, -3.064]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4568.geometry}
              material={materials.Grass_C}
              position={[2.713, 0.047, -3.067]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4570.geometry}
              material={materials.Grass_C}
              position={[3.155, 0.012, -2.808]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4572.geometry}
              material={materials.Grass_C}
              position={[3.118, 0.015, -2.814]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4574.geometry}
              material={materials.Grass_C}
              position={[3.051, 0.029, -2.948]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4576.geometry}
              material={materials.Grass_C}
              position={[3.088, 0.031, -3.037]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4578.geometry}
              material={materials.Grass_C}
              position={[3.082, 0.033, -3.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4580.geometry}
              material={materials.Grass_C}
              position={[3.168, 0.005, -2.721]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4582.geometry}
              material={materials.Grass_C}
              position={[3.224, 0, -2.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4584.geometry}
              material={materials.Grass_C}
              position={[3.191, 0.011, -2.846]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4586.geometry}
              material={materials.Grass_C}
              position={[3.161, 0.021, -2.968]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4588.geometry}
              material={materials.Grass_C}
              position={[3.196, 0.003, -2.722]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4590.geometry}
              material={materials.Grass_C}
              position={[2.921, 0.031, -2.822]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4592.geometry}
              material={materials.Grass_C}
              position={[3.109, 0.014, -2.781]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4594.geometry}
              material={materials.Grass_C}
              position={[2.99, 0.022, -2.764]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4596.geometry}
              material={materials.Grass_C}
              position={[2.966, 0.032, -2.897]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4598.geometry}
              material={materials.Grass_C}
              position={[2.927, 0.025, -2.732]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4600.geometry}
              material={materials.Grass_C}
              position={[2.9, 0.033, -2.828]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4602.geometry}
              material={materials.Grass_C}
              position={[3.154, -0.002, -2.588]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4604.geometry}
              material={materials.Grass_C}
              position={[3.314, -0.025, -2.487]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4606.geometry}
              material={materials.Grass_C}
              position={[3.337, -0.036, -2.369]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4608.geometry}
              material={materials.Grass_C}
              position={[3.325, -0.043, -2.277]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4610.geometry}
              material={materials.Grass_C}
              position={[3.264, -0.021, -2.478]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4612.geometry}
              material={materials.Grass_C}
              position={[3.367, -0.043, -2.325]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4614.geometry}
              material={materials.Grass_C}
              position={[3.176, -0.008, -2.535]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4616.geometry}
              material={materials.Grass_C}
              position={[3.746, -0.085, -2.108]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4618.geometry}
              material={materials.Grass_C}
              position={[3.613, -0.064, -2.311]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4620.geometry}
              material={materials.Grass_C}
              position={[3.55, -0.071, -2.119]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4622.geometry}
              material={materials.Grass_C}
              position={[3.636, -0.084, -2.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4624.geometry}
              material={materials.Grass_C}
              position={[3.556, -0.068, -2.177]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4626.geometry}
              material={materials.Grass_C}
              position={[3.539, -0.086, -1.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4628.geometry}
              material={materials.Grass_C}
              position={[3.633, -0.088, -1.918]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4630.geometry}
              material={materials.Grass_C}
              position={[3.623, -0.092, -1.703]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4632.geometry}
              material={materials.Grass_C}
              position={[3.596, -0.089, -1.793]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4634.geometry}
              material={materials.Grass_C}
              position={[3.774, -0.097, -1.653]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4636.geometry}
              material={materials.Grass_C}
              position={[3.689, -0.097, -1.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4638.geometry}
              material={materials.Grass_C}
              position={[3.677, -0.09, -1.912]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4640.geometry}
              material={materials.Grass_C}
              position={[3.658, -0.091, -1.803]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4642.geometry}
              material={materials.Grass_C}
              position={[3.804, -0.097, -1.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4644.geometry}
              material={materials.Grass_C}
              position={[3.995, -0.1, -1.363]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4646.geometry}
              material={materials.Grass_C}
              position={[4.053, -0.1, -1.276]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4648.geometry}
              material={materials.Grass_C}
              position={[4.036, -0.1, -1.514]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4650.geometry}
              material={materials.Grass_C}
              position={[4.066, -0.1, -1.347]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4652.geometry}
              material={materials.Grass_C}
              position={[3.821, -0.1, -1.549]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4654.geometry}
              material={materials.Grass_C}
              position={[3.875, -0.1, -1.228]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4656.geometry}
              material={materials.Grass_C}
              position={[3.861, -0.1, -1.397]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4658.geometry}
              material={materials.Grass_C}
              position={[3.974, -0.1, -1.23]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4660.geometry}
              material={materials.Grass_C}
              position={[3.834, -0.1, -1.324]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4662.geometry}
              material={materials.Grass_C}
              position={[3.894, -0.1, -1.252]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4664.geometry}
              material={materials.Grass_C}
              position={[3.907, -0.1, -0.907]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4666.geometry}
              material={materials.Grass_C}
              position={[4.053, -0.1, -0.454]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4668.geometry}
              material={materials.Grass_C}
              position={[3.946, -0.1, -0.697]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4670.geometry}
              material={materials.Grass_C}
              position={[4.008, -0.1, -0.53]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4672.geometry}
              material={materials.Grass_C}
              position={[4.064, -0.1, -0.199]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4674.geometry}
              material={materials.Grass_C}
              position={[4.038, -0.1, -0.157]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4676.geometry}
              material={materials.Grass_C}
              position={[4.091, -0.1, -0.062]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4678.geometry}
              material={materials.Grass_C}
              position={[3.993, -0.1, -0.337]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4680.geometry}
              material={materials.Grass_C}
              position={[4.051, -0.1, 0.22]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4682.geometry}
              material={materials.Grass_C}
              position={[4.026, -0.1, 0.035]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4684.geometry}
              material={materials.Grass_C}
              position={[4.145, -0.1, 0.378]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4686.geometry}
              material={materials.Grass_C}
              position={[4.121, -0.1, 0.37]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4688.geometry}
              material={materials.Grass_C}
              position={[4.122, -0.1, 0.353]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4690.geometry}
              material={materials.Grass_C}
              position={[4.114, -0.1, 0.521]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4692.geometry}
              material={materials.Grass_C}
              position={[4.137, -0.1, 0.429]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4694.geometry}
              material={materials.Grass_C}
              position={[3.954, -0.105, 0.622]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4696.geometry}
              material={materials.Grass_C}
              position={[4.031, -0.101, 0.456]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4698.geometry}
              material={materials.Grass_C}
              position={[4.054, -0.102, 0.776]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4700.geometry}
              material={materials.Grass_C}
              position={[3.984, -0.103, 0.528]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4702.geometry}
              material={materials.Grass_C}
              position={[4.118, -0.1, 0.541]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4704.geometry}
              material={materials.Grass_C}
              position={[4.178, -0.062, 1.216]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4706.geometry}
              material={materials.Grass_C}
              position={[4.158, -0.069, 1.168]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4708.geometry}
              material={materials.Grass_C}
              position={[4.03, -0.082, 1.118]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4710.geometry}
              material={materials.Grass_C}
              position={[4.087, -0.094, 0.902]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4712.geometry}
              material={materials.Grass_C}
              position={[4.194, -0.076, 1.08]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4714.geometry}
              material={materials.Grass_C}
              position={[4.067, -0.093, 0.937]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4716.geometry}
              material={materials.Grass_C}
              position={[3.956, -0.103, 0.899]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4718.geometry}
              material={materials.Grass_C}
              position={[4.047, -0.101, 0.838]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4720.geometry}
              material={materials.Grass_C}
              position={[3.91, -0.105, 0.952]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4722.geometry}
              material={materials.Grass_C}
              position={[3.928, -0.101, 1.001]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4724.geometry}
              material={materials.Grass_C}
              position={[3.783, -0.09, 1.34]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4726.geometry}
              material={materials.Grass_C}
              position={[3.91, -0.071, 1.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4728.geometry}
              material={materials.Grass_C}
              position={[3.827, -0.062, 1.49]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4730.geometry}
              material={materials.Grass_C}
              position={[3.858, -0.03, 1.653]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4732.geometry}
              material={materials.Grass_C}
              position={[3.928, -0.018, 1.666]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4734.geometry}
              material={materials.Grass_C}
              position={[3.873, -0.019, 1.703]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4736.geometry}
              material={materials.Grass_C}
              position={[3.866, -0.033, 1.629]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4738.geometry}
              material={materials.Grass_C}
              position={[3.887, 0.008, 1.843]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4740.geometry}
              material={materials.Grass_C}
              position={[4.022, 0.001, 1.699]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4742.geometry}
              material={materials.Grass_C}
              position={[3.934, -0.02, 1.646]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4744.geometry}
              material={materials.Grass_C}
              position={[3.727, -0.07, 1.568]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4746.geometry}
              material={materials.Grass_C}
              position={[3.785, -0.058, 1.576]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4748.geometry}
              material={materials.Grass_C}
              position={[3.677, -0.014, 1.935]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4750.geometry}
              material={materials.Grass_C}
              position={[3.621, -0.063, 1.746]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4752.geometry}
              material={materials.Grass_C}
              position={[3.588, -0.042, 1.904]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4754.geometry}
              material={materials.Grass_C}
              position={[3.689, -0.045, 1.76]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4756.geometry}
              material={materials.Grass_C}
              position={[3.709, -0.055, 1.684]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4758.geometry}
              material={materials.Grass_C}
              position={[3.807, -0.037, 1.671]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4760.geometry}
              material={materials.Grass_C}
              position={[3.492, 0.002, 2.261]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4762.geometry}
              material={materials.Grass_C}
              position={[3.526, 0.007, 2.24]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4764.geometry}
              material={materials.Grass_C}
              position={[3.471, -0.031, 2.129]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4766.geometry}
              material={materials.Grass_C}
              position={[3.41, -0.042, 2.16]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4768.geometry}
              material={materials.Grass_C}
              position={[3.526, -0.006, 2.178]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4770.geometry}
              material={materials.Grass_C}
              position={[3.514, -0.039, 2.024]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4772.geometry}
              material={materials.Grass_C}
              position={[3.378, -0.037, 2.234]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4774.geometry}
              material={materials.Grass_C}
              position={[3.454, 0.032, 2.52]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4776.geometry}
              material={materials.Grass_C}
              position={[3.376, 0.014, 2.537]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4778.geometry}
              material={materials.Grass_C}
              position={[3.309, 0.02, 2.706]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4780.geometry}
              material={materials.Grass_C}
              position={[3.465, 0.015, 2.372]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4782.geometry}
              material={materials.Grass_C}
              position={[3.384, 0.01, 2.488]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4784.geometry}
              material={materials.Grass_C}
              position={[3.244, -0.03, 2.512]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4786.geometry}
              material={materials.Grass_C}
              position={[3.399, -0.011, 2.342]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4788.geometry}
              material={materials.Grass_C}
              position={[3.278, -0.01, 2.556]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4790.geometry}
              material={materials.Grass_C}
              position={[3.367, -0.004, 2.436]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4792.geometry}
              material={materials.Grass_C}
              position={[3.374, -0.01, 2.391]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4794.geometry}
              material={materials.Grass_C}
              position={[3.465, 0.01, 2.343]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4796.geometry}
              material={materials.Grass_C}
              position={[3.293, -0.015, 2.502]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4798.geometry}
              material={materials.Grass_C}
              position={[3.033, -0.049, 2.804]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4800.geometry}
              material={materials.Grass_C}
              position={[2.915, -0.071, 2.905]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4802.geometry}
              material={materials.Grass_C}
              position={[2.885, -0.091, 2.839]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4804.geometry}
              material={materials.Grass_C}
              position={[3.103, -0.056, 2.624]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4806.geometry}
              material={materials.Grass_C}
              position={[3.076, -0.061, 2.649]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4808.geometry}
              material={materials.Grass_C}
              position={[2.929, -0.093, 2.741]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4810.geometry}
              material={materials.Grass_C}
              position={[2.944, -0.095, 2.705]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4812.geometry}
              material={materials.Grass_C}
              position={[3.096, -0.065, 2.586]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4814.geometry}
              material={materials.Grass_C}
              position={[2.901, -0.079, 2.885]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4816.geometry}
              material={materials.Grass_C}
              position={[3.11, -0.051, 2.638]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4818.geometry}
              material={materials.Grass_C}
              position={[3.052, -0.056, 2.723]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4820.geometry}
              material={materials.Grass_C}
              position={[2.835, -0.052, 3.269]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4822.geometry}
              material={materials.Grass_C}
              position={[2.696, -0.088, 3.194]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4824.geometry}
              material={materials.Grass_C}
              position={[2.741, -0.072, 3.299]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4826.geometry}
              material={materials.Grass_C}
              position={[2.966, -0.027, 3.168]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4828.geometry}
              material={materials.Grass_C}
              position={[2.679, -0.109, 3.079]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4830.geometry}
              material={materials.Grass_C}
              position={[2.723, -0.117, 2.958]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4832.geometry}
              material={materials.Grass_C}
              position={[2.569, -0.136, 3.088]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4834.geometry}
              material={materials.Grass_C}
              position={[2.903, -0.074, 2.909]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4836.geometry}
              material={materials.Grass_C}
              position={[2.763, -0.105, 2.959]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4838.geometry}
              material={materials.Grass_C}
              position={[2.722, -0.121, 2.932]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4840.geometry}
              material={materials.Grass_C}
              position={[2.746, -0.095, 3.048]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4842.geometry}
              material={materials.Grass_C}
              position={[2.808, -0.101, 2.909]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4844.geometry}
              material={materials.Grass_C}
              position={[2.315, -0.143, 3.298]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4846.geometry}
              material={materials.Grass_C}
              position={[2.289, -0.149, 3.284]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4848.geometry}
              material={materials.Grass_C}
              position={[2.311, -0.132, 3.387]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4850.geometry}
              material={materials.Grass_C}
              position={[2.281, -0.134, 3.402]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4852.geometry}
              material={materials.Grass_C}
              position={[2.291, -0.143, 3.322]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4854.geometry}
              material={materials.Grass_C}
              position={[2.362, -0.122, 3.403]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4856.geometry}
              material={materials.Grass_C}
              position={[2.392, -0.142, 3.234]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4858.geometry}
              material={materials.Grass_C}
              position={[2.141, -0.108, 3.612]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4860.geometry}
              material={materials.Grass_C}
              position={[2.038, -0.102, 3.685]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4862.geometry}
              material={materials.Grass_C}
              position={[2.094, -0.093, 3.767]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4864.geometry}
              material={materials.Grass_C}
              position={[2.162, -0.109, 3.597]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4866.geometry}
              material={materials.Grass_C}
              position={[2.363, -0.099, 3.667]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4868.geometry}
              material={materials.Grass_C}
              position={[2.362, -0.108, 3.57]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4870.geometry}
              material={materials.Grass_C}
              position={[2.076, -0.096, 3.738]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4872.geometry}
              material={materials.Grass_C}
              position={[1.967, -0.114, 3.605]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4874.geometry}
              material={materials.Grass_C}
              position={[2.258, -0.118, 3.502]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4876.geometry}
              material={materials.Grass_C}
              position={[1.988, -0.13, 3.491]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4878.geometry}
              material={materials.Grass_C}
              position={[2.182, -0.144, 3.375]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4880.geometry}
              material={materials.Grass_C}
              position={[1.829, -0.095, 3.729]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4882.geometry}
              material={materials.Grass_C}
              position={[1.846, -0.106, 3.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4884.geometry}
              material={materials.Grass_C}
              position={[1.84, -0.103, 3.678]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4886.geometry}
              material={materials.Grass_C}
              position={[1.662, -0.096, 3.716]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4888.geometry}
              material={materials.Grass_C}
              position={[1.658, -0.078, 3.832]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4890.geometry}
              material={materials.Grass_C}
              position={[1.648, -0.091, 3.747]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4892.geometry}
              material={materials.Grass_C}
              position={[1.581, -0.086, 3.774]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4894.geometry}
              material={materials.Grass_C}
              position={[1.595, -0.097, 3.701]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4896.geometry}
              material={materials.Grass_C}
              position={[1.788, -0.12, 3.568]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4898.geometry}
              material={materials.Grass_C}
              position={[1.767, -0.1, 3.694]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4900.geometry}
              material={materials.Grass_C}
              position={[1.599, -0.053, 4.045]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4902.geometry}
              material={materials.Grass_C}
              position={[1.498, -0.057, 3.981]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4904.geometry}
              material={materials.Grass_C}
              position={[1.586, -0.054, 4.03]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4906.geometry}
              material={materials.Grass_C}
              position={[1.569, -0.069, 3.886]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4908.geometry}
              material={materials.Grass_C}
              position={[1.336, -0.053, 3.965]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4910.geometry}
              material={materials.Grass_C}
              position={[1.437, -0.056, 3.967]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4912.geometry}
              material={materials.Grass_C}
              position={[1.524, -0.054, 4.012]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4914.geometry}
              material={materials.Grass_C}
              position={[1.454, -0.055, 3.984]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4916.geometry}
              material={materials.Grass_C}
              position={[1.503, -0.053, 4.019]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4918.geometry}
              material={materials.Grass_C}
              position={[1.367, -0.079, 3.782]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4920.geometry}
              material={materials.Grass_C}
              position={[1.236, -0.048, 3.979]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4922.geometry}
              material={materials.Grass_C}
              position={[1.277, -0.053, 3.951]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4924.geometry}
              material={materials.Grass_C}
              position={[1.436, -0.083, 3.772]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4926.geometry}
              material={materials.Grass_C}
              position={[1.244, -0.056, 3.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4928.geometry}
              material={materials.Grass_C}
              position={[1.277, -0.075, 3.796]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4930.geometry}
              material={materials.Grass_C}
              position={[0.879, -0.041, 4.019]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4932.geometry}
              material={materials.Grass_C}
              position={[1.113, -0.065, 3.836]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4934.geometry}
              material={materials.Grass_C}
              position={[0.909, -0.043, 4.004]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4936.geometry}
              material={materials.Grass_C}
              position={[1.107, -0.054, 3.92]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4938.geometry}
              material={materials.Grass_C}
              position={[0.929, -0.051, 3.931]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4940.geometry}
              material={materials.Grass_C}
              position={[0.961, -0.049, 3.95]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4942.geometry}
              material={materials.Grass_C}
              position={[0.922, -0.039, 4.051]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4944.geometry}
              material={materials.Grass_C}
              position={[0.898, -0.052, 3.912]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4946.geometry}
              material={materials.Grass_C}
              position={[1.106, -0.056, 3.908]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4948.geometry}
              material={materials.Grass_C}
              position={[0.572, -0.037, 4.136]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4950.geometry}
              material={materials.Grass_C}
              position={[0.67, -0.046, 3.99]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4952.geometry}
              material={materials.Grass_C}
              position={[0.51, -0.048, 4.004]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4954.geometry}
              material={materials.Grass_C}
              position={[0.524, -0.046, 4.036]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4956.geometry}
              material={materials.Grass_C}
              position={[0.627, -0.045, 4.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4958.geometry}
              material={materials.Grass_C}
              position={[0.731, -0.042, 4.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4960.geometry}
              material={materials.Grass_C}
              position={[0.528, -0.044, 4.061]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4962.geometry}
              material={materials.Grass_C}
              position={[0.556, -0.046, 4.027]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4964.geometry}
              material={materials.Grass_C}
              position={[0.525, -0.05, 3.982]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4966.geometry}
              material={materials.Grass_C}
              position={[0.555, -0.043, 4.07]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4968.geometry}
              material={materials.Grass_C}
              position={[0.461, -0.049, 4.008]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4970.geometry}
              material={materials.Grass_C}
              position={[0.128, -0.055, 4.053]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4972.geometry}
              material={materials.Grass_C}
              position={[0.292, -0.053, 4.01]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4974.geometry}
              material={materials.Grass_C}
              position={[-3.181, 0.106, 2.469]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4976.geometry}
              material={materials.Grass_C}
              position={[-3.155, 0.108, 2.498]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4978.geometry}
              material={materials.Grass_C}
              position={[-3.104, 0.109, 2.53]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4980.geometry}
              material={materials.Grass_C}
              position={[-3.467, 0.053, 1.979]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4982.geometry}
              material={materials.Grass_C}
              position={[-3.435, 0.067, 2.077]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4984.geometry}
              material={materials.Grass_C}
              position={[-3.833, -0.073, 1.191]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4986.geometry}
              material={materials.Grass_C}
              position={[-3.896, -0.085, 1.036]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4988.geometry}
              material={materials.Grass_C}
              position={[-3.993, -0.099, 0.551]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4990.geometry}
              material={materials.Grass_C}
              position={[-3.977, -0.099, 0.395]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4992.geometry}
              material={materials.Grass_C}
              position={[-3.702, 0.017, -1.542]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4994.geometry}
              material={materials.Grass_C}
              position={[-3.618, -0.008, -1.778]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4996.geometry}
              material={materials.Grass_C}
              position={[-3.548, -0.036, -2.131]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_4998.geometry}
              material={materials.Grass_C}
              position={[-3.407, -0.066, -2.272]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5000.geometry}
              material={materials.Grass_C}
              position={[-3.499, -0.05, -2.234]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5002.geometry}
              material={materials.Grass_C}
              position={[-3.478, -0.047, -2.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5004.geometry}
              material={materials.Grass_C}
              position={[-3.507, -0.04, -2.055]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5006.geometry}
              material={materials.Grass_C}
              position={[-3.479, -0.057, -2.331]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5008.geometry}
              material={materials.Grass_C}
              position={[-3.341, -0.074, -2.24]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5010.geometry}
              material={materials.Grass_C}
              position={[-3.308, -0.071, -2.422]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5012.geometry}
              material={materials.Grass_C}
              position={[-3.46, -0.059, -2.343]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5014.geometry}
              material={materials.Grass_C}
              position={[-3.209, -0.073, -2.606]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5016.geometry}
              material={materials.Grass_C}
              position={[-3.292, -0.067, -2.557]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5018.geometry}
              material={materials.Grass_C}
              position={[-2.986, -0.044, -2.915]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5020.geometry}
              material={materials.Grass_C}
              position={[-2.968, -0.069, -2.739]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5022.geometry}
              material={materials.Grass_C}
              position={[-3.175, -0.064, -2.704]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5024.geometry}
              material={materials.Grass_C}
              position={[-2.99, -0.076, -2.678]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5026.geometry}
              material={materials.Grass_C}
              position={[-3.087, -0.087, -2.556]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5028.geometry}
              material={materials.Grass_C}
              position={[-2.766, -0.04, -3.025]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5030.geometry}
              material={materials.Grass_C}
              position={[-2.703, -0.049, -2.998]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5032.geometry}
              material={materials.Grass_C}
              position={[-2.834, -0.036, -3.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5034.geometry}
              material={materials.Grass_C}
              position={[-2.663, -0.027, -3.146]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5036.geometry}
              material={materials.Grass_C}
              position={[-2.906, -0.049, -2.914]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5038.geometry}
              material={materials.Grass_C}
              position={[-2.602, -0.042, -3.084]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5040.geometry}
              material={materials.Grass_C}
              position={[-2.841, -0.039, -3.005]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5042.geometry}
              material={materials.Grass_C}
              position={[-2.625, -0.022, -3.196]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5044.geometry}
              material={materials.Grass_C}
              position={[-2.781, -0.061, -2.878]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5046.geometry}
              material={materials.Grass_C}
              position={[-2.451, -0.023, -3.291]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5048.geometry}
              material={materials.Grass_C}
              position={[-2.305, -0.037, -3.289]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5050.geometry}
              material={materials.Grass_C}
              position={[-2.401, -0.025, -3.308]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5052.geometry}
              material={materials.Grass_C}
              position={[-2.097, -0.037, -3.452]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5054.geometry}
              material={materials.Grass_C}
              position={[-1.83, -0.05, -3.598]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5056.geometry}
              material={materials.Grass_C}
              position={[-1.738, -0.06, -3.616]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5058.geometry}
              material={materials.Grass_C}
              position={[-1.455, -0.076, -3.744]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5060.geometry}
              material={materials.Grass_C}
              position={[-0.907, -0.077, -3.957]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5062.geometry}
              material={materials.Grass_C}
              position={[-1.018, -0.086, -3.874]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5064.geometry}
              material={materials.Grass_C}
              position={[-1.073, -0.083, -3.912]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5066.geometry}
              material={materials.Grass_C}
              position={[-0.231, -0.022, -4.106]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5068.geometry}
              material={materials.Grass_C}
              position={[3.309, 0.008, -2.966]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5070.geometry}
              material={materials.Grass_C}
              position={[3.345, -0.004, -2.818]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5072.geometry}
              material={materials.Grass_C}
              position={[3.27, 0.01, -2.94]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5074.geometry}
              material={materials.Grass_C}
              position={[3.242, 0.015, -2.986]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5076.geometry}
              material={materials.Grass_C}
              position={[3.212, 0.021, -3.042]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5078.geometry}
              material={materials.Grass_C}
              position={[3.555, -0.032, -2.695]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5080.geometry}
              material={materials.Grass_C}
              position={[3.585, -0.035, -2.687]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5082.geometry}
              material={materials.Grass_C}
              position={[3.502, -0.032, -2.623]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5084.geometry}
              material={materials.Grass_C}
              position={[3.444, -0.015, -2.781]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5086.geometry}
              material={materials.Grass_C}
              position={[3.481, -0.026, -2.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5088.geometry}
              material={materials.Grass_C}
              position={[3.495, -0.023, -2.743]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5090.geometry}
              material={materials.Grass_C}
              position={[3.583, -0.032, -2.735]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5092.geometry}
              material={materials.Grass_C}
              position={[3.826, -0.084, -2.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5094.geometry}
              material={materials.Grass_C}
              position={[3.653, -0.06, -2.433]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5096.geometry}
              material={materials.Grass_C}
              position={[3.697, -0.065, -2.399]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5098.geometry}
              material={materials.Grass_C}
              position={[3.782, -0.084, -2.163]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5100.geometry}
              material={materials.Grass_C}
              position={[3.712, -0.071, -2.312]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5102.geometry}
              material={materials.Grass_C}
              position={[3.799, -0.075, -2.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5104.geometry}
              material={materials.Grass_C}
              position={[3.822, -0.077, -2.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5106.geometry}
              material={materials.Grass_C}
              position={[3.882, -0.09, -2.159]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5108.geometry}
              material={materials.Grass_C}
              position={[3.9, -0.096, -1.939]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5110.geometry}
              material={materials.Grass_C}
              position={[3.926, -0.096, -2.051]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5112.geometry}
              material={materials.Grass_C}
              position={[4.04, -0.099, -1.808]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5114.geometry}
              material={materials.Grass_C}
              position={[4.182, -0.1, -1.398]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5116.geometry}
              material={materials.Grass_C}
              position={[4.101, -0.1, -1.68]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5118.geometry}
              material={materials.Grass_C}
              position={[4.075, -0.1, -1.658]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5120.geometry}
              material={materials.Grass_C}
              position={[4.145, -0.1, -1.439]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5122.geometry}
              material={materials.Grass_C}
              position={[4.183, -0.1, -1.483]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5124.geometry}
              material={materials.Grass_C}
              position={[4.148, -0.1, -1.464]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5126.geometry}
              material={materials.Grass_C}
              position={[4.214, -0.1, -1.122]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5128.geometry}
              material={materials.Grass_C}
              position={[4.229, -0.056, 1.267]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5130.geometry}
              material={materials.Grass_C}
              position={[4.136, -0.027, 1.477]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5132.geometry}
              material={materials.Grass_C}
              position={[4.209, -0.002, 1.61]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5134.geometry}
              material={materials.Grass_C}
              position={[4.155, -0.028, 1.462]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5136.geometry}
              material={materials.Grass_C}
              position={[4.096, 0.075, 2.091]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5138.geometry}
              material={materials.Grass_C}
              position={[4.165, 0.059, 1.984]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5140.geometry}
              material={materials.Grass_C}
              position={[4.126, 0.08, 2.113]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5142.geometry}
              material={materials.Grass_C}
              position={[4.3, 0.032, 1.817]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5144.geometry}
              material={materials.Grass_C}
              position={[4.314, 0.037, 1.845]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5146.geometry}
              material={materials.Grass_C}
              position={[4.172, 0.081, 2.111]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5148.geometry}
              material={materials.Grass_C}
              position={[4.182, 0.084, 2.126]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5150.geometry}
              material={materials.Grass_C}
              position={[4.076, 0.085, 2.149]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5152.geometry}
              material={materials.Grass_C}
              position={[3.971, 0.053, 2.022]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5154.geometry}
              material={materials.Grass_C}
              position={[4.063, 0.05, 1.955]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5156.geometry}
              material={materials.Grass_C}
              position={[4.031, 0.056, 2.002]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5158.geometry}
              material={materials.Grass_C}
              position={[3.99, 0.016, 1.801]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5160.geometry}
              material={materials.Grass_C}
              position={[3.856, 0.04, 2.023]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5162.geometry}
              material={materials.Grass_C}
              position={[4.012, 0.038, 1.919]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5164.geometry}
              material={materials.Grass_C}
              position={[3.89, 0.041, 2.009]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5166.geometry}
              material={materials.Grass_C}
              position={[3.927, 0.03, 1.922]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5168.geometry}
              material={materials.Grass_C}
              position={[3.959, 0.022, 1.858]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5170.geometry}
              material={materials.Grass_C}
              position={[4.116, 0.039, 1.872]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5172.geometry}
              material={materials.Grass_C}
              position={[3.778, 0.087, 2.401]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5174.geometry}
              material={materials.Grass_C}
              position={[3.725, 0.063, 2.305]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5176.geometry}
              material={materials.Grass_C}
              position={[3.909, 0.083, 2.246]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5178.geometry}
              material={materials.Grass_C}
              position={[3.76, 0.092, 2.453]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5180.geometry}
              material={materials.Grass_C}
              position={[3.828, 0.063, 2.199]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5182.geometry}
              material={materials.Grass_C}
              position={[3.926, 0.065, 2.11]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5184.geometry}
              material={materials.Grass_C}
              position={[3.691, 0.098, 2.66]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5186.geometry}
              material={materials.Grass_C}
              position={[3.497, 0.061, 2.673]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5188.geometry}
              material={materials.Grass_C}
              position={[3.414, 0.054, 2.784]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5190.geometry}
              material={materials.Grass_C}
              position={[3.559, 0.081, 2.751]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5192.geometry}
              material={materials.Grass_C}
              position={[3.596, 0.081, 2.674]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5194.geometry}
              material={materials.Grass_C}
              position={[3.476, 0.057, 2.672]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5196.geometry}
              material={materials.Grass_C}
              position={[3.593, 0.086, 2.727]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5198.geometry}
              material={materials.Grass_C}
              position={[3.385, 0.054, 2.945]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5200.geometry}
              material={materials.Grass_C}
              position={[3.342, 0.042, 2.862]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5202.geometry}
              material={materials.Grass_C}
              position={[3.193, 0.017, 3.164]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5204.geometry}
              material={materials.Grass_C}
              position={[3.26, 0.03, 3.087]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5206.geometry}
              material={materials.Grass_C}
              position={[3.224, 0.022, 3.062]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5208.geometry}
              material={materials.Grass_C}
              position={[2.938, -0.032, 3.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5210.geometry}
              material={materials.Grass_C}
              position={[3.127, 0.004, 3.162]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5212.geometry}
              material={materials.Grass_C}
              position={[2.936, -0.036, 3.425]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5214.geometry}
              material={materials.Grass_C}
              position={[2.88, -0.042, 3.305]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5216.geometry}
              material={materials.Grass_C}
              position={[2.914, -0.037, 3.354]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5218.geometry}
              material={materials.Grass_C}
              position={[3.032, -0.015, 3.326]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5220.geometry}
              material={materials.Grass_C}
              position={[3.121, 0.003, 3.177]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5222.geometry}
              material={materials.Grass_C}
              position={[3.08, -0.004, 3.146]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5224.geometry}
              material={materials.Grass_C}
              position={[2.531, -0.089, 3.563]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5226.geometry}
              material={materials.Grass_C}
              position={[2.726, -0.067, 3.508]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5228.geometry}
              material={materials.Grass_C}
              position={[2.569, -0.085, 3.564]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5230.geometry}
              material={materials.Grass_C}
              position={[2.741, -0.066, 3.578]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5232.geometry}
              material={materials.Grass_C}
              position={[2.607, -0.081, 3.507]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5234.geometry}
              material={materials.Grass_C}
              position={[2.674, -0.073, 3.479]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5236.geometry}
              material={materials.Grass_C}
              position={[2.591, -0.082, 3.543]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5238.geometry}
              material={materials.Grass_C}
              position={[2.545, -0.088, 3.614]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5240.geometry}
              material={materials.Grass_C}
              position={[2.212, -0.081, 4.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5242.geometry}
              material={materials.Grass_C}
              position={[2.149, -0.08, 3.983]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5244.geometry}
              material={materials.Grass_C}
              position={[2.541, -0.091, 3.937]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5246.geometry}
              material={materials.Grass_C}
              position={[2.342, -0.086, 3.924]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5248.geometry}
              material={materials.Grass_C}
              position={[2.244, -0.082, 4]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5250.geometry}
              material={materials.Grass_C}
              position={[2.187, -0.08, 4.016]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5252.geometry}
              material={materials.Grass_C}
              position={[2.37, -0.085, 4.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5254.geometry}
              material={materials.Grass_C}
              position={[2.302, -0.091, 3.785]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5256.geometry}
              material={materials.Grass_C}
              position={[2.333, -0.093, 3.769]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5258.geometry}
              material={materials.Grass_C}
              position={[2.469, -0.094, 3.761]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5260.geometry}
              material={materials.Grass_C}
              position={[2.416, -0.095, 3.726]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5262.geometry}
              material={materials.Grass_C}
              position={[2.255, -0.085, 3.893]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5264.geometry}
              material={materials.Grass_C}
              position={[1.865, -0.06, 4.116]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5266.geometry}
              material={materials.Grass_C}
              position={[1.807, -0.06, 4.067]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5268.geometry}
              material={materials.Grass_C}
              position={[1.903, -0.071, 3.969]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5270.geometry}
              material={materials.Grass_C}
              position={[1.971, -0.071, 4.013]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5272.geometry}
              material={materials.Grass_C}
              position={[1.949, -0.078, 3.903]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5274.geometry}
              material={materials.Grass_C}
              position={[1.885, -0.072, 3.947]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5276.geometry}
              material={materials.Grass_C}
              position={[1.913, -0.07, 3.985]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5278.geometry}
              material={materials.Grass_C}
              position={[1.746, -0.055, 4.106]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5280.geometry}
              material={materials.Grass_C}
              position={[1.936, -0.067, 4.042]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5282.geometry}
              material={materials.Grass_C}
              position={[1.766, -0.055, 4.127]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5284.geometry}
              material={materials.Grass_C}
              position={[1.705, -0.043, 4.294]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5286.geometry}
              material={materials.Grass_C}
              position={[1.507, -0.042, 4.152]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5288.geometry}
              material={materials.Grass_C}
              position={[1.655, -0.054, 4.052]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5290.geometry}
              material={materials.Grass_C}
              position={[1.529, -0.046, 4.1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5292.geometry}
              material={materials.Grass_C}
              position={[1.534, -0.041, 4.193]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5294.geometry}
              material={materials.Grass_C}
              position={[1.484, -0.042, 4.136]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5296.geometry}
              material={materials.Grass_C}
              position={[1.333, -0.029, 4.237]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5298.geometry}
              material={materials.Grass_C}
              position={[1.322, -0.029, 4.238]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5300.geometry}
              material={materials.Grass_C}
              position={[1.204, -0.023, 4.309]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5302.geometry}
              material={materials.Grass_C}
              position={[1.275, -0.028, 4.231]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5304.geometry}
              material={materials.Grass_C}
              position={[4.592, 0.042, 1.965]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5306.geometry}
              material={materials.Grass_C}
              position={[4.352, 0.108, 2.325]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5308.geometry}
              material={materials.Grass_C}
              position={[4.395, 0.098, 2.271]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5310.geometry}
              material={materials.Grass_C}
              position={[4.055, 0.125, 2.525]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5312.geometry}
              material={materials.Grass_C}
              position={[4.113, 0.109, 2.334]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5314.geometry}
              material={materials.Grass_C}
              position={[2.289, -0.078, 4.26]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5316.geometry}
              material={materials.Grass_C}
              position={[2.377, -0.083, 4.151]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5318.geometry}
              material={materials.Grass_C}
              position={[2.598, -0.093, 3.937]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5320.geometry}
              material={materials.Grass_C}
              position={[2.622, -0.093, 3.954]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5322.geometry}
              material={materials.Grass_C}
              position={[2.364, -0.081, 4.21]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5324.geometry}
              material={materials.Grass_C}
              position={[2.432, -0.086, 4.046]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5326.geometry}
              material={materials.Grass_C}
              position={[1.864, -0.045, 4.47]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5328.geometry}
              material={materials.Grass_C}
              position={[1.971, -0.056, 4.355]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5330.geometry}
              material={materials.Grass_C}
              position={[2.057, -0.061, 4.348]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5332.geometry}
              material={materials.Grass_C}
              position={[1.394, -0.015, 4.587]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5334.geometry}
              material={materials.Grass_C}
              position={[1.382, -0.018, 4.497]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={0.655}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5336.geometry}
              material={materials.material}
              position={[0, -0.1, 0]}
              scale={5}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_5338.geometry}
              material={materials.material_3}
              position={[0, -0.301, 0]}
              scale={4.855}
            />
          </group>
        </group>
      </group>
    </a.group>
  );
}
export default Polyforest;
