import React, { useState, useEffect, useRef, Suspense } from 'react';
import correct from './assetsM/correct.mp3';
import achievement from './assetsM/achievement.mp3';
import Header from './Header';
import clickBox from './assetsM/click.mp3';
import mews from './assetsM/kittyClick.mp3';
import Meow from './assetsM/meow.mp3';
import shocking from './assetsM/shocked.mp3';
import GunCursor from './GunCursor';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import powerUps from './assetsM/powerUp.mp3';
import { Canvas, useFrame } from '@react-three/fiber';
import Island from './Island';
import Player from './Player';
import Bounce from 'react-reveal/Bounce';
import './styles.css';
import GhostKitty from './GhosKitty';
function Home() {
  const [alive, setAlive] = useState(false);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(20 * 3);
  const clickAudio = new Audio(correct);
  const highlight1 = new Audio(achievement);
  const shocked = new Audio(shocking);
  const targetClick = new Audio(clickBox);
  const Mew = new Audio(mews);
  const [message, setMessage] = useState(null);
  const [highlight, setHighlight] = useState(false);
  const [Health, setTimeHealth] = useState(0);
  const [timeUse, setTimeUse] = useState(null);
  const [countDiv, setCountDiv] = useState(0);
  const handle = useFullScreenHandle();
  const [audio, SetAudio] = useState('');
  const powerUpSound = new Audio(powerUps);
  const [gameOver, setGameOver] = useState(false);
  const [kittyClicked, setKittyClicked] = useState(false);
  const [luckScore, setLuckScore] = useState(0);
  const catAppear = new Audio(Meow);
  //GET ELEMENT
  const getScoreElement = document.getElementById('overwhelms');
  // START GAME FUNCTION .. SETS  scores and time Interval & when time passes END BOOLEAN TO end game

  function startGame() {
    const gameInterval = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime === 0 || countDiv >= 30) {
          clearInterval(gameInterval);
          setAlive(false);
          setTimeHealth(null);
          setGameOver(false);
          setScore(0);
        }
        return prevTime - 1;
      });
    }, 1000);
  }
  // 3D THREE.JS
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.7, 0.7, 0.7];
      screenPosition = [0, -6.5, -43.4];
    } else {
      screenScale = [0.7, 0.7, 0.7];
      screenPosition = [0, -6.5, -43.4];
    }

    return [screenScale, screenPosition];
  };
  const [islandScale, islandPosition] = adjustIslandForScreenSize();
  function luckScoring() {
    if (kittyClicked === true) {
      document.getElementById('ghostKitty').classList.remove('hidden');
    }
    return luckScore;
  }
  function kittySpawn() {
    setLuckScore(() => {
      const randomValue = Math.floor(Math.random() * 300) + 1;
      console.log('Random Number:', randomValue);

      if (randomValue >= 290 && !kittyClicked) {
        setKittyClicked(true);
        catAppear.volume = 0.2;
        catAppear.play(); // mew sound

        Mew.play();
      }

      return randomValue;
    });
  }
  function endGame() {
    document.getElementById('gameContainer').classList.remove('gameContainer');
    setGameOver(true);
    setTimeUse(null);
    setTimeHealth(null);
    setRemainingTime(0);
  }

  function startClick() {
    document.getElementById('gameStart').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('gameContainer');
    setAlive(true);
    setRemainingTime(60);
    setCountDiv(null);
  }
  function kittyClick() {
    setKittyClicked(false);
    setLuckScore(0);
    if (kittyClicked) {
      setMessage('+10 Health');
      setHighlight(true);
      setTimeout(() => {
        setHighlight(false);
        setMessage(null);
      }, 3000);
    }
    setTimeHealth(prevHealth => prevHealth + 10);
    document.getElementById('ghostKitty').classList.add('hidden');
  }
  function moveBox(box) {
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
      const containerRect = gameContainer.getBoundingClientRect();
      const randomX = Math.floor(Math.random() * (containerRect.width - 50));
      const randomY = Math.floor(Math.random() * (containerRect.height - 50));
      box.style.left = `${randomX}px`;
      box.style.top = `${randomY}px`;
    }
  }
  function reloadWindow() {
    window.location.reload(false);
  }

  function removeBox(box) {
    box.remove();
  }

  //INCREASE TIME
  function goTime() {
    setRemainingTime(prevTime => prevTime + 20);
    setTimeUse(prevTime => prevTime - 1);
    setTimeHealth(prevHealth => prevHealth - 10);
    // makes css Green time
  }
  //  BUYING TIME
  function buyTime() {
    if (Health >= 10) {
      shocked.play();
      goTime();
      getScoreElement.classList.add('greenTime');
      setTimeout(() => {
        getScoreElement.classList.remove('greenTime');
      }, 1800);
    } else {
      console.log('error');
    }
  }
  function spawnBox() {
    const newBox = document.createElement('div');

    if (alive) {
      newBox.className = 'game-box';

      // Create an img element
      const img = document.createElement('img');

      // Define an array of image URLs
      const imageUrls = [
        '/img/target4.png',
        '/img/target4.png',
        '/img/target3.png',
      ]; // Add more image URLs as needed

      // Randomly select an image URL
      const randomImageUrl =
        imageUrls[Math.floor(Math.random() * imageUrls.length)];
      img.width = 100;
      img.height = 100;

      // Set the src attribute to the randomly selected image URL
      img.src = randomImageUrl;

      // Append the img element to the newBox
      newBox.appendChild(img);
    }

    // newBox.className = 'game-box2';
    // newBox.id = 'gameBox';
    // newBox.textContent = '';

    setTimeout(() => {
      //COUNTING ENEMIES FOR OVERWHELM
      setCountDiv(prevCountDiv => {
        const newCount = prevCountDiv + 1;

        if (newCount >= 30) {
          setTimeHealth(prevHealth => prevHealth - 1);
          if (newCount => 30 && Health <= 0) {
            setAlive(false);
            setGameOver(true);
          }
        }

        return newCount;
      });
    }, 250);

    newBox.onclick = function () {
      removeBox(newBox);
      targetClick.play();
      kittySpawn();
      setTimeout(() => {
        setCountDiv(prevCountDiv => {
          const newCount = prevCountDiv - 1;

          if (newCount >= 30) {
            setAlive(false);
            setGameOver(true);
            setRemainingTime(0);
            console.log(alive);
          }

          return newCount;
        });
      }, 250);

      // Check if the clicked box is labeled as ''
      if (newBox.textContent === '') {
        setScore(prevScore => {
          if ((prevScore + 1) % 10 === 0) {
            clickAudio.play();
            setRemainingTime(prevTime => prevTime + 2);
            getScoreElement.classList.add('greenTime');
            setTimeout(() => {
              getScoreElement.classList.remove('greenTime');
            }, 1800);

            // SCORE Gain time
          } else if (prevScore === 20) {
            setTimeHealth(prevHealth => prevHealth + 1);
          } else if (prevScore === 50) {
            setTimeHealth(prevHealth => prevHealth + 1);
          } else if (prevScore === 110) {
            setTimeHealth(prevHealth => prevHealth + 1);
          } else if (prevScore === 160) {
            setTimeHealth(prevHealth => prevHealth + 1);
          } else if (prevScore === 200) {
            setTimeHealth(prevHealth => prevHealth + 2);
          }
          // HIGHLIGHTS

          if (prevScore == 20) {
            setMessage('Nice Aim');
            setHighlight(true);
            highlight1.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (prevScore == 50) {
            setMessage('SNIPER');
            setHighlight(true);
            highlight1.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (prevScore == 110) {
            setMessage('AIM MASTER');
            setHighlight(true);
            powerUpSound.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (prevScore == 160) {
            setMessage('AIM GOD');
            setHighlight(true);
            powerUpSound.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (prevScore == 200) {
            setMessage('GOODLIKE');
            setHighlight(true);
            powerUpSound.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (countDiv >= 30) {
            setAlive(false);
            console.log('game ended');
          }
          return prevScore + 1;
        });
      }
    };

    //random Spawning
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
      const containerRect = gameContainer.getBoundingClientRect();
      const randomX = Math.floor(Math.random() * (containerRect.width - 50));
      const randomY = Math.floor(Math.random() * (containerRect.height - 50));

      newBox.style.left = `${randomX}px`;
      newBox.style.top = `${randomY}px`;

      gameContainer.appendChild(newBox);
      moveBox(newBox);
    } else {
      console.error("Element with ID 'gameContainer' not found");
    }
  }

  useEffect(() => {
    let firstInterval, secondInterval, thirdInterval, fourthInterval;

    if (alive) {
      startGame();

      // Start spawning new boxes with intervals
      firstInterval = setInterval(spawnBox, 1000);

      if (alive) {
        //CHECKING EVERY STATE FOR ALIVE
        setTimeout(() => {
          clearInterval(firstInterval);

          secondInterval = setInterval(spawnBox, 750);
          if (alive) {
            setTimeout(() => {
              clearInterval(secondInterval);

              thirdInterval = setInterval(spawnBox, 650);
              if (alive) {
                setTimeout(() => {
                  if (alive) {
                    setTimeout(() => {
                      clearInterval(thirdInterval);

                      fourthInterval = setInterval(spawnBox, 450);
                      setTimeout(() => {}, 20000);
                    }, 20000);
                  }
                }, 20000);
              }
            }, 20000);
          }
        }, remainingTime);
      }

      return () => {
        if (alive) {
          clearInterval(firstInterval);
          clearInterval(secondInterval);
          clearInterval(thirdInterval);
          clearInterval(fourthInterval);
        }
      };
    } else {
      endGame();
    }
  }, [alive]);

  return (
    <div>
      {' '}
      <FullScreen handle={handle}>
        <Header />

        <div className="container">
          {' '}
          <button className="fullscreen1" onClick={handle.enter}>
            Full Screen<br></br>
            <img
              src="./img/fullscreen.png"
              width="30px"
              height="30px"
              textContent="FULL SCREEN"
            />
          </button>
          <header className="boarderScore">
            {score >= 110 && score <= 160 && (
              <img className="sayan" src="./img/sayan.gif" />
            )}
            {score >= 160 && <img className="sayan2" src="./img/sayan2.gif" />}
            <h1 className="scoreBoard">Score: {score}</h1>
            <p className="overwhelm">Enemy Overwhelm : {countDiv}</p>
            <p id="overwhelms" className="overwhelm">
              Remaining Time: {remainingTime} seconds
            </p>
            <div id="score">
              <img src="./img/heart.png" width="30px" height="30px" />
              {Health}
            </div>

            {alive && (
              <div>
                <div id="tag">Tag Element</div>
                <button className="powerUp" onClick={buyTime}>
                  Increase Time Duration Buy(10){' '}
                  <img src="./img/heart.png" width="30px" height="30px" />
                </button>
              </div>
            )}
          </header>
          <div className="container-button">
            {' '}
            <Player />
            <button onClick={startClick} id="gameStart">
              START GAME
            </button>
            {!gameOver && (
              <button onClick={reloadWindow} id="gameOver">
                GAME OVER
              </button>
            )}
            {score >= 20 && (
              <h1 id="clapH1" className="highlight">
                <span class="fire"> {message} </span>
              </h1>
            )}{' '}
            {kittyClicked && (
              <Bounce>
                <section onClick={kittyClick} id="ghostKitty">
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
                </section>
              </Bounce>
            )}
            <div id="gameContainer" className="hidden">
              {' '}
              <Player />
            </div>
            <GunCursor />
          </div>
        </div>
      </FullScreen>
    </div>
  );
}

export default Home;
