import React, { useEffect, useState, Suspense } from 'react';
import './Preloader.css';
import Home from './Home';
import Polyforest from './Polyforest';
import Portfolio from './Portfolio';
import { Canvas, useFrame } from '@react-three/fiber';
function Preloader3() {
  const [data, setData] = useState([]);
  const [loading, setloading] = useState(undefined);
  const [completed, setcompleted] = useState(undefined);
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [2.5, 2.5, 2.5];
      screenPosition = [0, -3.5, -43.4];
    } else {
      screenScale = [2.7, 2.7, 2.7];
      screenPosition = [0, -4.5, -43.4];
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
          }, 14000);
        });
    }, 1000);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Loading Angelo's Portfolio</span>
            </div>
          ) : (
            <div className="completed">
              {' '}
              <section className="skyBox">
                <Suspense>
                  <Canvas>
                    <directionalLight position={[4, 1, 1]} intensity={2} />
                    <ambientLight intensity={1.5} />
                    <pointLight position={[55, 15, 10, 10]} intensity={7} />

                    <Polyforest
                      isRotating={isRotating}
                      setIsRotating={setIsRotating}
                      setCurrentStage={setCurrentStage}
                      position={islandPosition}
                      rotation={[0.1, 4.7077, 0]}
                      scale={islandScale}
                    />
                  </Canvas>
                </Suspense>
              </section>
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            {' '}
            <Portfolio />
          </div>
        </>
      )}
    </>
  );
}

export default Preloader3;
