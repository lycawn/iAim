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

import islandScene from '../assets/koi_cat.glb';

export function Koicat({
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
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="BezierCircle_1" position={[0, -0.548, 0]} />
              <group name="Plane058_2">
                <mesh
                  name="Object_5"
                  geometry={nodes.Object_5.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Armature002_9" position={[0.138, 0.128, -0.739]}>
                <group name="GLTF_created_0">
                  <primitive object={nodes.GLTF_created_0_rootJoint} />
                  <skinnedMesh
                    name="Object_10"
                    geometry={nodes.Object_10.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_10.skeleton}
                  />
                  <group name="Torus007_8" />
                </group>
              </group>
              <group name="BezierCircle001_10" position={[0, -0.548, 0]} />
              <group
                name="Cube003_11"
                position={[0.018, 0.027, 0.004]}
                rotation={[0, -0.228, 0]}
                scale={0.393}
              >
                <mesh
                  name="Object_18"
                  geometry={nodes.Object_18.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Cube007_12"
                position={[0.018, 0.027, 0.004]}
                rotation={[0, -0.228, 0]}
                scale={0.412}
              >
                <mesh
                  name="Object_20"
                  geometry={nodes.Object_20.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Circle008_13"
                position={[0, 8.878, 0]}
                rotation={[0, 0.007, 0]}
              />
              <group name="Cube_14" scale={0.983}>
                <mesh
                  name="Object_23"
                  geometry={nodes.Object_23.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cube001_15" scale={0.994}>
                <mesh
                  name="Object_25"
                  geometry={nodes.Object_25.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cube002_16" scale={0.99}>
                <mesh
                  name="Object_27"
                  geometry={nodes.Object_27.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cube005_17" scale={[0.927, 0.929, 0.927]}>
                <mesh
                  name="Object_29"
                  geometry={nodes.Object_29.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cube006_18" scale={[0.927, 0.929, 0.927]}>
                <mesh
                  name="Object_31"
                  geometry={nodes.Object_31.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cylinder001_19" position={[-1.328, 1.271, 0.485]}>
                <mesh
                  name="Object_33"
                  geometry={nodes.Object_33.geometry}
                  material={materials.Frog}
                />
                <mesh
                  name="Object_34"
                  geometry={nodes.Object_34.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Cylinder003_20"
                position={[-1.604, 1.527, 0.593]}
                rotation={[-0.043, 0.357, 0.841]}
                scale={0.846}
              >
                <mesh
                  name="Object_36"
                  geometry={nodes.Object_36.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Sphere_23"
                rotation={[0, -0.44, 0]}
                scale={[-1.631, 1.631, 1.631]}
              >
                <mesh
                  name="Object_38"
                  geometry={nodes.Object_38.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Torus002_25"
                position={[-1.175, 1.118, 0.423]}
                rotation={[-0.048, 0.381, 0.842]}
                scale={0.63}
              >
                <mesh
                  name="Object_40"
                  geometry={nodes.Object_40.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Torus004_26" position={[-1.194, 0.889, 1]}>
                <mesh
                  name="Object_42"
                  geometry={nodes.Object_42.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Torus005_27"
                position={[-1.218, 0.717, 1.155]}
                rotation={[1.065, -0.595, -2.909]}
                scale={0.143}
              >
                <mesh
                  name="Object_44"
                  geometry={nodes.Object_44.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Circle028_28"
                position={[-1.207, 0.604, 1.236]}
                rotation={[3.056, -0.859, 0.156]}
                scale={1.552}
              >
                <mesh
                  name="Object_46"
                  geometry={nodes.Object_46.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Target_2_29"
                position={[0, 8.123, 0]}
                rotation={[0.001, 0, -0.05]}
                scale={[1.003, 1, 1.001]}
              />
              <group
                name="Target_2_2_30"
                position={[0, 7.992, 0]}
                rotation={[0.143, 0.172, 0.038]}
                scale={1.097}
              />
              <group name="fish_flow_35" position={[0, 4.446, 0]} scale={1.952}>
                <group
                  name="Driver_fish_1_31"
                  position={[-0.077, -2.278, -0.112]}
                  rotation={[0, 0, -Math.PI / 2]}
                  scale={0.111}
                >
                  <mesh
                    name="Object_51"
                    geometry={nodes.Object_51.geometry}
                    material={materials.material_0}
                  />
                </group>
                <group
                  name="Driver_fish_2_32"
                  position={[-0.077, -2.278, -0.112]}
                  rotation={[0, 0, -Math.PI / 2]}
                  scale={0.111}
                >
                  <mesh
                    name="Object_53"
                    geometry={nodes.Object_53.geometry}
                    material={materials.material_0}
                  />
                </group>
                <group
                  name="fish_1_33"
                  position={[-0.145, -2.708, -0.3]}
                  rotation={[-Math.PI, 0.54, Math.PI]}
                  scale={[-0.512, 0.512, 0.512]}
                >
                  <mesh
                    name="Object_55"
                    geometry={nodes.Object_55.geometry}
                    material={materials.Fish_Texture}
                  />
                  <mesh
                    name="Object_56"
                    geometry={nodes.Object_56.geometry}
                    material={materials.Frog_2}
                  />
                </group>
                <group
                  name="fish_2_34"
                  position={[0.164, -2.68, 0.306]}
                  rotation={[0, -0.47, 0]}
                  scale={[-0.512, 0.512, 0.512]}
                >
                  <mesh
                    name="Object_58"
                    geometry={nodes.Object_58.geometry}
                    material={materials.Fish_Texture}
                  />
                  <mesh
                    name="Object_59"
                    geometry={nodes.Object_59.geometry}
                    material={materials.Frog_2}
                  />
                </group>
              </group>
              <group
                name="Plane100_36"
                position={[0.513, 2.158, 0.211]}
                rotation={[-2.916, -0.464, 2.871]}
                scale={[0.588, 0.311, 0.529]}
              >
                <mesh
                  name="Object_61"
                  geometry={nodes.Object_61.geometry}
                  material={materials.Frog}
                />
                <mesh
                  name="Object_62"
                  geometry={nodes.Object_62.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane071_37"
                position={[-1.294, -1.898, 0.211]}
                rotation={[-2.841, -0.209, -2.684]}
                scale={[0.426, 0.225, 0.383]}
              >
                <mesh
                  name="Object_64"
                  geometry={nodes.Object_64.geometry}
                  material={materials.Frog}
                />
                <mesh
                  name="Object_65"
                  geometry={nodes.Object_65.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane117_38"
                position={[1.149, 2.006, 0.016]}
                rotation={[0, 0, 1.303]}
                scale={0.09}
              >
                <mesh
                  name="Object_67"
                  geometry={nodes.Object_67.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane119_39"
                position={[1.548, 1.718, 0.016]}
                rotation={[-0.35, 0.019, 0.507]}
                scale={0.657}
              >
                <mesh
                  name="Object_69"
                  geometry={nodes.Object_69.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane120_40"
                position={[1.799, 1.132, 0.016]}
                rotation={[-3.065, -0.094, -2.977]}
                scale={[0.103, 0.102, 0.103]}
              >
                <mesh
                  name="Object_71"
                  geometry={nodes.Object_71.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane122_41"
                position={[-1.896, -1.42, 0.016]}
                rotation={[3, -0.182, 1.972]}
                scale={0.682}
              >
                <mesh
                  name="Object_73"
                  geometry={nodes.Object_73.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Plane123_42"
                position={[-2.14, -0.946, -0.418]}
                rotation={[-0.62, 0.386, 0.938]}
                scale={[0.132, 0.133, 0.132]}
              >
                <mesh
                  name="Object_75"
                  geometry={nodes.Object_75.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Circle025_43"
                position={[-0.477, -0.131, -1.007]}
                rotation={[-2.557, -0.785, -2.664]}
              >
                <mesh
                  name="Object_77"
                  geometry={nodes.Object_77.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Circle026_44"
                position={[-0.477, -0.131, -1.007]}
                rotation={[-2.557, -0.785, -2.664]}
              >
                <mesh
                  name="Object_79"
                  geometry={nodes.Object_79.geometry}
                  material={materials.Frog}
                />
              </group>
              <group
                name="Cylinder020_45"
                position={[-0.475, -1.049, -0.988]}
                rotation={[0, 1.448, 0]}
                scale={[0.373, 0.293, 0.373]}
              >
                <mesh
                  name="Object_81"
                  geometry={nodes.Object_81.geometry}
                  material={materials.Frog_2}
                />
              </group>
              <group
                name="Cylinder021_46"
                position={[-0.475, -1.049, -0.988]}
                rotation={[0, 1.448, 0]}
                scale={[0.373, 0.293, 0.373]}
              >
                <mesh
                  name="Object_83"
                  geometry={nodes.Object_83.geometry}
                  material={materials.Frog_2}
                />
              </group>
              <group name="Lotos_3_52" position={[0.55, -0.064, -0.869]}>
                <group name="GLTF_created_1">
                  <primitive object={nodes.GLTF_created_1_rootJoint} />
                  <skinnedMesh
                    name="Object_88"
                    geometry={nodes.Object_88.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_88.skeleton}
                  />
                  <group name="Lotos)3_51" />
                </group>
              </group>
              <group name="Lotos_2_58" position={[-0.149, -0.064, -1.029]}>
                <group name="GLTF_created_2">
                  <primitive object={nodes.GLTF_created_2_rootJoint} />
                  <skinnedMesh
                    name="Object_97"
                    geometry={nodes.Object_97.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_97.skeleton}
                  />
                  <group name="Cylinder015_57" />
                </group>
              </group>
              <group
                name="Lotos_1_64"
                position={[-1.056, -0.118, -0.271]}
                rotation={[-Math.PI, 0.326, -Math.PI]}
              >
                <group name="GLTF_created_3">
                  <primitive object={nodes.GLTF_created_3_rootJoint} />
                  <skinnedMesh
                    name="Object_106"
                    geometry={nodes.Object_106.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_106.skeleton}
                  />
                  <skinnedMesh
                    name="Object_107"
                    geometry={nodes.Object_107.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_107.skeleton}
                  />
                  <group name="Lotos_1001_63" />
                </group>
              </group>
              <group name="Lotos_4_70" position={[1.081, -0.064, -0.48]}>
                <group name="GLTF_created_4">
                  <primitive object={nodes.GLTF_created_4_rootJoint} />
                  <skinnedMesh
                    name="Object_116"
                    geometry={nodes.Object_116.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_116.skeleton}
                  />
                  <group name="Cylinder012_69" />
                </group>
              </group>
              <group
                name="Lotos_5_76"
                position={[0.32, -1.502, -0.081]}
                scale={0.765}
              >
                <group name="GLTF_created_5">
                  <primitive object={nodes.GLTF_created_5_rootJoint} />
                  <skinnedMesh
                    name="Object_125"
                    geometry={nodes.Object_125.geometry}
                    material={materials.Frog_2}
                    skeleton={nodes.Object_125.skeleton}
                  />
                  <group name="Lotos_5001_75" />
                </group>
              </group>
              <group name="Ears_83" position={[-0.083, 0.565, 0.437]}>
                <group name="GLTF_created_6">
                  <primitive object={nodes.GLTF_created_6_rootJoint} />
                  <skinnedMesh
                    name="Object_134"
                    geometry={nodes.Object_134.geometry}
                    material={materials.Frog}
                    skeleton={nodes.Object_134.skeleton}
                  />
                  <skinnedMesh
                    name="Object_135"
                    geometry={nodes.Object_135.geometry}
                    material={materials.Frog_2}
                    skeleton={nodes.Object_135.skeleton}
                  />
                  <group name="Cube004_82" />
                </group>
              </group>
              <group name="Plane_84" position={[-0.05, -0.067, 0.096]}>
                <mesh
                  name="Object_142"
                  geometry={nodes.Object_142.geometry}
                  material={materials.Frog}
                />
              </group>
              <group name="Cube011_85" position={[-0.052, -0.067, 0.095]}>
                <mesh
                  name="mesh_38"
                  geometry={nodes.mesh_38.geometry}
                  material={materials.Frog}
                  morphTargetDictionary={nodes.mesh_38.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_38.morphTargetInfluences}
                />
              </group>
              <group name="Cube012_86" position={[-0.052, -0.067, 0.095]}>
                <mesh
                  name="mesh_39"
                  geometry={nodes.mesh_39.geometry}
                  material={materials.Frog}
                  morphTargetDictionary={nodes.mesh_39.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_39.morphTargetInfluences}
                />
              </group>
              <group name="Cube013_87" position={[-0.052, -0.067, 0.095]}>
                <mesh
                  name="mesh_40"
                  geometry={nodes.mesh_40.geometry}
                  material={materials.Frog}
                  morphTargetDictionary={nodes.mesh_40.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_40.morphTargetInfluences}
                />
              </group>
              <group name="Cube014_88" position={[-0.052, -0.067, 0.095]}>
                <mesh
                  name="mesh_41"
                  geometry={nodes.mesh_41.geometry}
                  material={materials.Frog}
                  morphTargetDictionary={nodes.mesh_41.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_41.morphTargetInfluences}
                />
              </group>
              <group name="Circle013_89" position={[-0.052, -0.067, 0.095]}>
                <mesh
                  name="mesh_42"
                  geometry={nodes.mesh_42.geometry}
                  material={materials.Frog}
                  morphTargetDictionary={nodes.mesh_42.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_42.morphTargetInfluences}
                />
              </group>
              <group
                name="Plane045_91"
                position={[-0.005, -0.157, 0.007]}
                rotation={[2.928, -0.764, 2.964]}
                scale={[1.218, 0.644, 1.523]}
              >
                <mesh
                  name="Object_154"
                  geometry={nodes.Object_154.geometry}
                  material={materials.Frog}
                />
                <group name="Plane046_90">
                  <mesh
                    name="Object_156"
                    geometry={nodes.Object_156.geometry}
                    material={materials.Frog}
                  />
                </group>
              </group>
              <group
                name="Plane059_93"
                position={[0.149, -0.173, 0.182]}
                rotation={[2.728, -0.766, 2.922]}
                scale={[1.218, 0.644, 1.096]}
              >
                <mesh
                  name="Object_158"
                  geometry={nodes.Object_158.geometry}
                  material={materials.Frog}
                />
                <group name="Plane060_92">
                  <mesh
                    name="Object_160"
                    geometry={nodes.Object_160.geometry}
                    material={materials.Frog}
                  />
                </group>
              </group>
              <group
                name="Circle_94"
                position={[-0.596, 2.266, 0.298]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_162"
                  geometry={nodes.Object_162.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle001_95"
                position={[-2.096, 0.595, 0.089]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_164"
                  geometry={nodes.Object_164.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle002_96"
                position={[-2.356, 0.365, 0.74]}
                scale={[0.815, 0.849, 1]}
              >
                <mesh
                  name="Object_166"
                  geometry={nodes.Object_166.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle005_97"
                position={[1.762, -1.151, -0.056]}
                scale={[0.815, 0.849, 0.686]}
              >
                <mesh
                  name="Object_168"
                  geometry={nodes.Object_168.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle006_98"
                position={[1.517, -1.594, -0.056]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_170"
                  geometry={nodes.Object_170.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle027_99"
                position={[1.056, -1.727, -0.056]}
                rotation={[0, 0, -Math.PI]}
                scale={[0.01, 0.01, 1]}
              >
                <mesh
                  name="Object_172"
                  geometry={nodes.Object_172.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle029_100"
                position={[-1.442, -1.564, -0.056]}
                rotation={[0, 0, -Math.PI]}
                scale={[0.01, 0.01, 1]}
              >
                <mesh
                  name="Object_174"
                  geometry={nodes.Object_174.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle030_101"
                position={[-1.54, -2.186, -0.056]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_176"
                  geometry={nodes.Object_176.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle031_102"
                position={[-0.838, -1.945, -0.056]}
                rotation={[0, 0, -Math.PI]}
                scale={[0.01, 0.01, 1]}
              >
                <mesh
                  name="Object_178"
                  geometry={nodes.Object_178.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle032_103"
                position={[-0.046, 2.394, -0.104]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_180"
                  geometry={nodes.Object_180.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle033_104"
                position={[0.866, 1.904, -0.056]}
                scale={[0.815, 0.849, 1]}
              >
                <mesh
                  name="Object_182"
                  geometry={nodes.Object_182.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle034_105"
                position={[-0.016, -0.639, 1.735]}
                rotation={[0, 0, -Math.PI]}
                scale={[0.01, 0.01, 1]}
              >
                <mesh
                  name="Object_184"
                  geometry={nodes.Object_184.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle035_106"
                position={[0.718, -0.158, 1.735]}
                scale={[0.815, 0.849, 1]}
              >
                <mesh
                  name="Object_186"
                  geometry={nodes.Object_186.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle036_107"
                position={[-0.521, -0.534, 1.735]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_188"
                  geometry={nodes.Object_188.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle037_108"
                position={[2.057, 1.189, -0.056]}
                rotation={[0, 0, -Math.PI]}
                scale={[0.01, 0.01, 1]}
              >
                <mesh
                  name="Object_190"
                  geometry={nodes.Object_190.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Circle038_109"
                position={[1.845, 0.694, -0.056]}
                scale={[0.965, 1.038, 1]}
              >
                <mesh
                  name="Object_192"
                  geometry={nodes.Object_192.geometry}
                  material={materials.White}
                />
              </group>
              <group
                name="Curve059_110"
                position={[-0.045, -0.147, 0.008]}
                scale={21.479}
              >
                <mesh
                  name="Object_194"
                  geometry={nodes.Object_194.geometry}
                  material={materials.Frog}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
export default Koicat;
