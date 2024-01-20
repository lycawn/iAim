import React, { useEffect, useState, useRef } from 'react';
import './mathsurviva.css';
import { questions } from './Mathgame/questions';
import './button.scss';
import Header from './Header';
import { c } from './icons';
function Mathsurvival() {
  const [quest, setQuestions] = useState([]);
  const [questLevel, setQuestLevel] = useState(Math.floor(Math.random() * 17));
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState('');
  const getCorrect = document.getElementById('correct');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [alive, setAlive] = useState(false);
  const [remainingLife, setRemainingLife] = useState([1, 2, 3]);
  const startGame = () => {
    setAlive(true);
    setScore(0);
    setTimer(60);
    setCorrect('');
  };
  // endGame Function
  function endGame() {
    if (remainingLife.length <= 1 || timer <= 0) {
      setAlive(false);
      setTimer(0);
      setRemainingLife([1, 2, 3]);
      setCorrect('Game Over');
    } else {
      console.log('Hehe');
    }
  }

  //  BUTTON FUNCTIONS
  const handleButtonClick = () => {
    if (answer == questions[questLevel].answer) {
      setCorrect('Correct');
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
      setRemainingLife(prevRemainingLife => prevRemainingLife.slice(0, -1));
      setQuestLevel(Math.floor(Math.random() * quest.length)); //
      setTimeout(() => {
        getCorrect.style.backgroundColor = '#FF6868';
        setTimeout(() => {
          getCorrect.style.backgroundColor = '#fafafa';
        }, 800);
      }, 100);
    }
    console.log(remainingLife.length, 'remaining lifes');
    console.log("User's Answer:", answer);
    console.log('Correct Answer:', questions[questLevel].answer);
  };

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
        }, 60000);
      }, 0);
    } else {
      endGame();
    }
  }, [alive]);
  console.log(quest);
  return (
    <div id="correct" class="game-container">
      {' '}
      <Header />
      <form>
        <h1>{quest[questLevel]} = ?</h1>
        <input
          type="text"
          id="userInput"
          placeholder="Enter your answer..."
          value={answer}
          className="wrapper"
          onChange={e => setAnswer(e.target.value)}
        />
      </form>
      {alive ? (
        <button className="buttonSub" type="button" onClick={handleButtonClick}>
          <p>Submit answer</p>
        </button>
      ) : (
        <button className="buttonSub" type="button" onClick={startGame}>
          Start Game
        </button>
      )}
      <div className="game-area">
        <h1>{correct}</h1>
        <div class="game-element" style={{ top: '40px', left: '35px' }}>
          <h1>Math Survival</h1>
          <p className="hard">hard</p>
        </div>
      </div>
      <div class="scoreboard">
        <h2>
          Score:{' '}
          <span className="correct" id="score">
            {score}
          </span>
        </h2>
        <p className="timer">
          <span>Timer : {timer}</span>
        </p>
        {remainingLife.map(remainingLifes => (
          <img src="./img/heart.png" width="50px" height="50px" />
        ))}
      </div>
    </div>
  );
}
export default Mathsurvival;
