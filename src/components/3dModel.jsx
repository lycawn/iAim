import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

const Model = () => {
  const group = useRef();
  const { nodes, materials } = useGLTF('./assets/demo-txt.glb');

  return (
    <group ref={group} dispose={null}>
      {/* Include your model nodes and materials here */}
      <mesh
        geometry={nodes.yourMeshName.geometry}
        material={materials.yourMaterialName}
      />
    </group>
  );
};

export default Model;
