import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Preloader from './components/Preloader';
import Preloader2 from './components/Preloader2';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Preloader />} />
        <Route path="/Home" element={<Preloader2 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
