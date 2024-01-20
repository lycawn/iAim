import React, { useEffect, useState, Suspense } from 'react';
import './Preloader.css';
import Home from './Home';
import Koicat from './Models/Koicat';
import Portfolio from './Portfolio';
import { Canvas, useFrame } from '@react-three/fiber';
function Preloader3() {
  const [data, setData] = useState([]);
  const [loading, setloading] = useState(undefined);
  const [currentStage, setCurrentStage] = useState(0);
  const [completed, setcompleted] = useState(undefined);
  const [isRotating, setIsRotating] = useState(false);
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [10.5, 10.5, 10.5];
      screenPosition = [0, -6.5, -43.4];
    } else {
      screenScale = [10.7, 10.7, 10.7];
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
    }, 2000);
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
            <div className="spinner">
              {' '}
              <section className="skyBox">
                <Suspense>
                  <Canvas>
                    <directionalLight position={[4, 1, 1]} intensity={2} />
                    <ambientLight intensity={1.5} />
                    <pointLight position={[55, 15, 10, 10]} intensity={7} />

                    <Koicat
                      isRotating={isRotating}
                      setIsRotating={setIsRotating}
                      setCurrentStage={setCurrentStage}
                      rotation={[0.1, 4.7077, 0]}
                      scale={islandScale}
                      position={islandPosition}
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
