import React from 'react';
import ReactDOM from 'react-dom';
import Preloader from './components/Preloader';
import Preloader2 from './components/Preloader2';
import Preloader3 from './components/Preloader3';
import Preloader4 from './components/Preloader4';
import Mathsurvival from './components/Mathsurvival';
import Contact from './components/Contact';
import Player from './components/Player';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cardealer from './components/Cardealer';

ReactDOM.render(
  <React.StrictMode>
    <Player />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Preloader />} />
        <Route path="/Wonderland-aim" element={<Preloader2 />} />
        <Route path="/Portfolio" element={<Preloader3 />} />
        <Route path="/Math-survival" element={<Mathsurvival />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/car-dealership" element={<Preloader4 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
