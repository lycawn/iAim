import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import porcheScene from '../assets/carrera-4s.glb';

export function Porche({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  // Get access to the Three.js renderer and viewport
  const { gl, viewport, camera } = useThree();
  const { nodes, materials } = useGLTF(porcheScene);
  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;
  const { scene, animations } = useGLTF(porcheScene);

  // Get access to the animations for the bird
  const { actions } = useAnimations(animations, islandRef);
  useEffect(() => {
    camera.position.z = 180;
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
  const handleMouseWheel = event => {
    event.preventDefault();
    event.stopPropagation();

    const delta = event.deltaY;

    // Adjust the rotation based on the mouse wheel movement
    islandRef.current.rotation.y += delta * 0.0005;

    // Update the rotation speed
    rotationSpeed.current = delta * 0.0005;

    // Set rotating to true to keep the rotation going
    setIsRotating(true);
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
    canvas.addEventListener('wheel', handleMouseWheel);

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
      canvas.removeEventListener('wheel', handleMouseWheel);
    };
  }, [
    gl,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleMouseWheel,
  ]);

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
  return (
    <group ref={islandRef} {...props} dispose={null}>
      <group
        position={[-0.015, -0.009, 0.063]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.578}
      >
        <group position={[0, -0.003, 0.007]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.windshield_0.geometry}
            material={materials.window}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.windshield_1.geometry}
            material={materials.plastic}
          />
        </group>
        <group position={[0, 0, 0.029]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder000_0.geometry}
            material={materials.silver}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder000_1.geometry}
            material={materials.plastic}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder000_2.geometry}
            material={materials.rubber}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder000_3.geometry}
            material={materials['Material.001']}
          />
        </group>
        <group position={[0, 0, 0.029]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001_0.geometry}
            material={materials.silver}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001_1.geometry}
            material={materials.plastic}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001_2.geometry}
            material={materials.rubber}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001_3.geometry}
            material={materials['Material.001']}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.window_rear_0.geometry}
          material={materials.window}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane002_0.geometry}
          material={materials.paint}
          position={[-1.053, 3.51, -0.126]}
          rotation={[-1.439, -0.62, 0.775]}
          scale={0.024}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane003_0.geometry}
          material={materials.paint}
          position={[0.436, 3.723, -0.117]}
          rotation={[-1.483, 0.105, 0.803]}
          scale={0.024}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane004_0.geometry}
          material={materials.paint}
          position={[-0.488, 3.684, -0.328]}
          rotation={[-1.415, -0.045, 0.802]}
          scale={0.059}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot_0.geometry}
          material={materials.full_black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.underbody_0.geometry}
          material={materials.full_black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane_0.geometry}
          material={materials.Material}
          position={[0, 0, -1.054]}
          scale={[6.953, 9.785, 7.496]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_0.geometry}
          material={materials.plastic}
          position={[0.036, -1.56, 0.333]}
          rotation={[0.709, -0.071, -0.245]}
          scale={[0.014, 0.014, 0.012]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front004_0.geometry}
          material={materials.silver}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front004_1.geometry}
          material={materials.lights}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front004_2.geometry}
          material={materials.plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front007_0.geometry}
          material={materials.glass}
          rotation={[-0.006, 0, 0]}
          scale={1.036}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front009_0.geometry}
          material={materials.tex_shiny}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front001_0.geometry}
          material={materials.plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front001_1.geometry}
          material={materials.silver}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front001_2.geometry}
          material={materials.lights}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front003_0.geometry}
          material={materials.plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bumper_front003_1.geometry}
          material={materials.glass}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot001_0.geometry}
          material={materials.paint}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot002_0.geometry}
          material={materials.paint}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane001_0.geometry}
          material={materials.tex_shiny}
          position={[0.005, 3.581, 0.107]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot003_0.geometry}
          material={materials.tex_shiny}
          position={[0, 0.003, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot004_0.geometry}
          material={materials.window}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot005_0.geometry}
          material={materials.paint}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot006_0.geometry}
          material={materials.full_black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.window_rear001_0.geometry}
          material={materials.full_black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot007_0.geometry}
          material={materials.logo}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane005_0.geometry}
          material={materials.license}
          position={[0, 3.704, -0.292]}
          rotation={[0.114, 0, 0]}
          scale={[0.393, 0.393, 0.356]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane006_0.geometry}
          material={materials.license}
          position={[0, -3.75, -0.432]}
          rotation={[0.082, 0, Math.PI]}
          scale={[0.395, 0.395, 0.357]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot008_0.geometry}
          material={materials.paint}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot009_0.geometry}
          material={materials.silver}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot010_0.geometry}
          material={materials.plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot011_0.geometry}
          material={materials.coat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.boot011_0_1.geometry}
          material={materials.coat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_0.geometry}
          material={materials.full_black}
          scale={[0.332, 0.318, 0.318]}
        />
      </group>
    </group>
  );
}
export default Porche;
