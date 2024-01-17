import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const Jupiter = () => {
  const canvasRef = useRef();
  const texture = new TextureLoader().load('./img/Jupiter.png');
  const mountainPic = new TextureLoader().load('./img/21894-NTOTWE.jpg');

  useEffect(() => {
    const scene = new THREE.Scene();

    // Add a background color
    scene.background = new THREE.Color(0x87ceeb); // Sky Blue

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const createRandomSphere = () => {
      const randomGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const randomMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
      });
      const randomSphere = new THREE.Mesh(randomGeometry, randomMaterial);

      randomSphere.position.x = Math.random() * 10 - 5;
      randomSphere.position.y = Math.random() * 10 - 5;
      randomSphere.position.z = Math.random() * 10 - 5;

      scene.add(randomSphere);
    };

    const createMainSphere = () => {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const mainSphere = new THREE.Mesh(geometry, material);

      mainSphere.rotation.x = Math.random() * Math.PI * 2;
      mainSphere.rotation.y = Math.random() * Math.PI * 2;

      scene.add(mainSphere);

      const handleKeyPress = event => {
        const speed = 0.1;
        switch (event.key) {
          case 'w':
            mainSphere.position.y += speed;
            break;
          case 's':
            mainSphere.position.y -= speed;
            break;
          case 'a':
            mainSphere.position.x -= speed;
            break;
          case 'd':
            mainSphere.position.x += speed;
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    };

    createMainSphere(); // Create the main Jupiter sphere

    const spawnRandomSphere = () => {
      createRandomSphere(); // Create a random sphere
    };

    setInterval(spawnRandomSphere, 1000); // Spawn random spheres every 5 seconds

    camera.position.z = 10;

    // Add mountains
    // const mountainGeometry = new THREE.BoxGeometry(20, 5, 30);
    // const mountainMaterial = new THREE.MeshBasicMaterial({ map: mountainPic }); // DimGray
    // const mountain1 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    // mountain1.position.set(-10, -5, -20);

    // const mountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    // mountain2.position.set(20, -5, -30);

    // scene.add(mountain1, mountain2);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate and move the main Jupiter sphere
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
        }
      });

      // Update camera position to follow the main sphere
      const mainSphere = scene.children.find(
        child => child instanceof THREE.Mesh
      );
      if (mainSphere) {
        camera.position.x += (mainSphere.position.x - camera.position.x) * 0.05;
        camera.position.y += (mainSphere.position.y - camera.position.y) * 0.05;
        camera.lookAt(mainSphere.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {};
  }, []);

  return (
    <div>
      {' '}
      <div ref={canvasRef} />;
    </div>
  );
};

export default Jupiter;
