import { Link, useNavigate } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
import Player from './Player';
import Header from './Header';
import { Canvas } from '@react-three/fiber';
import Island from './Models/Island';
import Bird from './Bird';
import Bounce from 'react-reveal/Bounce';
import videoBG from './assets/cloudsBG.mp4';
import nightBG from './assets/night.mp4';
import './button.scss';
import { isPowerOfTwo } from 'three/src/math/MathUtils';

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
  const navigate = useNavigate();

  const onEnter = e => {
    if (currentStage === 1) {
      navigate('/Home');
    } else if (currentStage === 2) {
      navigate('/Portfolio');
    } else if (currentStage === 3) {
      navigate('/Math-survival');
    }
  };

  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  // AUTOMATIC DAY AND NIGHT CYCLE SET
  const d = new window.Date();
  let currentTime = d.toLocaleTimeString();
  const [time, setTime] = useState(currentTime);
  const [night, isnight] = useState(false);
  const [cycle, setCycle] = useState('');
  const cycleTime = d.getHours();
  let [toggleIsNot, setToggleIsNot] = useState(true);
  setInterval(updateTime, 500);
  function updateTime(event) {
    let newTime = new Date().toLocaleTimeString();
    setTime(newTime);
  }

  //  NIGHT DAY TOGGLE

  let DayNight = videoBG;
  if (!night) {
    DayNight = videoBG;
  } else {
    DayNight = nightBG;
  }

  function toggle() {
    if (!night) {
      isnight(true);
    } else {
      isnight(false);
    }
  }
  //  CYCLE Function
  function dayCycle() {
    if (toggleIsNot) {
      if (cycleTime > 6 && cycleTime < 17) {
        isnight(false);
        setCycle('Day');
        setToggleIsNot(false);
      } else if (cycleTime > 16 && cycleTime < 21) {
        isnight(false);
        setCycle('Day');
        setToggleIsNot(false);
      } else {
        isnight(true);
        setCycle('Night');
        setToggleIsNot(false);
      }
    }
  }
  setTimeout(() => {
    let intervalTime = setInterval(dayCycle, 500);
    setTimeout(() => {
      clearInterval(intervalTime);
    }, 500);
  });

  useEffect(() => {
    const handleKeyPress = event => {
      if (event.key === 'Enter') {
        onEnter();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  return (
    <div className="containerG">
      {/* Container Background */}

      {/* sass button */}
      <div className="introduction">
        <Bounce left>
          <video
            src={DayNight}
            autoPlay
            loop
            muted
            alt="./img/home.jpg"
          ></video>
        </Bounce>
        <div class="toggleWrapper">
          <input type="checkbox" checked={night} className="dn" id="dn" />
          <label for="dn" className="toggle" onClick={toggle}>
            <span class="toggle__handler">
              <span class="crater crater--1"></span>
              <span class="crater crater--2"></span>
              <span class="crater crater--3"></span>
            </span>
            <span class="star star--1"></span>
            <span class="star star--2"></span>
            <span class="star star--3"></span>
            <span class="star star--4"></span>
            <span class="star star--5"></span>
            <span class="star star--6"></span>
          </label>
        </div>
        <Player /> <Header />
        <section className="showcase">
          {currentStage == 1 && (
            <form onSubmit={onEnter}>
              <Link style={{ textDecoration: 'none' }} to="/Home">
                <Bounce down>
                  <h1 className="introH1">Wonderland iAim</h1>
                </Bounce>
                <div className="infoGame">
                  <h1>Wonderland Aim(BETA) </h1>
                  <p>Do not get overwhelmed by 30 Enemies</p>
                  <p>Score as many points as you can</p>
                </div>
              </Link>
            </form>
          )}
          {currentStage == 2 && (
            <form onSubmit={onEnter}>
              <Link style={{ textDecoration: 'none' }} to="/Portfolio">
                <Bounce down>
                  <h1 className="introH3">Portfolio</h1>{' '}
                </Bounce>{' '}
                <div className="infoGame">
                  <h1>Developer Programmer</h1>
                  <p>Explore my portfolio</p>
                </div>
              </Link>
            </form>
          )}
          {currentStage == 3 && (
            <form onSubmit={onEnter}>
              <Link style={{ textDecoration: 'none' }} to="/Math-survival">
                <Bounce down>
                  <h1 className="introH5">Math Survival Game</h1>{' '}
                </Bounce>{' '}
                <div className="infoGame">
                  <h3>Brain power</h3>
                  <p>Increase your survival time as you play & score</p>
                </div>
              </Link>
            </form>
          )}
          {currentStage == null && (
            <h1 className="rotate">
              <img src="./img/arrows.png" width="70px" height="70px" />{' '}
              <br></br>
              Rotate the house or tap on the stages (use Arrow keys) <br></br>{' '}
              <h4 className="introH4">Angelos Antoniades Portfolio </h4>
            </h1>
          )}
        </section>
        <section className="islandCanvas">
          <Suspense>
            <Canvas>
              <directionalLight position={[1, 1, 1]} intensity={2} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 5, 10]} intensity={2} />
              <spotLight
                position={[0, 50, 10]}
                angle={0.15}
                penumbra={11}
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
      </div>
    </div>
  );
}
export default App;
