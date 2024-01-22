import React, { useState, useEffect, useRef } from 'react';
import sakura from './assets/last-samurai.mp3';
import { soundoff, soundon } from './assets/icons';
function Player() {
  const audioRef = useRef(new Audio(sakura));
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  audioRef.current.volume = 0.4;
  audioRef.current.loop = false;
  useEffect(() => {
    if (isPlayingMusic) {
      audioRef.current.play();
    }

    return () => {
      audioRef.current.pause();
    };
  }, [isPlayingMusic]);

  return (
    <div>
      <div className="">
        <img
          className="musicButton"
          src={!isPlayingMusic ? soundoff : soundon}
          alt="jukebox"
          onClick={() => setIsPlayingMusic(!isPlayingMusic)}
        />
      </div>{' '}
    </div>
  );
}

export default Player;
