import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from 'react-three-fiber';
import Boxer from './Models/Boxer';
import Guitarist from './Models/Guitarist';
import { hobbies } from './hobbies/hobbyExport';
import Book from './Models/Book';
function Header() {
  const [chuckNorris, setChuckNorris] = useState([]);
  const [learnAbout, setLearnAbout] = useState(0);
  const [hobby, setHobby] = useState([]);
  const iconurl = chuckNorris.icon_url;
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Add state for menu open/close
  const d = new Date();
  const currentTime = d.toLocaleTimeString;
  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [10.6, 10.6, 10.6];
      screenPosition = [0, -6.5, -33.4];
    } else {
      screenScale = [110.9, 110.9, 110.9];
      screenPosition = [0, -3.5, -35.4];
    }

    return [screenScale, screenPosition];
  };

  // Learn about me function
  function learnAboutMe() {
    // Reset learnAbout when it reaches the maximum value
    setLearnAbout(prevLearnAbout =>
      prevLearnAbout === hobbies.length - 1 ? 0 : prevLearnAbout + 1
    );
  }

  const currentHobby = hobbies[learnAbout];

  useEffect(() => {
    fetch(
      'https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com/jokes/random',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key':
            'ac92a4996dmshe8026a968b0cce8p19c6dajsn745a18a85abc',
          'X-Rapid-Host': 'matchilling-chuck-norris-jokes-v1.p.rapidapi.com',
        },
      }
    )
      .then(response => response.json())
      .then(data => {
        setChuckNorris(data);
        console.log(data);
      })
      .catch(error => console.log(error));
    // Event listener for 'M' key press
    const handleKeyPress = event => {
      if (event.key === 'm' || event.key === 'M') {
        setIsMenuOpen(!isMenuOpen);
      }
    };

    // Attach the event listener when the component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Detach the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isMenuOpen]);

  return (
    <div>
      <input type="checkbox" id="navi-toggle" class="checkbox" />
      <label for="navi-toggle" class="button">
        <span class="icon">&nbsp;</span>
      </label>
      <div class="background">&nbsp;</div>

      <nav class="nav">
        <ul class="list">
          <li class="item">
            <Link to="/">Home</Link>
          </li>
          <li class="item">
            <Link to="https://www.buymeacoffee.com/angelosant">Buy me </Link>
            <img src="./img/coffee.png" height="60px" width="60px" />
          </li>
          <li className="item">
            <Link to="/Wonderland-aim">Wonderland aim</Link>
          </li>
          <li className="item">
            <Link to="/Portfolio">Portfolio</Link>
          </li>
          <li className="item">
            <Link to="/Math-survival">Math-survival</Link>
          </li>
          <li className="item">
            <Link to="/Contact">Get In Contact </Link>
          </li>
        </ul>
        <div className="weather">
          <h1>Daily chuck Norris joke</h1>
          {chuckNorris.value?.length > 0 && <p>{chuckNorris.value}</p>}
          <p>{currentTime}</p>
        </div>
        <div className="hobbies">
          <div>
            <h1>{currentHobby ? currentHobby.hobby : ''} </h1>
          </div>
          <button className="start-btn2" onClick={learnAboutMe}>
            Learn about me
          </button>
          <section className="hobbiesShow">
            {learnAbout == 0 && (
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
                  <Boxer />
                </Canvas>
              </Suspense>
            )}
            {learnAbout == 1 && (
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
                  <Guitarist />
                </Canvas>
              </Suspense>
            )}
            {learnAbout == 2 && (
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
                  <Book />
                </Canvas>
              </Suspense>
            )}
          </section>
        </div>
      </nav>
    </div>
  );
}

export default Header;
