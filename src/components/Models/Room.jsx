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

import islandScene from '../assets/tiny_isometric_room.glb';

export function Room({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  // Get access to the Three.js renderer and viewport
  const { gl, viewport, camera } = useThree();
  const { nodes, materials } = useGLTF(islandScene);
  const autoRotation = useRef(0.001 * Math.PI);
  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;

  useEffect(() => {
    camera.position.z = 800;
  }, [camera]);
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

  // Handle keydown events
  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y += 0.015 * Math.PI;
      rotationSpeed.current = 0.087;
    } else if (event.key === 'ArrowRight') {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y -= 0.015 * Math.PI;
      rotationSpeed.current = -0.087;
    }
  }; // Handle touchstart event
  const handleTouchStart = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    const clientX = event.touches[0].clientX;
    lastX.current = clientX;
  };
  // Handle touchend event
  const handleTouchEnd = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  // Handle keyup events
  const handleKeyUp = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      setIsRotating(false);
    }
  };
  // Handle touchmove event
  const handleTouchMove = event => {
    event.stopPropagation();
    event.preventDefault();
    if (isRotating) {
      const clientX = event.touches[0].clientX;
      const sensitivity = event.touches ? 0.005 : 0.01;
      const delta = ((clientX - lastX.current) / viewport.width) * sensitivity;

      islandRef.current.rotation.y += delta * 0.01 * Math.PI;
      lastX.current = clientX;
      rotationSpeed.current = delta * 0.01 * Math.PI;
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
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchmove', handleTouchMove);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating and auto-rotation is enabled, apply auto-rotation

    // ... (previous code)

    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.0001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.y;

      /*
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
        case normalizedRotation >= 1.7 && normalizedRotation <= 2.6:
          setCurrentStage(2);
          break;
        case normalizedRotation >= 3.25 && normalizedRotation <= 4.55:
          setCurrentStage(1);
          break;
        default:
          setCurrentStage(null);
      }
    }
  });
  // {Island 3D model from: https://sketchfab.com/3d-models/foxs-islands-163b68e09fcc47618450150be7785907}
  return (
    <group ref={islandRef} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.bed_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-199, 100, 90]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mattress_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-199, 100, 90]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.desk_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[200, -20, -250]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pouf_legs_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-40, 100, -180]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pouf_seat_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-40, 125, -180]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.cupboards_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[100, 520, -300]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.book_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-270, 474, -260]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.shoe_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-60, 0, -50]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.wardrobe_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[299, 100, -199]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.room_lowpoly_room_material_0.geometry}
        material={materials.room_material}
        position={[0, 300, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.blanket_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[0, 0.959, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pillow_big_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pillow_03_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pillow_02_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.pillow_01_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.plant_big_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[32, 180, -233]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.laptop_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-240, 180, -260]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.sock_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[158.6, 78.06, -165.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.box_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-240, 0, -240]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.toy_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-245.706, 100.171, -196.972]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.plant_small_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-315, 200, -39]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.fan_02_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-153, 200, -320]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.timer_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-319, 215, 29]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.photos_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-99.538, 488.523, -295.392]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.shutter_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[0, 287, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.window_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[0, 300, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.fan_01_lowpoly_equipment_material_0.geometry}
        material={materials.equipment_material}
        position={[-153, 200, -320]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ray_lowpoly_ray_material_0.geometry}
        material={materials.ray_material}
        position={[0, 300, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
    </group>
  );
}
export default Room;