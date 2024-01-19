import React, { useEffect, useState, useRef } from 'react';
import './mathsurviva.css';
import { questions } from './Mathgame/questions';
import './button.scss';
import Header from './Header';
function Mathsurvival() {
  const [quest, setQuestions] = useState([]);
  const [questLevel, setQuestLevel] = useState(0);
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState('');
  const getCorrect = document.getElementById('correct');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(100);
  const [alive, setAlive] = useState(false);

  const startGame = () => {
    setAlive(true);
  };

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
      setAlive(true);
    } else {
      setCorrect('Incorrect');
      setTimeout(() => {
        getCorrect.style.backgroundColor = '#FF6868';
        setTimeout(() => {
          getCorrect.style.backgroundColor = '#fafafa';
        }, 800);
      }, 100);
    }
    setAlive(true);

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
    }
    // Start the timer after 0 milliseconds (immediately)
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
      </div>
    </div>
  );
}
export default Mathsurvival;
