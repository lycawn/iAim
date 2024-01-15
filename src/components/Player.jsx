import React, { useState, useEffect } from 'react';
import iAmIntro from './assetsM/cstheme.mp3';
function Player() {
  const audio = new Audio(iAmIntro);
  // const toggle = () => setMusic(!music);
  const [music, setMusic] = useState(false);

  function musicPlay() {
    setMusic(!music);
    if (!music) {
      audio.play();
    } else {
      audio.pause();
      window.location.reload(false);
    }
  }

  // useEffect(() => {
  //   setInterval(() => {
  //     if (music == false) {
  //       audio.pause();
  //     } else {
  //       audio.play();
  //     }
  //   }, 1000);
  // }, [music]);

  return (
    <div>
      <button className="musicButton" onClick={musicPlay}>
        {music ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}

export default Player;
