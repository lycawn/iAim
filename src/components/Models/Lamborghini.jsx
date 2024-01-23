import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import porcheScene from '../assets/revuelto.glb';

export function Lamborghini({
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
    camera.position.z = 200;
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
    islandRef.current.rotation.z += delta * 0.0005;

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
      islandRef.current.rotation.z += delta * 0.01 * Math.PI;

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

      islandRef.current.rotation.z += 0.015 * Math.PI;
      rotationSpeed.current = 0.087;
    } else if (event.key === 'ArrowRight') {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.z -= 0.015 * Math.PI;
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

      islandRef.current.rotation.z += delta * 0.01 * Math.PI;
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

      islandRef.current.rotation.z += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.z;

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
        rotation={[-Math.PI / 1, 1, 1]}
        scale={0.578}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_16'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_26'].geometry}
          material={materials.NeroLowGloss}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_18'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_30'].geometry}
          material={materials.NeroLowGloss}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_20'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_5'].geometry}
          material={materials.PelleArancio}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_31'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleNera-material_16'].geometry}
          material={materials.PelleNera}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material'].geometry}
          material={materials.BlackGlossy}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Red-material_2'].geometry}
          material={materials.material}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_33'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material_3'].geometry}
          material={materials.BlackGlossy}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_34'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material_4'].geometry}
          material={materials.BlackGlossy}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material_3'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['SchermoCentrale-material'].geometry}
          material={materials.SchermoCentrale}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_36'].geometry}
          material={materials.NeroLowGloss}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_22'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material_5'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_24'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material_9'].geometry}
          material={materials.BlackGlossy}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_74'].geometry}
          material={materials.NeroLowGloss}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_75'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['CarPaintBlack-material_2'].geometry}
          material={materials.CarPaintBlack}
        />
      </group>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel-material'].geometry}
          material={materials.Wheel}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel_001-material'].geometry}
          material={materials.Wheel_001}
        />
      </group>
      <group
        position={[-0.001, -0.008, 0.006]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel-material_1'].geometry}
          material={materials.Wheel}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel_001-material_1'].geometry}
          material={materials.Wheel_001}
        />
      </group>
      <group
        rotation={[-Math.PI / 2, 0, -Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel-material_2'].geometry}
          material={materials.Wheel}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Wheel_001-material_2'].geometry}
          material={materials.Wheel_001}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material_8'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material_10'].geometry}
          material={materials.BlackGlossy}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material_9'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_79'].geometry}
          material={materials.NeroLowGloss}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_27'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_6'].geometry}
          material={materials.PelleArancio}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarbonFiberMatte-material_12'].geometry}
          material={materials.MAT_CarbonFiberMatte}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_81'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['BlackGlossy-material_11'].geometry}
          material={materials.BlackGlossy}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleNera-material_21'].geometry}
          material={materials.PelleNera}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['SchermoCentrale-material_2'].geometry}
          material={materials.SchermoCentrale}
        />
      </group>
      <group
        position={[0, -0.966, -0.032]}
        rotation={[-0.436, 0, 0]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rubber_base-material'].geometry}
          material={materials.Rubber_base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['t_rims_titanium_matt-material'].geometry}
          material={materials.t_rims_titanium_matt}
        />
      </group>
      <group
        position={[2.786, 0.986, -0.023]}
        rotation={[0.471, 0, -Math.PI]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rubber_base-material_1'].geometry}
          material={materials.Rubber_base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['t_rims_titanium_matt-material_1'].geometry}
          material={materials.t_rims_titanium_matt}
        />
      </group>
      <group
        position={[0, 0.964, -0.032]}
        rotation={[0.436, 0, -Math.PI]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rubber_base-material_2'].geometry}
          material={materials.Rubber_base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['t_rims_titanium_matt-material_2'].geometry}
          material={materials.t_rims_titanium_matt}
        />
      </group>
      <group
        position={[0, 0.964, -0.032]}
        rotation={[0.436, 0, -Math.PI]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['t_rims_titanium_matt-material_6'].geometry}
          material={materials.t_rims_titanium_matt}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rubber_base-material_3'].geometry}
          material={materials.Rubber_base}
        />
      </group>
      <group
        position={[0, -0.966, -0.032]}
        rotation={[-0.436, 0, 0]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['t_rims_titanium_matt-material_7'].geometry}
          material={materials.t_rims_titanium_matt}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rubber_base-material_4'].geometry}
          material={materials.Rubber_base}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_133'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alluminium-material_1'].geometry}
          material={materials.Alluminium}
        />
      </group>
      <group position={[0.001, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleNera-material_22'].geometry}
          material={materials.PelleNera}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_17'].geometry}
          material={materials.PelleArancio}
        />
      </group>
      <group position={[0.001, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_Arancio-material_19'].geometry}
          material={materials.Cuciture_Arancio}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_nere-material_2'].geometry}
          material={materials.Cuciture_nere}
        />
      </group>
      <group position={[0.001, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_nere-material_3'].geometry}
          material={materials.Cuciture_nere}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_Arancio-material_20'].geometry}
          material={materials.Cuciture_Arancio}
        />
      </group>
      <group position={[0.001, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_Arancio-material_21'].geometry}
          material={materials.Cuciture_Arancio}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Cuciture_nere-material_5'].geometry}
          material={materials.Cuciture_nere}
        />
      </group>
      <group position={[0.001, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleNera-material_23'].geometry}
          material={materials.PelleNera}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_18'].geometry}
          material={materials.PelleArancio}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alluminium_001-material'].geometry}
          material={materials.Alluminium_001}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['CarPaintBlack-material_25'].geometry}
          material={materials.CarPaintBlack}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['CarPaintBlack-material_31'].geometry}
          material={materials.CarPaintBlack}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alluminium-material_2'].geometry}
          material={materials.Alluminium}
        />
      </group>
      <group rotation={[0, 0, -1.553]} scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_40'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_20'].geometry}
          material={materials.PelleArancio}
        />
      </group>
      <group rotation={[0, 0, -1.553]} scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Alcantara-material_41'].geometry}
          material={materials.Alcantara}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['PelleArancio-material_21'].geometry}
          material={materials.PelleArancio}
        />
      </group>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarpaintMain-material_9'].geometry}
          material={materials.MAT_CarpaintMain}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['CarPaintBlack-material_162'].geometry}
          material={materials.CarPaintBlack}
        />
      </group>
      <group
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_259'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Color__000000ff_001-material_2'].geometry}
          material={materials.Color__000000ff_001}
        />
      </group>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['NeroLowGloss-material_260'].geometry}
          material={materials.NeroLowGloss}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Color__000000ff_001-material_3'].geometry}
          material={materials.Color__000000ff_001}
        />
      </group>
      <group scale={0.001}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarpaintMain-material_21'].geometry}
          material={materials.MAT_CarpaintMain}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarpaintMain-material_22'].geometry}
          material={materials.MAT_CarpaintMain}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarpaintMain-material_23'].geometry}
          material={materials.MAT_CarpaintMain}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['MAT_CarpaintMain-material_24'].geometry}
          material={materials.MAT_CarpaintMain}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_1'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_1'].geometry}
        material={materials.CarPaintBlack}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_1'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_2'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_3'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_4'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_5'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_6'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_7'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_8'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_9'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_10'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_11'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_12'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_13'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Red-material'].geometry}
        material={materials.material}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Red-material_1'].geometry}
        material={materials.material}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_2'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_3'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_1'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_2'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_3'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_4'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_5'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_6'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_7'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_4'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_5'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_6'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_7'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_8'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_9'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_14'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_15'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_1'].geometry}
        material={materials.PelleArancio}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_2'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_3'].geometry}
        material={materials.PelleArancio}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_8'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_9'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_10'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_11'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_12'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_13'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_14'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_15'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['LogoLamboArancio-material'].geometry}
        material={materials.LogoLamboArancio}
        position={[0.002, 0, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['LogoLamboArancio-material_1'].geometry}
        material={materials.LogoLamboArancio}
        position={[0.002, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_16'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_17'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_10'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_18'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_19'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_20'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_21'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_22'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_23'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_24'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_25'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_11'].geometry}
        material={materials.Alcantara}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_12'].geometry}
        material={materials.Alcantara}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_13'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_14'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_15'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_4'].geometry}
        material={materials.PelleArancio}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_27'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_28'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_29'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_17'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_19'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material'].geometry}
        material={materials.Cuciture_Arancio}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_1'].geometry}
        material={materials.BlackGlossy}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_2'].geometry}
        material={materials.BlackGlossy}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_1'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_32'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_2'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_35'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_21'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_37'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_38'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_39'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_40'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_41'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_5'].geometry}
        material={materials.BlackGlossy}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_6'].geometry}
        material={materials.BlackGlossy}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['SchermoCentrale-material_1'].geometry}
        material={materials.SchermoCentrale}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_17'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_18'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BadgeMat-material'].geometry}
        material={materials.BadgeMat}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_42'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_4'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_43'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_44'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_45'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_46'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_47'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_48'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_49'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_50'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_51'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_52'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_53'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_19'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_54'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_23'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_55'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_20'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_56'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_57'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_58'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_59'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_60'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_61'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_7'].geometry}
        material={materials.BlackGlossy}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_62'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_63'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_64'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_65'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Red-material_3'].geometry}
        material={materials.material}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_66'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_6'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_67'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_68'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_69'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_70'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_8'].geometry}
        material={materials.BlackGlossy}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_71'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_72'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_7'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_73'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alluminium-material'].geometry}
        material={materials.Alluminium}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_25'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_76'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_77'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Wheel_001-material_3'].geometry}
        material={materials.Wheel_001}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_78'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_26'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_10'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_80'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_11'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia_004-material'].geometry}
        material={materials.Griglia_004}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia_004-material_1'].geometry}
        material={materials.Griglia_004}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_28'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_82'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_3'].geometry}
        material={materials.CarPaintBlack}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_29'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_30'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_4'].geometry}
        material={materials.CarPaintBlack}
        position={[5.564, -0.024, 0]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_5'].geometry}
        material={materials.CarPaintBlack}
        position={[0, 0.019, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['ext_logo_dark-material'].geometry}
        material={materials.ext_logo_dark}
        position={[5.564, 0.016, 0.001]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['ext_logo_dark-material_1'].geometry}
        material={materials.ext_logo_dark}
        position={[0, -0.021, 0.001]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_black_shiny-material'].geometry}
        material={materials.t_rims_black_shiny}
        position={[0, -0.021, 0.001]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_black_shiny-material_1'].geometry}
        material={materials.t_rims_black_shiny}
        position={[5.564, 0.016, 0.001]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_6'].geometry}
        material={materials.CarPaintBlack}
        position={[2.779, -0.888, 0.238]}
        rotation={[1.545, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_7'].geometry}
        material={materials.CarPaintBlack}
        position={[2.785, 0.883, 0.238]}
        rotation={[-1.545, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_8'].geometry}
        material={materials.CarPaintBlack}
        position={[2.779, -0.888, 0.238]}
        rotation={[1.545, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_9'].geometry}
        material={materials.CarPaintBlack}
        position={[2.785, 0.883, 0.238]}
        rotation={[-1.545, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_10'].geometry}
        material={materials.CarPaintBlack}
        position={[0, -0.002, 0]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_11'].geometry}
        material={materials.CarPaintBlack}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['ext_logo_dark-material_2'].geometry}
        material={materials.ext_logo_dark}
        position={[0, -0.024, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['ext_logo_dark-material_3'].geometry}
        material={materials.ext_logo_dark}
        position={[0, 0.022, 0]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_black_shiny-material_2'].geometry}
        material={materials.t_rims_black_shiny}
        position={[0, -0.024, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_black_shiny-material_3'].geometry}
        material={materials.t_rims_black_shiny}
        position={[0, 0.022, 0]}
        rotation={[0, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_titanium_matt-material_3'].geometry}
        material={materials.t_rims_titanium_matt}
        position={[2.778, -0.99, -0.023]}
        rotation={[-0.471, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_titanium_matt-material_4'].geometry}
        material={materials.t_rims_titanium_matt}
        position={[0, -0.966, -0.032]}
        rotation={[-0.436, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['t_rims_titanium_matt-material_5'].geometry}
        material={materials.t_rims_titanium_matt}
        position={[0, 0.964, -0.032]}
        rotation={[0.436, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_12'].geometry}
        material={materials.CarPaintBlack}
        position={[0, 0.862, 0.218]}
        rotation={[-1.553, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_13'].geometry}
        material={materials.CarPaintBlack}
        position={[0, -0.864, 0.218]}
        rotation={[1.553, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_14'].geometry}
        material={materials.CarPaintBlack}
        position={[0, 0.862, 0.218]}
        rotation={[-1.553, 0, 0]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_15'].geometry}
        material={materials.CarPaintBlack}
        position={[0, -0.864, 0.218]}
        rotation={[1.553, 0, -Math.PI]}
        scale={0.01}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_16'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_17'].geometry}
        material={materials.CarPaintBlack}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_83'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_84'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_85'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_86'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_87'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_88'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_89'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_90'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_91'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_92'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_93'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_94'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_95'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_96'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_97'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_98'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_99'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_100'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_101'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_102'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_103'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_104'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_105'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_106'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_107'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_108'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_109'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_110'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_111'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_112'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_113'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_114'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_115'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_116'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_117'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_118'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_119'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_120'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_121'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_122'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_123'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_124'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_125'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_126'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_127'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_128'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_129'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_130'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_131'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_132'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_134'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_135'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_136'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_137'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_138'].geometry}
        material={materials.NeroLowGloss}
        rotation={[0, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_139'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_140'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_141'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_142'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_143'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_144'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_145'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_31'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_146'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_147'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_148'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_149'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_150'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_151'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_152'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_32'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_33'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_34'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_35'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_153'].geometry}
        material={materials.NeroLowGloss}
        position={[3.615, -0.003, 0.306]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.094, 0.444, 0.444]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_36'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_18'].geometry}
        material={materials.CarPaintBlack}
        position={[3.51, 0, 0.684]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.08, 0.394, 0.116]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_154'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_155'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_156'].geometry}
        material={materials.NeroLowGloss}
        position={[0.507, 0.876, 0.238]}
        rotation={[Math.PI, -Math.PI / 2, 0]}
        scale={[-0.065, 0.065, 0.065]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_157'].geometry}
        material={materials.NeroLowGloss}
        position={[0.507, -0.876, 0.238]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.065}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_158'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_159'].geometry}
        material={materials.NeroLowGloss}
        position={[-0.435, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material'].geometry}
        material={materials.MAT_CarpaintMain}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_1'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_2'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_7'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_8'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_3'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_4'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_9'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_5'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_10'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['AlcantaraForato-material'].geometry}
        material={materials.AlcantaraForato}
        position={[-0.001, 0, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_6'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_11'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_7'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_8'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_9'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_10'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_12'].geometry}
        material={materials.PelleArancio}
        rotation={[0, 0, -Math.PI]}
        scale={[-1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_13'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_11'].geometry}
        material={materials.Cuciture_Arancio}
        rotation={[0, 0, -Math.PI]}
        scale={[-1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_12'].geometry}
        material={materials.Cuciture_Arancio}
        rotation={[0, 0, -Math.PI]}
        scale={[-1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_14'].geometry}
        material={materials.PelleArancio}
        rotation={[0, 0, -Math.PI]}
        scale={[-1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_13'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_14'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_15'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['AlcantaraForato-material_1'].geometry}
        material={materials.AlcantaraForato}
        position={[-0.001, 0, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_15'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_16'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_16'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_160'].geometry}
        material={materials.NeroLowGloss}
        position={[2.453, 0, 0.023]}
        scale={[1, 0.952, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_17'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['AlcantaraForato-material_2'].geometry}
        material={materials.AlcantaraForato}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_18'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['InteriorMaterial-material'].geometry}
        material={materials.InteriorMaterial}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_37'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_12'].geometry}
        material={materials.BlackGlossy}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_19'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_20'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_21'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_22'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_23'].geometry}
        material={materials.CarPaintBlack}
        rotation={[0, 0, -Math.PI]}
        scale={[-1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_nere-material'].geometry}
        material={materials.Cuciture_nere}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_nere-material_1'].geometry}
        material={materials.Cuciture_nere}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_nere-material_4'].geometry}
        material={materials.Cuciture_nere}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_24'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material'].geometry}
        material={materials.Griglia}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material_1'].geometry}
        material={materials.Griglia}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_161'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Pattern2-material'].geometry}
        material={materials.Pattern2}
        position={[-0.001, 0, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Pattern1-material'].geometry}
        material={materials.Pattern1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['AlcantaraForato-material_3'].geometry}
        material={materials.AlcantaraForato}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material_2'].geometry}
        material={materials.Griglia}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_nere-material_6'].geometry}
        material={materials.Cuciture_nere}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_22'].geometry}
        material={materials.Cuciture_Arancio}
        position={[0, 0, 0.002]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_23'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleArancio-material_19'].geometry}
        material={materials.PelleArancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_24'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_24'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_25'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_162'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_163'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MicrosoftTeams_image-material'].geometry}
        material={materials.MicrosoftTeams_image}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MicrosoftTeams_image-material_1'].geometry}
        material={materials.MicrosoftTeams_image}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_164'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_26'].geometry}
        material={materials.CarPaintBlack}
        position={[1.259, -0.17, -0.118]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_27'].geometry}
        material={materials.CarPaintBlack}
        position={[1.259, 0.176, -0.118]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Bianco-material'].geometry}
        material={materials.Bianco}
        position={[1.288, -0.039, -0.158]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_28'].geometry}
        material={materials.CarPaintBlack}
        position={[1.288, -0.039, -0.158]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Bianco-material_1'].geometry}
        material={materials.Bianco}
        position={[1.259, -0.17, -0.118]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Bianco-material_2'].geometry}
        material={materials.Bianco}
        position={[1.259, 0.176, -0.118]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_29'].geometry}
        material={materials.CarPaintBlack}
        position={[1.288, 0.031, -0.158]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Bianco-material_3'].geometry}
        material={materials.Bianco}
        position={[1.288, 0.031, -0.158]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_30'].geometry}
        material={materials.CarPaintBlack}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_38'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_39'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Red-material_4'].geometry}
        material={materials.material}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_165'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_42'].geometry}
        material={materials.Alcantara}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_32'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_33'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_34'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_35'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_36'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_37'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_38'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_39'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_40'].geometry}
        material={materials.CarPaintBlack}
        position={[-0.001, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_41'].geometry}
        material={materials.CarPaintBlack}
        position={[-0.001, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_42'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_43'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_44'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_166'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_167'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_45'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_46'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_47'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_48'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_49'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_50'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_51'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_52'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_53'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_54'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_55'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_56'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_57'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_58'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_59'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_60'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_61'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_62'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_63'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_64'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_65'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_66'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_67'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_68'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_69'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_70'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_71'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_72'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_73'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_74'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_168'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_75'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Color__000000ff_001-material'].geometry}
        material={materials.Color__000000ff_001}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Color__000000ff_001-material_1'].geometry}
        material={materials.Color__000000ff_001}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_76'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_77'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_78'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_79'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_169'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_170'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_171'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_172'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_173'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_174'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_175'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_176'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_177'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_178'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_80'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_81'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_82'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_83'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_84'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_85'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_179'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_180'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_86'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_87'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_88'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_89'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_90'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_91'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_92'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_93'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_94'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_181'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_95'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_96'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_97'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_98'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_182'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_183'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_184'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_185'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_99'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_186'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_187'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_188'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_189'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_190'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_191'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_192'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_193'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_194'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_195'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_196'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_100'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_101'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_197'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_43'].geometry}
        material={materials.Alcantara}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_102'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_103'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_104'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_105'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_106'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_107'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_108'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_109'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_110'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_111'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_112'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_113'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_1'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_114'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_115'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_116'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_117'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_118'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_2'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_119'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_120'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_121'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_122'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_123'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_124'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_198'].geometry}
        material={materials.NeroLowGloss}
        position={[0, 0, -0.002]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_125'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_199'].geometry}
        material={materials.NeroLowGloss}
        position={[0, 0, 0.011]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_3'].geometry}
        material={materials.Vetro}
        position={[0, 0.004, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_200'].geometry}
        material={materials.NeroLowGloss}
        position={[0, 0, 0.011]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_4'].geometry}
        material={materials.Vetro}
        position={[0, -0.004, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_201'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_202'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_1'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_203'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_2'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_204'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_205'].geometry}
        material={materials.NeroLowGloss}
        position={[0, 0, -0.004]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_126'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_206'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_207'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_208'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_127'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_209'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_210'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_211'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_128'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_129'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_130'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_131'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_132'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_133'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_134'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_135'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_136'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_13'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_14'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_137'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_138'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_139'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_3'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_140'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_141'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_142'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_15'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_16'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_17'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_18'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_143'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_144'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BadgeMat-material_1'].geometry}
        material={materials.BadgeMat}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_4'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_145'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Cuciture_Arancio-material_26'].geometry}
        material={materials.Cuciture_Arancio}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia04-material'].geometry}
        material={materials.Griglia04}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_146'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_19'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_20'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_21'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_22'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_23'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_147'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_148'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia04-material_1'].geometry}
        material={materials.Griglia04}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_24'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_25'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_5'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_212'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_213'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_214'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_215'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_6'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_216'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_217'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_218'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_219'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_220'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_221'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_222'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_223'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_224'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_149'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_150'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_151'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_225'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_152'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_153'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_154'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_26'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_155'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_156'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_27'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_157'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_28'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_29'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_158'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_159'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_160'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_161'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_7'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_8'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_13'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_14'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_10'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_11'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_163'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_164'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_165'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_166'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_167'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_168'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_169'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_170'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_171'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_5'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_6'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_172'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_7'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_173'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_8'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_30'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_31'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_32'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_33'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_34'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_35'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_36'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_12'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_13'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_174'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_9'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_14'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_37'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material_3'].geometry}
        material={materials.Griglia}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material_4'].geometry}
        material={materials.Griglia}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_38'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_15'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_16'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_17'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_15'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_175'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_10'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_176'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_177'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_11'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_12'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_178'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack_002-material'].geometry}
        material={materials.CarPaintBlack_002}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack_002-material_1'].geometry}
        material={materials.CarPaintBlack_002}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_179'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_180'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_181'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_39'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_182'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_16'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_226'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_227'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_228'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_229'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_230'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_40'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_41'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_231'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_183'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_17'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_184'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_185'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_186'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_187'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_188'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_189'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_190'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_191'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_192'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_193'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_194'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_195'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_196'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_197'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_198'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_199'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_200'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_201'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_202'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_203'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_204'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_205'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_206'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_207'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_232'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_233'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_234'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_235'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_236'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_237'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_238'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_239'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_240'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_241'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_242'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_243'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_244'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_245'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_246'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_247'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_18'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_208'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_209'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_248'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_13'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_14'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_15'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_249'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_16'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_19'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_17'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_18'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_250'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_251'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_252'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_253'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_19'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_20'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_254'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_21'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_22'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_255'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_20'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_23'].geometry}
        material={materials.Vetro}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_24'].geometry}
        material={materials.Vetro}
        position={[0.002, -0.003, -0.001]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_256'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_257'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_258'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_25'].geometry}
        material={materials.Vetro}
        position={[0, 0, 0.008]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_42'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_18'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_21'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BlackGlossy-material_22'].geometry}
        material={materials.BlackGlossy}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_210'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_211'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Griglia-material_5'].geometry}
        material={materials.Griglia}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_212'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_213'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_214'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_215'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_216'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_217'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_43'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_218'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_219'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_44'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_220'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_221'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_19'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_45'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarpaintMain-material_20'].geometry}
        material={materials.MAT_CarpaintMain}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_46'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Vetro-material_26'].geometry}
        material={materials.Vetro}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_261'].geometry}
        material={materials.NeroLowGloss}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material'].geometry}
        material={materials.Light}
        position={[0, 0.003, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material_1'].geometry}
        material={materials.Light}
        position={[0, -0.002, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material_2'].geometry}
        material={materials.Light}
        position={[0, 0.003, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['BadgeMat-material_2'].geometry}
        material={materials.BadgeMat}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material_3'].geometry}
        material={materials.Light}
        position={[0, 0, 0.002]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material_4'].geometry}
        material={materials.Light}
        position={[0, 0, 0.002]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['MAT_CarbonFiberMatte-material_47'].geometry}
        material={materials.MAT_CarbonFiberMatte}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_222'].geometry}
        material={materials.CarPaintBlack}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_223'].geometry}
        material={materials.CarPaintBlack}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-0.001, 0.001, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_224'].geometry}
        material={materials.CarPaintBlack}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Light-material_5'].geometry}
        material={materials.Light}
        position={[-0.005, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_262'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_263'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_264'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_265'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_225'].geometry}
        material={materials.CarPaintBlack}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['CarPaintBlack-material_226'].geometry}
        material={materials.CarPaintBlack}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alluminium-material_3'].geometry}
        material={materials.Alluminium}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_266'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_267'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_268'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_269'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_270'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_271'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_272'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_44'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_45'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_46'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_47'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_48'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_49'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_25'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_26'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_50'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_51'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_52'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_53'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_54'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_55'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_27'].geometry}
        material={materials.PelleNera}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['PelleNera-material_28'].geometry}
        material={materials.PelleNera}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_56'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_57'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_58'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_59'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_273'].geometry}
        material={materials.NeroLowGloss}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['NeroLowGloss-material_274'].geometry}
        material={materials.NeroLowGloss}
        scale={0.001}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_60'].geometry}
        material={materials.Alcantara}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Alcantara-material_61'].geometry}
        material={materials.Alcantara}
        scale={0.001}
      />
    </group>
  );
}
export default Lamborghini;
