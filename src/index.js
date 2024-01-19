import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Preloader from './components/Preloader';
import Preloader2 from './components/Preloader2';
import Preloader3 from './components/Preloader3';
import Mathsurvival from './components/Mathsurvival';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Preloader />} />
        <Route path="/Home" element={<Preloader2 />} />
        <Route path="/Portfolio" element={<Preloader3 />} />
        <Route path="/Math-survival" element={<Mathsurvival />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
