import React, { useEffect, Suspense, useState } from 'react';
import './css/cardealer.css';
import { Canvas, Environment } from 'react-three-fiber';
import Porche from './Models/Porche';
import slash from './assetsM/slash.mp3';
import { carCard } from './costants/car';
import Header from './Header';
import Lamborghini from './Models/Lamborghini';
import BMW from './Models/BMW';
function Cardealer() {
  const slashSound = new Audio(slash);
  const removeHidden = document.getElementById('carDescHide');
  const [currentStage, setCurrentStage] = useState(null);
  const [cars, setCars] = useState(['Porche', 'Lamborghini', 'BMW']);
  const [chooseCar, setChooseCar] = useState('Porche');
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
  const adjustCarForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [80.3, 80.3, 80.3];
      screenPosition = [-51, -70.5, -175.4];
    } else {
      screenScale = [91.5, 91.5, 91.5];
      screenPosition = [-91, -185.5, -255.4];
    }

    return [screenScale, screenPosition];
  };
  const [carScale, carPosition] = adjustCarForScreenSize();
  const adjustIslandForScreenSize2 = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [80.3, 80.3, 80.3];
      screenPosition = [21, -30.5, -175.4];
    } else {
      screenScale = [101.5, 101.5, 101.5];
      screenPosition = [-11, -140.5, -125.4];
    }

    return [screenScale, screenPosition, currentStage];
  };
  const [islandScale2, islandPosition2] = adjustIslandForScreenSize2();
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
  function carChoice() {
    if (chooseCar === 'Porche') {
      setChooseCar('Lamborghini');
    } else if (chooseCar === 'Lamborghini') {
      setChooseCar('BMW');
    } else {
      setChooseCar('Porche');
    }
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
          <h1 className="akenziH1">Innovation</h1>{' '}
          <p className="akenziP">
            Innovative automations with luxurious interiors
          </p>
          {/* <a href="#section2">
            <img className="imgScroll" src="./img/sd.jpg" />
          </a>{' '} */}
          <div class="dropdown">
            <div class="dropdown-content">
              <br></br>
              <a onClick={carChoice}>{chooseCar}</a>
              <button className="changeCar" onClick={carChoice}>
                <p className="view"> change model</p>
              </button>
            </div>
          </div>
          {chooseCar === cars[0] && (
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
          )}
          {chooseCar === cars[1] && (
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
                <hemisphereLight
                  skyColor="#b1e1ff"
                  groundColor="#0A1D56"
                  intensity={0.5}
                />
                <Lamborghini
                  className="lambo"
                  isRotating={isRotating}
                  setIsRotating={setIsRotating}
                  setCurrentStage={setCurrentStage}
                  position={carPosition}
                  rotation={[-1.6, 0, 6.8]}
                  scale={carScale}
                />
              </Canvas>
            </Suspense>
          )}
          {chooseCar === cars[2] && (
            <Suspense>
              <Canvas>
                <directionalLight position={[2, 53, 13]} intensity={10} />
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 45, 50]} intensity={30} />
                <spotLight
                  position={[10, 0, 0]}
                  angle={Math.PI / 4}
                  penumbra={0.1}
                  intensity={5}
                />
                <hemisphereLight
                  skyColor="#b1e1ff"
                  groundColor="#0A1D56"
                  intensity={1}
                />
                <BMW
                  isRotating={isRotating}
                  setIsRotating={setIsRotating}
                  setCurrentStage={setCurrentStage}
                  position={islandPosition2}
                  rotation={[0.23, -1.0, -6.3]}
                  scale={islandScale2}
                />
              </Canvas>
            </Suspense>
          )}
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
                <div id="carDescHide" className="hidden">
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
      <section id="section4">
        <div className="Contact">
          <div className="copyrights">
            <p>©Akenzi by Angelos Antoniades 2024</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export default Cardealer;
