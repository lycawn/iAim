import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Preloader from './components/Preloader';
import Preloader2 from './components/Preloader2';
import Preloader3 from './components/Preloader3';
import Mathsurvival from './components/Mathsurvival';
import Contact from './components/Contact';
import Player from './components/Player';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Player />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Preloader />} />
        <Route path="/Home" element={<Preloader2 />} />
        <Route path="/Portfolio" element={<Preloader3 />} />
        <Route path="/Math-survival" element={<Mathsurvival />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
