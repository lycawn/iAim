import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Player from './Player';
import Header from './Header';
function App() {
  return (
    <div className="containerG">
      <Header />
      <div className="introduction">
        <Link to="/Home">
          <h1 className="introH1">iAim</h1>
        </Link>
        <Link to="/JupiterGame">
          <h1 className="introH2">Jupiter</h1>
        </Link>
      </div>
      <h4 className="introH4">a calming journey to master your reflexes.</h4>{' '}
      <div className="thirteen">
        <h1>LYCAWN</h1>
      </div>
    </div>
  );
}
export default App;
