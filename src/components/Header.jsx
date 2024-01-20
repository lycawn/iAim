import React, { useState, useEffect } from 'react';
import Player from './Player';
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chuckNorris, setChuckNorris] = useState([]);
  const iconurl = chuckNorris.icon_url;
  const d = new Date();
  const currentTime = d.toLocaleTimeString;
  // const [weather, setWeather] = useState([]);
  // const weatherIcon = weather?.weather?.[0]?.icon;
  // const iconurl = 'http://openweathermap.org/img/w/' + weatherIcon + '.png';
  const toggleMenu = () => {
    setMenuOpen(prevMenuOpen => !prevMenuOpen);
  };
  // useEffect(() => {
  //   fetch('https://open-weather13.p.rapidapi.com/city/Athens', {
  //     method: 'GET',
  //     headers: {
  //       'X-RapidAPI-Key': 'ac92a4996dmshe8026a968b0cce8p19c6dajsn745a18a85abc',
  //       'X-RapidAPI-Host': 'open-weather13.p.rapidapi.com',
  //     },
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       setWeather(data);
  //       console.log(data);
  //     })
  //     .catch(error => console.log(error));
  // }, []);
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
  }, []);

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
            <a href="/">Home</a>
          </li>
          <li class="item">
            <a href="https://www.buymeacoffee.com/angelosant">Buy me </a>
            <img src="./img/buymecoffee.png" height="60px" width="60px" />
          </li>
        </ul>
        <div className="weather">
          <h1>Daily chuck Norris joke</h1>
          {chuckNorris.value?.length > 0 && (
            <p>
              {chuckNorris.value} <p>{currentTime}</p>
              <img src={iconurl} />
            </p>
          )}
          {/* <h1>{weather.name}</h1>
          {weather.weather?.length > 0 && (
            <p>Temperature: {weather?.main.temp}</p>
          )}{' '}
          {weather.weather?.length > 0 && (
            <p>Clouds : {weather.weather[0]?.description}</p>
          )}{' '}
           */}{' '}
        </div>
      </nav>
    </div>
  );
}

export default Header;
