import { Link } from 'react-router-dom';
import { Suspense, useState } from 'react';
import Player from './Player';
import Header from './Header';
import { Canvas } from '@react-three/fiber';
import Island from './Island';
import Bird from './Bird';
import Bounce from 'react-reveal/Bounce';
import videoBG from './assets/cloudsBG.mp4';

function App() {
  // Set stage for link items
  const [currentStage, setCurrentStage] = useState(null);
  // rotating boolean
  const [isRotating, setIsRotating] = useState(false);
  // Mobile - pc adjustments
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.6, 0.6, 0.6];
      screenPosition = [0, -6.5, -33.4];
    } else {
      screenScale = [0.9, 0.9, 0.9];
      screenPosition = [0, -3.5, -35.4];
    }

    return [screenScale, screenPosition, currentStage];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();

  return (
    <div className="containerG">
      {/* Container Background */}
      <video src={videoBG} autoPlay loop muted>
        {' '}
      </video>
      <h4 className="introH4">Angelos Antoniades Portfolio</h4>
      <div className="introduction">
        <Header />
        <Player />{' '}
        <section className="showcase">
          {currentStage == 1 && (
            <Link style={{ textDecoration: 'none' }} to="/Home">
              {' '}
              <Bounce left>
                <h1 className="introH1">Wonderland iAim</h1>{' '}
              </Bounce>{' '}
              <div className="infoGame">
                <h1>Wonderland Aim(BETA) </h1>
                <p>Do not get overwhelmed by 30 Enemies</p>
                <p>Score as many points as you can</p>
              </div>
            </Link>
          )}
          {currentStage == 2 && (
            <Link style={{ textDecoration: 'none' }} to="/Portfolio">
              {' '}
              <Bounce left>
                <h1 className="introH3">Portfolio</h1>{' '}
              </Bounce>{' '}
              <div className="infoGame">
                <h1>Developer Programmer</h1>
                <p>Explore my portfolio</p>
              </div>
            </Link>
          )}
          {currentStage == null && (
            <h1 className="rotate">
              Rotate the house or tap on the stages (use Arrow keys) <br></br>
              <img src="./img/arrows.png" width="70px" height="70px" />
            </h1>
          )}
        </section>
        <section className="islandCanvas">
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
              <Bird />
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
        </section>
      </div>{' '}
      <div className="thirteen"></div>
    </div>
  );
}
export default App;
