import React, { useState, useEffect } from 'react';
import correct from './assetsM/correct.mp3';
import achievement from './assetsM/achievement.mp3';
import Header from './Header';
import clickBox from './assetsM/click.mp3';
import GunCursor from './GunCursor';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

function Home() {
  const [alive, setAlive] = useState(false);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(20 * 3);
  const clickAudio = new Audio(correct);
  const highlight1 = new Audio(achievement);
  const targetClick = new Audio(clickBox);
  const [message, setMessage] = useState(null);
  const [highlight, setHighlight] = useState(false);
  const [Health, setTimeHealth] = useState(null);
  const [timeUse, setTimeUse] = useState(null);
  const [countDiv, setCountDiv] = useState(0);
  const handle = useFullScreenHandle();
  const [audio, SetAudio] = useState('');

  // START GAME FUNCTION .. SETS  scores and time Interval & when time passes END BOOLEAN TO end game
  function startGame() {
    const gameInterval = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime === 0 || countDiv === 30) {
          clearInterval(gameInterval);
          setAlive(false);
          setScore(0);
          setRemainingTime(20 * 3);
        }
        return prevTime - 1;
      });
    }, 1000);
  }

  function endGame() {
    document.getElementById('gameContainer').classList.remove('gameContainer');

    setTimeUse(null);
    setTimeHealth(null);
  }

  function startClick() {
    document.getElementById('gameStart').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('gameContainer');
    setAlive(true);
    setRemainingTime(60);
    setCountDiv(null);
  }

  function moveBox(box) {
    const randomX = Math.floor(Math.random() * window.innerWidth);
    const randomY = Math.floor(Math.random() * window.innerHeight);

    box.style.left = `${randomX}px`;
    box.style.top = `${randomY}px`;
  }
  function reloadWindow() {
    window.location.reload(false);
  }

  function removeBox(box) {
    box.remove();
  }
  //INCREASE TIME
  function goTime(x) {
    setRemainingTime(prevTime => prevTime + x);
    setTimeUse(prevTime => prevTime - 1);
    setTimeHealth(prevHealth => prevHealth - 1);
  }
  function spawnBox() {
    const newBox = document.createElement('div');
    newBox.className = 'game-box';
    newBox.textContent = '';
    setTimeout(() => {
      //COUNTING ENEMIES FOR OVERWHELM
      setCountDiv(prevCountDiv => {
        const newCount = prevCountDiv + 1;
        console.log(newCount);

        if (newCount >= 30) {
          setAlive(false);
          console.log(alive);
        }

        return newCount;
      });
    }, 250);

    newBox.onclick = function () {
      removeBox(newBox);
      targetClick.play();
      setTimeout(() => {
        setCountDiv(prevCountDiv => {
          const newCount = prevCountDiv - 1;
          console.log(newCount);

          if (newCount >= 30) {
            setAlive(false);
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
            // SCORE Gain time
          } else if (prevScore === 20) {
            setTimeUse(prevTime => prevTime + 1);
            setTimeHealth(prevHealth => prevHealth + 1);
          } else if (prevScore === 50) {
            setTimeHealth(prevHealth => prevHealth + 1);
            setTimeUse(prevTime => prevTime + 1);
          } else if (prevScore === 110) {
            setTimeHealth(prevHealth => prevHealth + 1);
            setTimeUse(prevTime => prevTime + 1);
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
            setMessage('Aim God');
            setHighlight(true);
            highlight1.play();
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (prevScore == 110) {
            setMessage('GODLIKE');
            setHighlight(true);
            setTimeout(() => {
              setHighlight(false);
              setMessage(null);
            }, 3000);
          } else if (countDiv >= 10) {
            setAlive(false);
            console.log('game ended');
          }
          return prevScore + 1;
        });
      }
    };

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
    let firstInterval, secondInterval, thirdInterval;

    if (alive) {
      startGame();

      // Start spawning new boxes with intervals
      firstInterval = setInterval(spawnBox, 1000);

      setTimeout(() => {
        clearInterval(firstInterval);

        secondInterval = setInterval(spawnBox, 500);

        setTimeout(() => {
          clearInterval(secondInterval);

          thirdInterval = setInterval(spawnBox, 450);

          setTimeout(() => {}, 20000);
        }, 30000);
      }, setRemainingTime);

      return () => {
        if (alive) {
          clearInterval(firstInterval);
          clearInterval(secondInterval);
          clearInterval(thirdInterval);
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
          <header className="boarderScore">
            <h1 className="scoreBoard">Score: {score}</h1>
            <p className="overwhelm">Enemy Overwhelm : {countDiv}</p>
            <p className="overwhelm">Remaining Time: {remainingTime} seconds</p>
            <button className="fullscreen" onClick={handle.enter}>
              <img src="./img/fullscreen.png" width="30px" height="30px" />
            </button>
            {timeUse >= 1 && (
              <div>
                <div id="score">
                  <img src="./img/heart.png" width="30px" height="30px" />
                  {Health}
                </div>
                <div id="tag">Tag Element</div>
                <button className="powerUp" onClick={() => goTime(20)}>
                  Increase Time
                </button>
              </div>
            )}
          </header>
          <div className="container-button">
            <button onClick={startClick} id="gameStart">
              START GAME
            </button>
            {countDiv >= 30 && (
              <button onClick={reloadWindow} id="gameOver">
                GAME OVER
              </button>
            )}

            {score >= 20 && (
              <h1 id="clapH1" className="highlight">
                <span class="fire"> {message} </span>
              </h1>
            )}
            <div id="gameContainer" className="hidden">
              {/* No fixed boxes here */}
            </div>
            <GunCursor />
          </div>
        </div>
      </FullScreen>
    </div>
  );
}

export default Home;
