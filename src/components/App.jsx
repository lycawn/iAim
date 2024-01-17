import { Link } from 'react-router-dom';
import { Suspense, useState } from 'react';
import Player from './Player';
import Header from './Header';
import { Canvas } from '@react-three/fiber';
import Island from './Island';
import Bounce from 'react-reveal/Bounce';
function App() {
  const [currentStage, setCurrentStage] = useState(2);
  const [isRotating, setIsRotating] = useState(false);
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

  return (
    <div className="containerG">
      <div className="introduction">
        <Header />
        {currentStage === 1 ? (
          <Link to="/Home">
            {' '}
            <Bounce left>
              <h1 className="introH1">iAim</h1>{' '}
            </Bounce>{' '}
            <div className="infoGame">
              <h1>I Aim </h1>
              <p>Do not get overwhelmed by 30 Enemies</p>
              <p>Score as many points as you can</p>
            </div>
          </Link>
        ) : (
          <h1 className="rotate">Rotate the house or tap on the stages</h1>
        )}

        <Suspense>
          <Canvas className="islandCanvas">
            <directionalLight position={[1, 1, 1]} intensity={2} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 5, 10]} intensity={2} />
            <spotLight
              position={[0, 50, 10]}
              angle={0.15}
              penumbra={1}
              intensity={2}
            />
            <hemisphereLight
              skyColor="#b1e1ff"
              groundColor="#000000"
              intensity={1}
            />

            <Island
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
      <h4 className="introH4">a calming journey to master your reflexes.</h4>{' '}
      <div className="thirteen"></div>
    </div>
  );
}
export default App;
