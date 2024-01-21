import React, { useEffect, useState, useRef } from 'react';
import './css/mathsurviva.css';
import { questions } from './Mathgame/questions';
import './css/button.scss';
import Header from './Header';
import Bounce from 'react-reveal';
function Mathsurvival() {
  const [quest, setQuestions] = useState([]);
  const [questLevel, setQuestLevel] = useState(Math.floor(Math.random() * 17));
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState('');
  const getCorrect = document.getElementById('correct');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(100);
  const [alive, setAlive] = useState(false);
  const [remainingLife, setRemainingLife] = useState([1, 2, 3]);
  const [streak, setStreak] = useState(0);
  const removeHidden = document.getElementById('answer-help');
  const startGame = () => {
    setAlive(true);
    setScore(0);
    setTimer(100);
    setCorrect('');
  };

  // PREVENTATION OF DEFAULT FORM BEHAVIOR
  const handleSubmit = event => {
    event.preventDefault();
    handleButtonClick();
  };
  // endGame Function
  function endGame() {
    if (remainingLife.length <= 1 || timer <= 0) {
      setAlive(false);
      setTimer(0);
      setRemainingLife([1, 2, 3]);
      setStreak(0);
      setCorrect('Game Over');
    } else {
      console.log('Hehe');
    }
  }

  //  BUTTON FUNCTIONS
  const handleButtonClick = () => {
    if (answer == questions[questLevel].answer) {
      setStreak(prevStreak => prevStreak + 1);
      setCorrect('Correct');
      setAnswer('');
      setQuestLevel(Math.floor(Math.random() * quest.length)); //
      setTimeout(() => {
        getCorrect.style.backgroundColor = '#c1f2b0';
        setTimeout(() => {
          getCorrect.style.backgroundColor = '#fafafa';
        }, 800);
      }, 100);
      setScore(prevScore => prevScore + 10);
    } else {
      setCorrect('Incorrect');
      endGame();
      setStreak(0);
      setAnswer('');
      setRemainingLife(prevRemainingLife => prevRemainingLife.slice(0, -1));
      setQuestLevel(Math.floor(Math.random() * quest.length)); //
      setTimeout(() => {
        getCorrect.style.backgroundColor = '#FF6868';
        setTimeout(() => {
          getCorrect.style.backgroundColor = '#fafafa';
        }, 800);
      }, 100);
    }

    // console.log(remainingLife.length, 'remaining lifes');
    // console.log("User's Answer:", answer);
    // console.log('Correct Answer:', questions[questLevel].answer);
  };

  function revealAnswer() {
    removeHidden.classList.remove('hidden');
    setStreak(0);
    setTimeout(() => {
      removeHidden.classList.add('hidden');
    }, 2000);
  }
  useEffect(() => {
    if (alive) {
      const questionTexts = questions.map(question => question.question);
      setQuestions(questionTexts);

      setTimeout(() => {
        const timerInterval = setInterval(() => {
          setTimer(prevTimer => prevTimer - 1);
        }, 1000);

        setTimeout(() => {
          clearInterval(timerInterval);
        }, 990000);
      }, 0);
      const handleKeyPress = event => {
        if (event.key === 'Enter') {
          handleButtonClick();
        }
      };

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    } else {
      endGame();
    }
  }, [alive]);

  return (
    <div id="correct" class="game-container">
      <Header />{' '}
      <div class="game-element" style={{ top: '40px', left: '35px' }}>
        <h1>Math Survival</h1>
        <p className="hard">hard</p>
      </div>
      <Bounce down>
        {' '}
        {alive ? (
          <form onSubmit={handleSubmit}>
            <h1 className="question">{quest[questLevel]} = ? </h1>

            <input
              type="text"
              id="userInput"
              placeholder="Enter your answer..."
              value={answer}
              className="wrapper"
              onChange={e => setAnswer(e.target.value)}
            />
            <button className="buttonSub" type="submit">
              <p>Submit answer</p>
            </button>
          </form>
        ) : (
          <button className="buttonSub" type="button" onClick={startGame}>
            Start Game
          </button>
        )}
        <div className="game-area">
          <h1>{correct}</h1>
        </div>
        <div class="scoreboard">
          {streak >= 3 && (
            <button className="start-btn" onClick={revealAnswer}>
              Equation Help{' '}
            </button>
          )}

          <h3 id="answer-help" className="hidden">
            {questions[questLevel].answer}
            <img src="./img/clippy-put.gif" width="50px" height="50px" />
          </h3>

          <h2>
            Score:{' '}
            <span className="correct" id="score">
              {score}
            </span>
          </h2>

          <p className="timer">
            <span>
              Timer : {timer}
              {streak >= 1 && <h4>Streak:{streak}</h4>}
            </span>
          </p>
          {remainingLife.map(remainingLifes => (
            <img
              className="hearts"
              src="./img/heart.png"
              width="50px"
              height="50px"
            />
          ))}
        </div>
      </Bounce>
    </div>
  );
}
export default Mathsurvival;
