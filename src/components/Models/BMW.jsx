import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import porcheScene from '../assets/bmw.glb';

export function BMW({
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
    camera.position.z = 480;
    actions['explode'].play();
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
        name="Sketchfab_model"
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ name: 'Sketchfab_model' }}
      >
        <group
          name="3e4b27ffbea1449eab3ddd5f52827874fbx"
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.025}
          userData={{ name: '3e4b27ffbea1449eab3ddd5f52827874.fbx' }}
        >
          <group name="Object_2" userData={{ name: 'Object_2' }}>
            <group name="RootNode" userData={{ name: 'RootNode' }}>
              <group
                name="Body"
                position={[26.5, 42.029, 0.971]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'Body' }}
              >
                <group
                  name="Object_5"
                  position={[-32.707, -9.228, 10.316]}
                  userData={{ name: 'Object_5' }}
                >
                  <mesh
                    name="Body_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'Body_Material #692_0' }}
                  />
                  <mesh
                    name="Body_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'Body_Material #694_0' }}
                  />
                  <mesh
                    name="Body_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Body_Material #697_0' }}
                  />
                  <mesh
                    name="Body_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'Body_Material #698_0' }}
                  />
                  <mesh
                    name="Body_Material_#695_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#695_0'].geometry}
                    material={materials.Material_695}
                    userData={{ name: 'Body_Material #695_0' }}
                  />
                  <mesh
                    name="Body_Material_#696_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#696_0'].geometry}
                    material={materials.Material_696}
                    userData={{ name: 'Body_Material #696_0' }}
                  />
                  <mesh
                    name="Body_Material_#701_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#701_0'].geometry}
                    material={materials.Material_701}
                    userData={{ name: 'Body_Material #701_0' }}
                  />
                  <mesh
                    name="Body_Material_#699_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#699_0'].geometry}
                    material={materials.Material_699}
                    userData={{ name: 'Body_Material #699_0' }}
                  />
                  <mesh
                    name="Body_Material_#700_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body_Material_#700_0'].geometry}
                    material={materials.Material_700}
                    userData={{ name: 'Body_Material #700_0' }}
                  />
                </group>
              </group>
              <group
                name="headlight"
                position={[35.928, 37.016, 112.651]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'headlight' }}
              >
                <group
                  name="Object_16"
                  position={[11.262, -7.254, 6.604]}
                  userData={{ name: 'Object_16' }}
                >
                  <mesh
                    name="headlight_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['headlight_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'headlight_Material #706_0' }}
                  />
                  <mesh
                    name="headlight_Material_#701_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['headlight_Material_#701_0'].geometry}
                    material={materials.Material_701}
                    userData={{ name: 'headlight_Material #701_0' }}
                  />
                  <mesh
                    name="headlight_Material_#707_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['headlight_Material_#707_0'].geometry}
                    material={materials.Material_707}
                    userData={{ name: 'headlight_Material #707_0' }}
                  />
                  <mesh
                    name="headlight_Material_#708_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['headlight_Material_#708_0'].geometry}
                    material={materials.Material_708}
                    userData={{ name: 'headlight_Material #708_0' }}
                  />
                </group>
              </group>
              <group
                name="glsslight"
                position={[42.072, 36.135, 110.235]}
                scale={[2.54, 2.54, 3.193]}
                userData={{ name: 'glsslight' }}
              >
                <mesh
                  name="glsslight_Material_#161_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight_Material_#161_0'].geometry}
                  material={materials.Material_161}
                  userData={{ name: 'glsslight_Material #161_0' }}
                />
                <mesh
                  name="glsslight_Material_#718_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight_Material_#718_0'].geometry}
                  material={materials.Material_718}
                  userData={{ name: 'glsslight_Material #718_0' }}
                />
                <mesh
                  name="glsslight_Material_#717_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight_Material_#717_0'].geometry}
                  material={materials.Material_717}
                  userData={{ name: 'glsslight_Material #717_0' }}
                />
                <mesh
                  name="glsslight_Material_#716_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight_Material_#716_0'].geometry}
                  material={materials.Material_716}
                  userData={{ name: 'glsslight_Material #716_0' }}
                />
              </group>
              <group
                name="glsslight001"
                position={[32.119, 35.13, 116.369]}
                scale={[2.351, 2.414, 3.193]}
                userData={{ name: 'glsslight001' }}
              >
                <mesh
                  name="glsslight001_Material_#161_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight001_Material_#161_0'].geometry}
                  material={materials.Material_161}
                  userData={{ name: 'glsslight001_Material #161_0' }}
                />
                <mesh
                  name="glsslight001_Material_#718_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight001_Material_#718_0'].geometry}
                  material={materials.Material_718}
                  userData={{ name: 'glsslight001_Material #718_0' }}
                />
                <mesh
                  name="glsslight001_Material_#717_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight001_Material_#717_0'].geometry}
                  material={materials.Material_717}
                  userData={{ name: 'glsslight001_Material #717_0' }}
                />
                <mesh
                  name="glsslight001_Material_#716_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['glsslight001_Material_#716_0'].geometry}
                  material={materials.Material_716}
                  userData={{ name: 'glsslight001_Material #716_0' }}
                />
              </group>
              <group
                name="bottom"
                position={[0.104, 23.42, 2.101]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'bottom' }}
              >
                <group
                  name="Object_32"
                  position={[-32.262, -1.901, 20.708]}
                  userData={{ name: 'Object_32' }}
                >
                  <mesh
                    name="bottom_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bottom_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'bottom_Material #706_0' }}
                  />
                  <mesh
                    name="bottom_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bottom_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'bottom_Material #697_0' }}
                  />
                </group>
              </group>
              <group
                name="tail"
                position={[30.736, 46.546, -109.43]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'tail' }}
              >
                <group
                  name="Object_36"
                  position={[-76.172, -11.006, 8.648]}
                  userData={{ name: 'Object_36' }}
                >
                  <mesh
                    name="tail_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tail_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'tail_Material #694_0' }}
                  />
                  <mesh
                    name="tail_Material_#279_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tail_Material_#279_0'].geometry}
                    material={materials.Material_279}
                    userData={{ name: 'tail_Material #279_0' }}
                  />
                </group>
              </group>
              <group
                name="tailpiece"
                position={[0.069, 46.375, -109.106]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={[2.468, 2.468, 2.565]}
                userData={{ name: 'tailpiece' }}
              >
                <group
                  name="Object_40"
                  position={[-14.595, 0.031, 5.029]}
                  userData={{ name: 'Object_40' }}
                >
                  <mesh
                    name="tailpiece_Material_#739_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#739_0'].geometry}
                    material={materials.Material_739}
                    userData={{ name: 'tailpiece_Material #739_0' }}
                  />
                  <mesh
                    name="tailpiece_Material_#738_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#738_0'].geometry}
                    material={materials.Material_738}
                    userData={{ name: 'tailpiece_Material #738_0' }}
                  />
                  <mesh
                    name="tailpiece_Material_#701_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#701_0'].geometry}
                    material={materials.Material_701}
                    userData={{ name: 'tailpiece_Material #701_0' }}
                  />
                  <mesh
                    name="tailpiece_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'tailpiece_Material #697_0' }}
                  />
                  <mesh
                    name="tailpiece_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'tailpiece_Material #717_0' }}
                  />
                  <mesh
                    name="tailpiece_Material_#740_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailpiece_Material_#740_0'].geometry}
                    material={materials.Material_740}
                    userData={{ name: 'tailpiece_Material #740_0' }}
                  />
                </group>
              </group>
              <group
                name="tire07"
                position={[43.303, 18.508, 83.787]}
                rotation={[0, 1.222, 0]}
                scale={[2.54, 2.54, 3.446]}
                userData={{ name: 'tire07' }}
              >
                <group
                  name="Object_48"
                  position={[0, 0, 2.365]}
                  userData={{ name: 'Object_48' }}
                >
                  <mesh
                    name="tire07_Material_#751_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire07_Material_#751_0'].geometry}
                    material={materials.Material_751}
                    userData={{ name: 'tire07_Material #751_0' }}
                  />
                  <mesh
                    name="tire07_Material_#752_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire07_Material_#752_0'].geometry}
                    material={materials.Material_752}
                    userData={{ name: 'tire07_Material #752_0' }}
                  />
                </group>
              </group>
              <group
                name="Rim"
                position={[43.669, 18.508, 83.921]}
                rotation={[0, 1.222, 0]}
                scale={[2.636, 2.636, 2.516]}
                userData={{ name: 'Rim' }}
              >
                <group
                  name="Object_52"
                  position={[0.094, -5.477, 2.787]}
                  userData={{ name: 'Object_52' }}
                >
                  <mesh
                    name="Rim_Material_#753_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Rim_Material_#753_0'].geometry}
                    material={materials.Material_753}
                    userData={{ name: 'Rim_Material #753_0' }}
                  />
                </group>
              </group>
              <group
                name="tire06"
                position={[46.944, 18.724, 85.109]}
                rotation={[0, 1.222, 0]}
                scale={[4.077, 4.077, 3.891]}
                userData={{ name: 'tire06' }}
              >
                <group
                  name="Object_55"
                  position={[0.466, -0.656, -0.008]}
                  userData={{ name: 'Object_55' }}
                >
                  <mesh
                    name="tire06_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire06_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'tire06_Material #694_0' }}
                  />
                  <mesh
                    name="tire06_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire06_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'tire06_Material #697_0' }}
                  />
                  <mesh
                    name="tire06_Material_#362_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire06_Material_#362_0'].geometry}
                    material={materials.Material_362}
                    userData={{ name: 'tire06_Material #362_0' }}
                  />
                </group>
              </group>
              <group
                name="brake_disc"
                position={[41.047, 18.497, 82.957]}
                rotation={[0, 1.222, 0]}
                scale={[2.661, 2.661, 0.569]}
                userData={{ name: 'brake disc' }}
              >
                <group
                  name="Object_60"
                  position={[0, 0, 2.886]}
                  userData={{ name: 'Object_60' }}
                >
                  <mesh
                    name="brake_disc_Material_#408_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc_Material_#408_0'].geometry}
                    material={materials.Material_408}
                    userData={{ name: 'brake disc_Material #408_0' }}
                  />
                  <mesh
                    name="brake_disc_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'brake disc_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="Brake"
                position={[47.198, 15.683, 76.036]}
                rotation={[0, 1.222, 2.892]}
                scale={[1.683, 1.683, 1.708]}
                userData={{ name: 'Brake' }}
              >
                <group
                  name="Object_64"
                  position={[0.826, 0.024, -4.271]}
                  userData={{ name: 'Object_64' }}
                >
                  <mesh
                    name="Brake_Material_#773_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake_Material_#773_0'].geometry}
                    material={materials.Material_773}
                    userData={{ name: 'Brake_Material #773_0' }}
                  />
                  <mesh
                    name="Brake_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Brake_Material #697_0' }}
                  />
                  <mesh
                    name="Brake_Material_#774_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake_Material_#774_0'].geometry}
                    material={materials.Material_774}
                    userData={{ name: 'Brake_Material #774_0' }}
                  />
                </group>
              </group>
              <group
                name="headglass"
                position={[0.033, 36.963, 112.743]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'headglass' }}
              >
                <group
                  name="Object_69"
                  position={[11.298, -7.233, 20.736]}
                  userData={{ name: 'Object_69' }}
                >
                  <mesh
                    name="headglass_Material_#775_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['headglass_Material_#775_0'].geometry}
                    material={materials.Material_775}
                    userData={{ name: 'headglass_Material #775_0' }}
                  />
                </group>
              </group>
              <group
                name="tailglass"
                position={[30.643, 46.528, -109.384]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'tailglass' }}
              >
                <group
                  name="Object_72"
                  position={[-76.154, -10.999, 8.685]}
                  userData={{ name: 'Object_72' }}
                >
                  <mesh
                    name="tailglass_Material_#775_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tailglass_Material_#775_0'].geometry}
                    material={materials.Material_775}
                    userData={{ name: 'tailglass_Material #775_0' }}
                  />
                </group>
              </group>
              <group
                name="laseralumobj"
                position={[42.022, 39.407, 108.531]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[2.54, 2.54, 0.818]}
                userData={{ name: 'laseralumobj' }}
              >
                <mesh
                  name="laseralumobj_Material_#776_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['laseralumobj_Material_#776_0'].geometry}
                  material={materials.Material_776}
                  userData={{ name: 'laseralumobj_Material #776_0' }}
                />
              </group>
              <group
                name="diffuser_details"
                position={[0.031, 20.014, -124.952]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={2.54}
                userData={{ name: 'diffuser details' }}
              >
                <group
                  name="Object_77"
                  position={[-10.227, 0.025, -2.076]}
                  userData={{ name: 'Object_77' }}
                >
                  <mesh
                    name="diffuser_details_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={
                      nodes['diffuser_details_Material_#694_0'].geometry
                    }
                    material={materials.Material_694}
                    userData={{ name: 'diffuser details_Material #694_0' }}
                  />
                </group>
              </group>
              <group
                name="exhausts"
                position={[-0.022, 17.459, -123.254]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={2.54}
                userData={{ name: 'exhausts' }}
              >
                <group
                  name="Object_80"
                  position={[-8.362, 0, -0.849]}
                  userData={{ name: 'Object_80' }}
                >
                  <mesh
                    name="exhausts_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['exhausts_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'exhausts_Material #698_0' }}
                  />
                  <mesh
                    name="exhausts_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['exhausts_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'exhausts_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="exhaust_muffler"
                position={[0.029, 15.403, -111.166]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={2.54}
                userData={{ name: 'exhaust muffler' }}
              >
                <group
                  name="Object_84"
                  position={[-5.545, 0.124, -3.17]}
                  userData={{ name: 'Object_84' }}
                >
                  <mesh
                    name="exhaust_muffler_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['exhaust_muffler_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'exhaust muffler_Material #717_0' }}
                  />
                  <mesh
                    name="exhaust_muffler_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['exhaust_muffler_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'exhaust muffler_Material #697_0' }}
                  />
                </group>
              </group>
              <group
                name="Cylinder001"
                position={[0.035, 51.696, -123.118]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={2.54}
                userData={{ name: 'Cylinder001' }}
              >
                <mesh
                  name="Cylinder001_Material_#786_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Cylinder001_Material_#786_0'].geometry}
                  material={materials.Material_786}
                  userData={{ name: 'Cylinder001_Material #786_0' }}
                />
                <mesh
                  name="Cylinder001_Material_#538_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Cylinder001_Material_#538_0'].geometry}
                  material={materials.Material_538}
                  userData={{ name: 'Cylinder001_Material #538_0' }}
                />
                <mesh
                  name="Cylinder001_Material_#787_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Cylinder001_Material_#787_0'].geometry}
                  material={materials.Material_787}
                  userData={{ name: 'Cylinder001_Material #787_0' }}
                />
              </group>
              <group
                name="Cylinder002"
                position={[0.076, 38.924, 127.303]}
                rotation={[-0.974, 0, 0]}
                scale={[5.843, 5.683, 4.01]}
                userData={{ name: 'Cylinder002' }}
              >
                <mesh
                  name="Cylinder002_Material_#790_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Cylinder002_Material_#790_0'].geometry}
                  material={materials.Material_790}
                  userData={{ name: 'Cylinder002_Material #790_0' }}
                />
                <mesh
                  name="Cylinder002_Material_#574_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Cylinder002_Material_#574_0'].geometry}
                  material={materials.Material_574}
                  userData={{ name: 'Cylinder002_Material #574_0' }}
                />
              </group>
              <group
                name="rooffin"
                position={[0.076, 73.329, -52.212]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[2.685, 2.721, 2.442]}
                userData={{ name: 'rooffin' }}
              >
                <group
                  name="Object_95"
                  position={[0.152, 1.057, -0.092]}
                  userData={{ name: 'Object_95' }}
                >
                  <mesh
                    name="rooffin_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['rooffin_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'rooffin_Material #698_0' }}
                  />
                </group>
              </group>
              <group
                name="spoiler"
                position={[0.075, 54.91, -119.655]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={[2.54, 2.349, 1.257]}
                userData={{ name: 'spoiler' }}
              >
                <group
                  name="Object_98"
                  position={[-6.35, -0.047, -3.319]}
                  userData={{ name: 'Object_98' }}
                >
                  <mesh
                    name="spoiler_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['spoiler_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'spoiler_Material #694_0' }}
                  />
                </group>
              </group>
              <group
                name="Frontlogo"
                position={[12.994, 35.13, 128.878]}
                rotation={[-0.088, 0.149, 0]}
                scale={[0.349, 0.358, 0.376]}
                userData={{ name: 'Frontlogo' }}
              >
                <mesh
                  name="Frontlogo_Material_#801_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Frontlogo_Material_#801_0'].geometry}
                  material={materials.Material_801}
                  userData={{ name: 'Frontlogo_Material #801_0' }}
                />
                <mesh
                  name="Frontlogo_Material_#803_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Frontlogo_Material_#803_0'].geometry}
                  material={materials.Material_803}
                  userData={{ name: 'Frontlogo_Material #803_0' }}
                />
                <mesh
                  name="Frontlogo_Material_#802_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Frontlogo_Material_#802_0'].geometry}
                  material={materials.Material_802}
                  userData={{ name: 'Frontlogo_Material #802_0' }}
                />
                <mesh
                  name="Frontlogo_Material_#804_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Frontlogo_Material_#804_0'].geometry}
                  material={materials.Material_804}
                  userData={{ name: 'Frontlogo_Material #804_0' }}
                />
                <mesh
                  name="Frontlogo_Material_#805_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Frontlogo_Material_#805_0'].geometry}
                  material={materials.Material_805}
                  userData={{ name: 'Frontlogo_Material #805_0' }}
                />
              </group>
              <group
                name="rear_logo"
                position={[-21.106, 51.687, -121.5]}
                rotation={[-3.139, -0.185, -3.127]}
                scale={[0.483, 0.502, 0.604]}
                userData={{ name: 'rear_logo' }}
              >
                <mesh
                  name="rear_logo_Material_#801_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_logo_Material_#801_0'].geometry}
                  material={materials.Material_801}
                  userData={{ name: 'rear_logo_Material #801_0' }}
                />
                <mesh
                  name="rear_logo_Material_#803_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_logo_Material_#803_0'].geometry}
                  material={materials.Material_803}
                  userData={{ name: 'rear_logo_Material #803_0' }}
                />
                <mesh
                  name="rear_logo_Material_#802_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_logo_Material_#802_0'].geometry}
                  material={materials.Material_802}
                  userData={{ name: 'rear_logo_Material #802_0' }}
                />
                <mesh
                  name="rear_logo_Material_#804_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_logo_Material_#804_0'].geometry}
                  material={materials.Material_804}
                  userData={{ name: 'rear_logo_Material #804_0' }}
                />
                <mesh
                  name="rear_logo_Material_#805_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_logo_Material_#805_0'].geometry}
                  material={materials.Material_805}
                  userData={{ name: 'rear_logo_Material #805_0' }}
                />
              </group>
              <group
                name="sidelogos"
                position={[52.535, 37.744, 57.767]}
                rotation={[-1.285, 1.472, 1.305]}
                scale={[0.245, 0.251, 0.264]}
                userData={{ name: 'sidelogos' }}
              >
                <group
                  name="Object_113"
                  position={[-68.854, -1.059, 7.286]}
                  rotation={[0.003, 0.261, 0.024]}
                  userData={{ name: 'Object_113' }}
                >
                  <mesh
                    name="sidelogos_Material_#801_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['sidelogos_Material_#801_0'].geometry}
                    material={materials.Material_801}
                    userData={{ name: 'sidelogos_Material #801_0' }}
                  />
                  <mesh
                    name="sidelogos_Material_#803_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['sidelogos_Material_#803_0'].geometry}
                    material={materials.Material_803}
                    userData={{ name: 'sidelogos_Material #803_0' }}
                  />
                  <mesh
                    name="sidelogos_Material_#802_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['sidelogos_Material_#802_0'].geometry}
                    material={materials.Material_802}
                    userData={{ name: 'sidelogos_Material #802_0' }}
                  />
                  <mesh
                    name="sidelogos_Material_#804_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['sidelogos_Material_#804_0'].geometry}
                    material={materials.Material_804}
                    userData={{ name: 'sidelogos_Material #804_0' }}
                  />
                  <mesh
                    name="sidelogos_Material_#805_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['sidelogos_Material_#805_0'].geometry}
                    material={materials.Material_805}
                    userData={{ name: 'sidelogos_Material #805_0' }}
                  />
                </group>
              </group>
              <group
                name="Plate"
                position={[0.059, 43.074, -121.837]}
                rotation={[-3.056, 0, -Math.PI]}
                scale={3.96}
                userData={{ name: 'Plate' }}
              >
                <mesh
                  name="Plate_Material_#826_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Plate_Material_#826_0'].geometry}
                  material={materials.Material_826}
                  userData={{ name: 'Plate_Material #826_0' }}
                />
              </group>
              <group
                name="platebolts"
                position={[-0.001, 43.07, -121.844]}
                rotation={[-3.067, 0, -Math.PI]}
                scale={0.765}
                userData={{ name: 'platebolts' }}
              >
                <group
                  name="Object_122"
                  position={[-5.596, 3.661, 4.328]}
                  userData={{ name: 'Object_122' }}
                >
                  <mesh
                    name="platebolts_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['platebolts_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'platebolts_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="fgrllpiece"
                position={[0.076, 24.309, 126.434]}
                scale={2.54}
                userData={{ name: 'fgrllpiece' }}
              >
                <mesh
                  name="fgrllpiece_Material_#694_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['fgrllpiece_Material_#694_0'].geometry}
                  material={materials.Material_694}
                  userData={{ name: 'fgrllpiece_Material #694_0' }}
                />
                <mesh
                  name="fgrllpiece_Material_#697_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['fgrllpiece_Material_#697_0'].geometry}
                  material={materials.Material_697}
                  userData={{ name: 'fgrllpiece_Material #697_0' }}
                />
              </group>
              <group
                name="bumpers"
                position={[26.5, 42.029, 0.971]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'bumpers' }}
              >
                <group
                  name="Object_128"
                  position={[-32.707, -9.228, 10.316]}
                  userData={{ name: 'Object_128' }}
                >
                  <mesh
                    name="bumpers_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bumpers_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'bumpers_Material #692_0' }}
                  />
                  <mesh
                    name="bumpers_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bumpers_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'bumpers_Material #694_0' }}
                  />
                  <mesh
                    name="bumpers_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bumpers_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'bumpers_Material #697_0' }}
                  />
                  <mesh
                    name="bumpers_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bumpers_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'bumpers_Material #698_0' }}
                  />
                  <mesh
                    name="bumpers_Material_#738_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['bumpers_Material_#738_0'].geometry}
                    material={materials.Material_738}
                    userData={{ name: 'bumpers_Material #738_0' }}
                  />
                </group>
              </group>
              <group
                name="grilles"
                position={[26.5, 42.029, 0.971]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'grilles' }}
              >
                <group
                  name="Object_135"
                  position={[-32.707, -9.228, 10.316]}
                  userData={{ name: 'Object_135' }}
                >
                  <mesh
                    name="grilles_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['grilles_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'grilles_Material #694_0' }}
                  />
                </group>
              </group>
              <group
                name="skirt"
                position={[0.069, 13.508, 6.834]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'skirt' }}
              >
                <group
                  name="Object_138"
                  position={[-30.398, 2.001, 20.722]}
                  userData={{ name: 'Object_138' }}
                >
                  <mesh
                    name="skirt_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['skirt_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'skirt_Material #692_0' }}
                  />
                  <mesh
                    name="skirt_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['skirt_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'skirt_Material #694_0' }}
                  />
                </group>
              </group>
              <group
                name="seats"
                position={[20.871, 41.556, -3.684]}
                rotation={[0, 1.571, 0]}
                scale={[2.54, 2.54, 2.675]}
                userData={{ name: 'seats' }}
              >
                <group
                  name="Object_142"
                  position={[-2.283, -8.567, -1.899]}
                  userData={{ name: 'Object_142' }}
                >
                  <mesh
                    name="seats_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'seats_Material #694_0' }}
                  />
                  <mesh
                    name="seats_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'seats_Material #706_0' }}
                  />
                  <mesh
                    name="seats_Material_#700_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#700_0'].geometry}
                    material={materials.Material_700}
                    userData={{ name: 'seats_Material #700_0' }}
                  />
                  <mesh
                    name="seats_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'seats_Material #717_0' }}
                  />
                  <mesh
                    name="seats_Material_#847_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#847_0'].geometry}
                    material={materials.Material_847}
                    userData={{ name: 'seats_Material #847_0' }}
                  />
                  <mesh
                    name="seats_Material_#848_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#848_0'].geometry}
                    material={materials.Material_848}
                    userData={{ name: 'seats_Material #848_0' }}
                  />
                  <mesh
                    name="seats_Material_#849_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#849_0'].geometry}
                    material={materials.Material_849}
                    userData={{ name: 'seats_Material #849_0' }}
                  />
                  <mesh
                    name="seats_Material_#850_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#850_0'].geometry}
                    material={materials.Material_850}
                    userData={{ name: 'seats_Material #850_0' }}
                  />
                  <mesh
                    name="seats_Material_#695_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#695_0'].geometry}
                    material={materials.Material_695}
                    userData={{ name: 'seats_Material #695_0' }}
                  />
                  <mesh
                    name="seats_Material_#803_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#803_0'].geometry}
                    material={materials.Material_803}
                    userData={{ name: 'seats_Material #803_0' }}
                  />
                  <mesh
                    name="seats_Material_#804_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#804_0'].geometry}
                    material={materials.Material_804}
                    userData={{ name: 'seats_Material #804_0' }}
                  />
                  <mesh
                    name="seats_Material_#805_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['seats_Material_#805_0'].geometry}
                    material={materials.Material_805}
                    userData={{ name: 'seats_Material #805_0' }}
                  />
                </group>
              </group>
              <group
                name="glass"
                position={[0.068, 61.633, -23.575]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'glass' }}
              >
                <group
                  name="Object_156"
                  position={[-42.37, -16.946, 20.722]}
                  userData={{ name: 'Object_156' }}
                >
                  <mesh
                    name="glass_Material_#699_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['glass_Material_#699_0'].geometry}
                    material={materials.Material_699}
                    userData={{ name: 'glass_Material #699_0' }}
                  />
                </group>
              </group>
              <group
                name="InteriorAlcntr"
                position={[0.461, 65.722, -21.494]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={2.54}
                userData={{ name: 'InteriorAlcntr' }}
              >
                <mesh
                  name="InteriorAlcntr_Material_#850_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['InteriorAlcntr_Material_#850_0'].geometry}
                  material={materials.Material_850}
                  userData={{ name: 'InteriorAlcntr_Material #850_0' }}
                />
                <mesh
                  name="InteriorAlcntr_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['InteriorAlcntr_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'InteriorAlcntr_Material #706_0' }}
                />
                <mesh
                  name="InteriorAlcntr_Material_#694_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['InteriorAlcntr_Material_#694_0'].geometry}
                  material={materials.Material_694}
                  userData={{ name: 'InteriorAlcntr_Material #694_0' }}
                />
                <mesh
                  name="InteriorAlcntr_Material_#1860_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['InteriorAlcntr_Material_#1860_0'].geometry}
                  material={materials.Material_1860}
                  userData={{ name: 'InteriorAlcntr_Material #1860_0' }}
                />
                <mesh
                  name="InteriorAlcntr_Material_#697_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['InteriorAlcntr_Material_#697_0'].geometry}
                  material={materials.Material_697}
                  userData={{ name: 'InteriorAlcntr_Material #697_0' }}
                />
              </group>
              <group
                name="Steering_Wheel"
                position={[20.846, 48.678, 21.491]}
                rotation={[-2.967, 0, -Math.PI]}
                scale={[1.105, 1.105, 1.061]}
                userData={{ name: 'Steering Wheel' }}
              >
                <mesh
                  name="Steering_Wheel_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Steering_Wheel_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'Steering Wheel_Material #706_0' }}
                />
                <mesh
                  name="Steering_Wheel_Material_#1063_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Steering_Wheel_Material_#1063_0'].geometry}
                  material={materials.Material_1063}
                  userData={{ name: 'Steering Wheel_Material #1063_0' }}
                />
                <mesh
                  name="Steering_Wheel_Material_#698_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Steering_Wheel_Material_#698_0'].geometry}
                  material={materials.Material_698}
                  userData={{ name: 'Steering Wheel_Material #698_0' }}
                />
                <mesh
                  name="Steering_Wheel_Material_#694_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Steering_Wheel_Material_#694_0'].geometry}
                  material={materials.Material_694}
                  userData={{ name: 'Steering Wheel_Material #694_0' }}
                />
                <mesh
                  name="Steering_Wheel_Material_#805_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Steering_Wheel_Material_#805_0'].geometry}
                  material={materials.Material_805}
                  userData={{ name: 'Steering Wheel_Material #805_0' }}
                />
              </group>
              <group
                name="Brake001"
                position={[44.868, 15.401, -78.729]}
                rotation={[2.985, Math.PI / 2, 0]}
                scale={[1.479, 0.977, 1.531]}
                userData={{ name: 'Brake001' }}
              >
                <group
                  name="Object_171"
                  position={[0.826, 0.024, -4.271]}
                  userData={{ name: 'Object_171' }}
                >
                  <mesh
                    name="Brake001_Material_#773_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake001_Material_#773_0'].geometry}
                    material={materials.Material_773}
                    userData={{ name: 'Brake001_Material #773_0' }}
                  />
                  <mesh
                    name="Brake001_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake001_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Brake001_Material #697_0' }}
                  />
                  <mesh
                    name="Brake001_Material_#774_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake001_Material_#774_0'].geometry}
                    material={materials.Material_774}
                    userData={{ name: 'Brake001_Material #774_0' }}
                  />
                </group>
              </group>
              <group
                name="Rim001"
                position={[44.248, 18.508, -70.489]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[2.636, 2.636, 2.516]}
                userData={{ name: 'Rim001' }}
              >
                <group
                  name="Object_176"
                  position={[0.094, -5.477, 2.787]}
                  userData={{ name: 'Object_176' }}
                >
                  <mesh
                    name="Rim001_Material_#753_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Rim001_Material_#753_0'].geometry}
                    material={materials.Material_753}
                    userData={{ name: 'Rim001_Material #753_0' }}
                  />
                </group>
              </group>
              <group
                name="brake_disc001"
                position={[41.455, 18.497, -70.498]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[2.248, 2.248, 0.481]}
                userData={{ name: 'brake disc001' }}
              >
                <group
                  name="Object_179"
                  position={[0, 0, 2.886]}
                  userData={{ name: 'Object_179' }}
                >
                  <mesh
                    name="brake_disc001_Material_#408_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc001_Material_#408_0'].geometry}
                    material={materials.Material_408}
                    userData={{ name: 'brake disc001_Material #408_0' }}
                  />
                  <mesh
                    name="brake_disc001_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc001_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'brake disc001_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="tire008"
                position={[47.732, 18.724, -70.492]}
                rotation={[0, 1.571, 0]}
                scale={[4.077, 4.077, 3.891]}
                userData={{ name: 'tire008' }}
              >
                <group
                  name="Object_183"
                  position={[0.466, -0.656, -0.008]}
                  userData={{ name: 'Object_183' }}
                >
                  <mesh
                    name="tire008_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire008_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'tire008_Material #694_0' }}
                  />
                  <mesh
                    name="tire008_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire008_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'tire008_Material #697_0' }}
                  />
                  <mesh
                    name="tire008_Material_#362_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire008_Material_#362_0'].geometry}
                    material={materials.Material_362}
                    userData={{ name: 'tire008_Material #362_0' }}
                  />
                </group>
              </group>
              <group
                name="tire009"
                position={[43.858, 18.508, -70.489]}
                rotation={[0, 1.571, 0]}
                scale={[2.54, 2.54, 3.446]}
                userData={{ name: 'tire009' }}
              >
                <group
                  name="Object_188"
                  position={[0, 0, 2.365]}
                  userData={{ name: 'Object_188' }}
                >
                  <mesh
                    name="tire009_Material_#751_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire009_Material_#751_0'].geometry}
                    material={materials.Material_751}
                    userData={{ name: 'tire009_Material #751_0' }}
                  />
                  <mesh
                    name="tire009_Material_#752_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire009_Material_#752_0'].geometry}
                    material={materials.Material_752}
                    userData={{ name: 'tire009_Material #752_0' }}
                  />
                </group>
              </group>
              <group
                name="Brake002"
                position={[-42.564, 15.637, 76.361]}
                rotation={[Math.PI, -1.222, 0.361]}
                scale={[1.683, 1.683, 1.708]}
                userData={{ name: 'Brake002' }}
              >
                <group
                  name="Object_192"
                  position={[0.826, 0.024, -4.271]}
                  userData={{ name: 'Object_192' }}
                >
                  <mesh
                    name="Brake002_Material_#773_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake002_Material_#773_0'].geometry}
                    material={materials.Material_773}
                    userData={{ name: 'Brake002_Material #773_0' }}
                  />
                  <mesh
                    name="Brake002_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake002_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Brake002_Material #697_0' }}
                  />
                  <mesh
                    name="Brake002_Material_#774_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake002_Material_#774_0'].geometry}
                    material={materials.Material_774}
                    userData={{ name: 'Brake002_Material #774_0' }}
                  />
                </group>
              </group>
              <group
                name="Brake003"
                position={[-45.002, 15.401, -63.633]}
                rotation={[-2.985, -Math.PI / 2, 0]}
                scale={[1.479, 0.977, 1.531]}
                userData={{ name: 'Brake003' }}
              >
                <group
                  name="Object_197"
                  position={[0.826, 0.024, -4.271]}
                  userData={{ name: 'Object_197' }}
                >
                  <mesh
                    name="Brake003_Material_#773_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake003_Material_#773_0'].geometry}
                    material={materials.Material_773}
                    userData={{ name: 'Brake003_Material #773_0' }}
                  />
                  <mesh
                    name="Brake003_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake003_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Brake003_Material #697_0' }}
                  />
                  <mesh
                    name="Brake003_Material_#774_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Brake003_Material_#774_0'].geometry}
                    material={materials.Material_774}
                    userData={{ name: 'Brake003_Material #774_0' }}
                  />
                </group>
              </group>
              <group
                name="Rim002"
                position={[-44.996, 18.508, 84.856]}
                rotation={[Math.PI, -1.222, Math.PI]}
                scale={[2.636, 2.636, 2.516]}
                userData={{ name: 'Rim002' }}
              >
                <group
                  name="Object_202"
                  position={[0.094, -5.477, 2.787]}
                  userData={{ name: 'Object_202' }}
                >
                  <mesh
                    name="Rim002_Material_#753_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Rim002_Material_#753_0'].geometry}
                    material={materials.Material_753}
                    userData={{ name: 'Rim002_Material #753_0' }}
                  />
                </group>
              </group>
              <group
                name="Rim003"
                position={[-44.383, 18.508, -70.381]}
                rotation={[0, -1.571, 0]}
                scale={[2.636, 2.636, 2.516]}
                userData={{ name: 'Rim003' }}
              >
                <group
                  name="Object_205"
                  position={[0.094, -5.477, 2.787]}
                  userData={{ name: 'Object_205' }}
                >
                  <mesh
                    name="Rim003_Material_#753_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Rim003_Material_#753_0'].geometry}
                    material={materials.Material_753}
                    userData={{ name: 'Rim003_Material #753_0' }}
                  />
                </group>
              </group>
              <group
                name="brake_disc002"
                position={[-42.374, 18.497, 85.819]}
                rotation={[Math.PI, -1.222, Math.PI]}
                scale={[2.661, 2.661, 0.569]}
                userData={{ name: 'brake disc002' }}
              >
                <group
                  name="Object_208"
                  position={[0, 0, 2.886]}
                  userData={{ name: 'Object_208' }}
                >
                  <mesh
                    name="brake_disc002_Material_#408_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc002_Material_#408_0'].geometry}
                    material={materials.Material_408}
                    userData={{ name: 'brake disc002_Material #408_0' }}
                  />
                  <mesh
                    name="brake_disc002_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc002_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'brake disc002_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="brake_disc003"
                position={[-41.589, 18.497, -71.864]}
                rotation={[0, -1.571, 0]}
                scale={[2.248, 2.248, 0.481]}
                userData={{ name: 'brake disc003' }}
              >
                <group
                  name="Object_212"
                  position={[0, 0, 2.886]}
                  userData={{ name: 'Object_212' }}
                >
                  <mesh
                    name="brake_disc003_Material_#408_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc003_Material_#408_0'].geometry}
                    material={materials.Material_408}
                    userData={{ name: 'brake disc003_Material #408_0' }}
                  />
                  <mesh
                    name="brake_disc003_Material_#717_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['brake_disc003_Material_#717_0'].geometry}
                    material={materials.Material_717}
                    userData={{ name: 'brake disc003_Material #717_0' }}
                  />
                </group>
              </group>
              <group
                name="tire010"
                position={[-47.867, 18.724, -70.378]}
                rotation={[0, -1.571, 0]}
                scale={[4.077, 4.077, 3.891]}
                userData={{ name: 'tire010' }}
              >
                <group
                  name="Object_216"
                  position={[0.466, -0.656, -0.008]}
                  userData={{ name: 'Object_216' }}
                >
                  <mesh
                    name="tire010_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire010_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'tire010_Material #694_0' }}
                  />
                  <mesh
                    name="tire010_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire010_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'tire010_Material #697_0' }}
                  />
                  <mesh
                    name="tire010_Material_#362_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire010_Material_#362_0'].geometry}
                    material={materials.Material_362}
                    userData={{ name: 'tire010_Material #362_0' }}
                  />
                </group>
              </group>
              <group
                name="tire011"
                position={[-43.993, 18.508, -70.381]}
                rotation={[0, -1.571, 0]}
                scale={[2.54, 2.54, 3.446]}
                userData={{ name: 'tire011' }}
              >
                <group
                  name="Object_221"
                  position={[0, 0, 2.365]}
                  userData={{ name: 'Object_221' }}
                >
                  <mesh
                    name="tire011_Material_#751_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire011_Material_#751_0'].geometry}
                    material={materials.Material_751}
                    userData={{ name: 'tire011_Material #751_0' }}
                  />
                  <mesh
                    name="tire011_Material_#752_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire011_Material_#752_0'].geometry}
                    material={materials.Material_752}
                    userData={{ name: 'tire011_Material #752_0' }}
                  />
                </group>
              </group>
              <group
                name="tire012"
                position={[-48.271, 18.724, 83.667]}
                rotation={[Math.PI, -1.222, Math.PI]}
                scale={[4.077, 4.077, 3.891]}
                userData={{ name: 'tire012' }}
              >
                <group
                  name="Object_225"
                  position={[0.466, -0.656, -0.008]}
                  userData={{ name: 'Object_225' }}
                >
                  <mesh
                    name="tire012_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire012_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'tire012_Material #694_0' }}
                  />
                  <mesh
                    name="tire012_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire012_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'tire012_Material #697_0' }}
                  />
                  <mesh
                    name="tire012_Material_#362_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire012_Material_#362_0'].geometry}
                    material={materials.Material_362}
                    userData={{ name: 'tire012_Material #362_0' }}
                  />
                </group>
              </group>
              <group
                name="tire013"
                position={[-44.629, 18.508, 84.989]}
                rotation={[Math.PI, -1.222, Math.PI]}
                scale={[2.54, 2.54, 3.446]}
                userData={{ name: 'tire013' }}
              >
                <group
                  name="Object_230"
                  position={[0, 0, 2.365]}
                  userData={{ name: 'Object_230' }}
                >
                  <mesh
                    name="tire013_Material_#751_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire013_Material_#751_0'].geometry}
                    material={materials.Material_751}
                    userData={{ name: 'tire013_Material #751_0' }}
                  />
                  <mesh
                    name="tire013_Material_#752_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['tire013_Material_#752_0'].geometry}
                    material={materials.Material_752}
                    userData={{ name: 'tire013_Material #752_0' }}
                  />
                </group>
              </group>
              <group
                name="Driver_Door"
                position={[51.563, 36.364, 41.666]}
                rotation={[0, 1.571, 0]}
                scale={2.54}
                userData={{ name: 'Driver_Door' }}
              >
                <group
                  name="Object_234"
                  position={[-16.685, -6.998, 0.449]}
                  userData={{ name: 'Object_234' }}
                >
                  <mesh
                    name="Driver_Door_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'Driver_Door_Material #692_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Driver_Door_Material #697_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'Driver_Door_Material #694_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#699_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#699_0'].geometry}
                    material={materials.Material_699}
                    userData={{ name: 'Driver_Door_Material #699_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'Driver_Door_Material #698_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#932_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#932_0'].geometry}
                    material={materials.Material_932}
                    userData={{ name: 'Driver_Door_Material #932_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'Driver_Door_Material #706_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#849_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#849_0'].geometry}
                    material={materials.Material_849}
                    userData={{ name: 'Driver_Door_Material #849_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#695_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#695_0'].geometry}
                    material={materials.Material_695}
                    userData={{ name: 'Driver_Door_Material #695_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#847_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#847_0'].geometry}
                    material={materials.Material_847}
                    userData={{ name: 'Driver_Door_Material #847_0' }}
                  />
                  <mesh
                    name="Driver_Door_Material_#1824_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Driver_Door_Material_#1824_0'].geometry}
                    material={materials.Material_1824}
                    userData={{ name: 'Driver_Door_Material #1824_0' }}
                  />
                </group>
              </group>
              <group
                name="Dashboard"
                position={[17.744, 51.683, 40.011]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={[2.54, 2.263, 2.118]}
                userData={{ name: 'Dashboard' }}
              >
                <mesh
                  name="Dashboard_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'Dashboard_Material #706_0' }}
                />
                <mesh
                  name="Dashboard_Material_#694_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#694_0'].geometry}
                  material={materials.Material_694}
                  userData={{ name: 'Dashboard_Material #694_0' }}
                />
                <mesh
                  name="Dashboard_Material_#775_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#775_0'].geometry}
                  material={materials.Material_775}
                  userData={{ name: 'Dashboard_Material #775_0' }}
                />
                <mesh
                  name="Dashboard_Material_#700_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#700_0'].geometry}
                  material={materials.Material_700}
                  userData={{ name: 'Dashboard_Material #700_0' }}
                />
                <mesh
                  name="Dashboard_Material_#849_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#849_0'].geometry}
                  material={materials.Material_849}
                  userData={{ name: 'Dashboard_Material #849_0' }}
                />
                <mesh
                  name="Dashboard_Material_#697_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#697_0'].geometry}
                  material={materials.Material_697}
                  userData={{ name: 'Dashboard_Material #697_0' }}
                />
                <mesh
                  name="Dashboard_Material_#1082_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#1082_0'].geometry}
                  material={materials.Material_1082}
                  userData={{ name: 'Dashboard_Material #1082_0' }}
                />
                <mesh
                  name="Dashboard_Material_#699_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#699_0'].geometry}
                  material={materials.Material_699}
                  userData={{ name: 'Dashboard_Material #699_0' }}
                />
                <mesh
                  name="Dashboard_Material_#698_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#698_0'].geometry}
                  material={materials.Material_698}
                  userData={{ name: 'Dashboard_Material #698_0' }}
                />
                <mesh
                  name="Dashboard_Material_#1001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#1001_0'].geometry}
                  material={materials.Material_1001}
                  userData={{ name: 'Dashboard_Material #1001_0' }}
                />
                <mesh
                  name="Dashboard_Material_#1522_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#1522_0'].geometry}
                  material={materials.Material_1522}
                  userData={{ name: 'Dashboard_Material #1522_0' }}
                />
                <mesh
                  name="Dashboard_Material_#1548_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Dashboard_Material_#1548_0'].geometry}
                  material={materials.Material_1548}
                  userData={{ name: 'Dashboard_Material #1548_0' }}
                />
              </group>
              <group
                name="Box003"
                position={[20.748, 39.372, 36.475]}
                rotation={[-1.489, 0, 0]}
                scale={[1.224, 1.085, 1.139]}
                userData={{ name: 'Box003' }}
              >
                <mesh
                  name="Box003_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Box003_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'Box003_Material #706_0' }}
                />
              </group>
              <group
                name="Object002"
                position={[0.069, 13.508, 6.834]}
                rotation={[0, Math.PI / 2, 0]}
                scale={2.54}
                userData={{ name: 'Object002' }}
              >
                <group
                  name="Object_262"
                  position={[-30.398, 2.001, 20.722]}
                  userData={{ name: 'Object_262' }}
                >
                  <mesh
                    name="Object002_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'Object002_Material #692_0' }}
                  />
                  <mesh
                    name="Object002_Material_#700_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#700_0'].geometry}
                    material={materials.Material_700}
                    userData={{ name: 'Object002_Material #700_0' }}
                  />
                  <mesh
                    name="Object002_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'Object002_Material #694_0' }}
                  />
                  <mesh
                    name="Object002_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'Object002_Material #706_0' }}
                  />
                  <mesh
                    name="Object002_Material_#849_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#849_0'].geometry}
                    material={materials.Material_849}
                    userData={{ name: 'Object002_Material #849_0' }}
                  />
                  <mesh
                    name="Object002_Material_#847_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#847_0'].geometry}
                    material={materials.Material_847}
                    userData={{ name: 'Object002_Material #847_0' }}
                  />
                  <mesh
                    name="Object002_Material_#695_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#695_0'].geometry}
                    material={materials.Material_695}
                    userData={{ name: 'Object002_Material #695_0' }}
                  />
                  <mesh
                    name="Object002_Material_#803_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#803_0'].geometry}
                    material={materials.Material_803}
                    userData={{ name: 'Object002_Material #803_0' }}
                  />
                  <mesh
                    name="Object002_Material_#804_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#804_0'].geometry}
                    material={materials.Material_804}
                    userData={{ name: 'Object002_Material #804_0' }}
                  />
                  <mesh
                    name="Object002_Material_#805_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Object002_Material_#805_0'].geometry}
                    material={materials.Material_805}
                    userData={{ name: 'Object002_Material #805_0' }}
                  />
                </group>
              </group>
              <group
                name="rearseats"
                position={[0.463, 32.172, -39.085]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={2.54}
                userData={{ name: 'rearseats' }}
              >
                <group
                  name="Object_274"
                  position={[10.748, -4.885, -1.718]}
                  userData={{ name: 'Object_274' }}
                >
                  <mesh
                    name="rearseats_Material_#849_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['rearseats_Material_#849_0'].geometry}
                    material={materials.Material_849}
                    userData={{ name: 'rearseats_Material #849_0' }}
                  />
                  <mesh
                    name="rearseats_Material_#847_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['rearseats_Material_#847_0'].geometry}
                    material={materials.Material_847}
                    userData={{ name: 'rearseats_Material #847_0' }}
                  />
                  <mesh
                    name="rearseats_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['rearseats_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'rearseats_Material #706_0' }}
                  />
                </group>
              </group>
              <group
                name="Plane003"
                position={[0.082, 44.872, -55.239]}
                scale={[3.297, 2.54, 2.54]}
                userData={{ name: 'Plane003' }}
              >
                <mesh
                  name="Plane003_Material_#849_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Plane003_Material_#849_0'].geometry}
                  material={materials.Material_849}
                  userData={{ name: 'Plane003_Material #849_0' }}
                />
                <mesh
                  name="Plane003_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['Plane003_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'Plane003_Material #706_0' }}
                />
              </group>
              <group
                name="rear_seatbackrest"
                position={[21.319, 41.874, -55.283]}
                scale={2.54}
                userData={{ name: 'rear_seatbackrest' }}
              >
                <mesh
                  name="rear_seatbackrest_Material_#849_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_seatbackrest_Material_#849_0'].geometry}
                  material={materials.Material_849}
                  userData={{ name: 'rear_seatbackrest_Material #849_0' }}
                />
                <mesh
                  name="rear_seatbackrest_Material_#847_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_seatbackrest_Material_#847_0'].geometry}
                  material={materials.Material_847}
                  userData={{ name: 'rear_seatbackrest_Material #847_0' }}
                />
                <mesh
                  name="rear_seatbackrest_Material_#850_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['rear_seatbackrest_Material_#850_0'].geometry}
                  material={materials.Material_850}
                  userData={{ name: 'rear_seatbackrest_Material #850_0' }}
                />
              </group>
              <group
                name="seatbelt"
                position={[10.045, 27.839, -49.845]}
                rotation={[-Math.PI / 2, 0.175, 0]}
                scale={1.067}
                userData={{ name: 'seatbelt' }}
              >
                <mesh
                  name="seatbelt_Material_#706_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['seatbelt_Material_#706_0'].geometry}
                  material={materials.Material_706}
                  userData={{ name: 'seatbelt_Material #706_0' }}
                />
                <mesh
                  name="seatbelt_Material_#805_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['seatbelt_Material_#805_0'].geometry}
                  material={materials.Material_805}
                  userData={{ name: 'seatbelt_Material #805_0' }}
                />
                <mesh
                  name="seatbelt_Material_#697_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['seatbelt_Material_#697_0'].geometry}
                  material={materials.Material_697}
                  userData={{ name: 'seatbelt_Material #697_0' }}
                />
              </group>
              <group
                name="interior_mirror"
                position={[0.86, 66.81, 17.883]}
                scale={[3.051, 2.79, 1.706]}
                userData={{ name: 'interior_mirror' }}
              >
                <group
                  name="Object_290"
                  position={[0, 0.046, -2.319]}
                  userData={{ name: 'Object_290' }}
                >
                  <mesh
                    name="interior_mirror_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['interior_mirror_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'interior_mirror_Material #706_0' }}
                  />
                  <mesh
                    name="interior_mirror_Material_#999_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['interior_mirror_Material_#999_0'].geometry}
                    material={materials.Material_999}
                    userData={{ name: 'interior_mirror_Material #999_0' }}
                  />
                </group>
              </group>
              <group
                name="Passenger_Door"
                position={[-51.415, 36.364, 41.666]}
                rotation={[0, 1.571, 0]}
                scale={2.54}
                userData={{ name: 'Passenger_Door' }}
              >
                <group
                  name="Object_294"
                  position={[-16.685, -6.998, 0.449]}
                  userData={{ name: 'Object_294' }}
                >
                  <mesh
                    name="Passenger_Door_Material_#692_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#692_0'].geometry}
                    material={materials.Material_692}
                    userData={{ name: 'Passenger_Door_Material #692_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#697_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#697_0'].geometry}
                    material={materials.Material_697}
                    userData={{ name: 'Passenger_Door_Material #697_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#694_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#694_0'].geometry}
                    material={materials.Material_694}
                    userData={{ name: 'Passenger_Door_Material #694_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#699_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#699_0'].geometry}
                    material={materials.Material_699}
                    userData={{ name: 'Passenger_Door_Material #699_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#698_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#698_0'].geometry}
                    material={materials.Material_698}
                    userData={{ name: 'Passenger_Door_Material #698_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#932_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#932_0'].geometry}
                    material={materials.Material_932}
                    userData={{ name: 'Passenger_Door_Material #932_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#706_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#706_0'].geometry}
                    material={materials.Material_706}
                    userData={{ name: 'Passenger_Door_Material #706_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#849_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#849_0'].geometry}
                    material={materials.Material_849}
                    userData={{ name: 'Passenger_Door_Material #849_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#695_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#695_0'].geometry}
                    material={materials.Material_695}
                    userData={{ name: 'Passenger_Door_Material #695_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#847_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#847_0'].geometry}
                    material={materials.Material_847}
                    userData={{ name: 'Passenger_Door_Material #847_0' }}
                  />
                  <mesh
                    name="Passenger_Door_Material_#1824_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Passenger_Door_Material_#1824_0'].geometry}
                    material={materials.Material_1824}
                    userData={{ name: 'Passenger_Door_Material #1824_0' }}
                  />
                </group>
              </group>
              <group
                name="sunvisors"
                position={[20.143, 69.558, 11.615]}
                rotation={[-1.484, 0, 0]}
                userData={{ name: 'sunvisors' }}
              >
                <mesh
                  name="sunvisors_Material_#1015_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['sunvisors_Material_#1015_0'].geometry}
                  material={materials.Material_1015}
                  userData={{ name: 'sunvisors_Material #1015_0' }}
                />
              </group>
              <group
                name="plds"
                position={[11.093, 13.006, 43.214]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[1, 0.865, 1]}
                userData={{ name: 'plds' }}
              >
                <mesh
                  name="plds_Material_#1014_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['plds_Material_#1014_0'].geometry}
                  material={materials.Material_1014}
                  userData={{ name: 'plds_Material #1014_0' }}
                />
                <mesh
                  name="plds_Material_#1069_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['plds_Material_#1069_0'].geometry}
                  material={materials.Material_1069}
                  userData={{ name: 'plds_Material #1069_0' }}
                />
                <mesh
                  name="plds_Material_#1046_0"
                  castShadow
                  receiveShadow
                  geometry={nodes['plds_Material_#1046_0'].geometry}
                  material={materials.Material_1046}
                  userData={{ name: 'plds_Material #1046_0' }}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
export default BMW;
