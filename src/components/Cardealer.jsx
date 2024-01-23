import React, { useEffect, Suspense, useState } from 'react';
import './css/cardealer.css';
import { Canvas } from 'react-three-fiber';
import Porche from './Models/Porche';
import slash from './assetsM/slash.mp3';
import { carCard } from './costants/car';
import Header from './Header';
function Cardealer() {
  const slashSound = new Audio(slash);
  const removeHidden = document.getElementById('carDescHide');
  const [currentStage, setCurrentStage] = useState(null);
  // rotating boolean
  const [isRotating, setIsRotating] = useState(false);
  // Mobile - pc adjustments
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [80.3, 80.3, 80.3];
      screenPosition = [21, -30.5, -175.4];
    } else {
      screenScale = [101.5, 101.5, 101.5];
      screenPosition = [-11, -30.5, -175.4];
    }

    return [screenScale, screenPosition, currentStage];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowDown') {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      } else if (event.key === 'ArrowUp') {
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      }
    };

    // Attach the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Detach the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  function slasher() {
    slashSound.play();
  }
  function hiddenRemover() {
    removeHidden.classList.remove('hidden');
  }
  function addHidden() {
    removeHidden.classList.add('hidden');
  }
  return (
    <div className="dealerBody">
      <div className="Header">
        {' '}
        <a href="#Porche">
          {' '}
          <section class="wrapper">
            <div class="top">AKENZI</div>
            <div onMouseOver={slasher} class="bottom" aria-hidden="true">
              AKENZI
            </div>
          </section>
        </a>{' '}
        <section id="Porche" className="porche">
          <h1 className="akenziH1">Innovation</h1>
          <p className="akenziP">
            Innovative automations with luxurious interiors
          </p>
          <a href="#section2">
            <img className="imgScroll" src="./img/sd.jpg" />
          </a>
          <Suspense>
            <Canvas>
              <directionalLight position={[3, 5, 5]} intensity={6.5} />
              <ambientLight intensity={2.5} />
              <pointLight position={[20, 25, 30]} intensity={2} />
              <spotLight
                position={[10, 0, 0]}
                angle={1.15}
                penumbra={2}
                intensity={5}
              />
              {/* <hemisphereLight
                skyColor="#b1e1ff"
                groundColor="#0A1D56"
                intensity={0.5}
              /> */}
              <Porche
                isRotating={isRotating}
                setIsRotating={setIsRotating}
                setCurrentStage={setCurrentStage}
                position={islandPosition}
                rotation={[0.03, -1.0, -6.3]}
                scale={islandScale}
              />
            </Canvas>
          </Suspense>
        </section>
      </div>
      <div>
        <section id="section2">
          <div className="s2Bg">
            <div className="grid-car">
              {' '}
              <h1 className="akenziH2">Services & Technologies</h1>
              <div class="image-grid">
                {' '}
                <div class="grid-item">
                  <img src="./img/service.png" alt="Image 1" />
                  <p className="akenziP">Tuning </p>
                </div>
                <div class="grid-item">
                  <img src="./img/big-data.png" alt="Image 1" />
                  <p className="akenziP">Interigated new systems chips</p>
                </div>
                <div class="grid-item">
                  <img src="./img/migration.png" alt="Image 1" />
                  <p className="akenziP">Functionality provsioning</p>
                </div>
              </div>
            </div>{' '}
          </div>
          <p className="akenziP2">Car Dealership website under construction </p>
        </section>
        <br></br>
        <br></br>
        <Header />
        <section id="section3">
          <div className="new-orders">
            <h1 className="akenziH1">DEALERSHIP</h1>
            {carCard.map(carCards => (
              <div className="grid-order">
                <img
                  className="carImg"
                  src={carCards.imgCar}
                  width="250px"
                  height="150px"
                />
                <h1 className="akenziH2">{carCards.name}</h1>
                <div id="carDescHide" className="">
                  <description className="carDesc">
                    <div class="carDescContent">
                      <p className="akenziP3">{carCards.description}</p>
                    </div>
                  </description>
                </div>
                <div className="price"> {carCards.price}</div>
              </div>
            ))}
          </div>
        </section>
      </div>{' '}
    </div>
  );
}
export default Cardealer;
