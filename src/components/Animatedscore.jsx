import React, { useState, useEffect } from 'react';

const ScoreAnimation = () => {
  const [score, setScore] = useState(0);

  const go = x => {
    let startTime;

    const animate = timestamp => {
      if (!startTime) startTime = timestamp;

      const progress = timestamp - startTime;

      if (progress < 1000) {
        const animatedScore = Math.floor((x / 1000) * progress);
        setScore(animatedScore);
        requestAnimationFrame(animate);
      } else {
        setScore(prevScore => prevScore + x);
      }
    };

    requestAnimationFrame(animate);
  };

  const fadeInOutTag = () => {
    const tagElement = document.getElementById('tag');
    tagElement.style.transition = 'top 0.7s linear';

    tagElement.style.top = '-55px';
    setTimeout(() => {
      tagElement.style.top = '-110px';
    }, 700);
  };

  const handleButtonClick = () => {
    go(50); // You can change the score value as needed
    fadeInOutTag();
  };

  return (
    <div>
      <div id="score">{score}</div>
      <button onClick={handleButtonClick}></button>
      <div id="tag">Tag Element</div>\
    </div>
  );
};

export default ScoreAnimation;
