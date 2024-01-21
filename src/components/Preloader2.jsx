import React, { useEffect, useState, Suspense } from 'react';
import './css/Preloader.css';
import Home from './Home';
import GhostKitty from './Models/GhosKitty';
import { Canvas, useFrame } from '@react-three/fiber';
function Preloader() {
  const [data, setData] = useState([]);
  const [loading, setloading] = useState(undefined);
  const [completed, setcompleted] = useState(undefined);
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.5, 0.5, 0.5];
      screenPosition = [0, -6.5, -43.4];
    } else {
      screenScale = [0.7, 0.7, 0.7];
      screenPosition = [0, -6.5, -43.4];
    }

    return [screenScale, screenPosition];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  useEffect(() => {
    setTimeout(() => {
      fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(json => {
          console.log(json);
          setData(json);
          setloading(true);

          setTimeout(() => {
            setcompleted(true);
          }, 4000);
        });
    }, 1000);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Welcome to iAim..</span>
            </div>
          ) : (
            <div className="spinner">
              {' '}
              <Suspense>
                <Canvas>
                  <directionalLight position={[1, 1, 1]} intensity={2} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 15, 10, 10]} intensity={2} />

                  <GhostKitty
                    isRotating={isRotating}
                    setIsRotating={setIsRotating}
                    setCurrentStage={setCurrentStage}
                    position={islandPosition}
                    rotation={[0.1, 4.7077, 0]}
                    scale={islandScale}
                  />
                </Canvas>
              </Suspense>
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            {' '}
            <Home />
          </div>
        </>
      )}
    </>
  );
}

export default Preloader;
