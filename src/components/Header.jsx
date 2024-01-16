import React, { useState } from 'react';
import Player from './Player';
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prevMenuOpen => !prevMenuOpen);
  };

  return (
    <div>
      <div
        className={`burger-icon ${menuOpen ? 'open' : 'X'}`}
        onClick={toggleMenu}
      >
        <div className="bar1"> </div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      <nav className={`menu ${menuOpen ? 'open' : 'X'}`}>
        <a href="/">Home</a>

        <a href="#">Contact</a>
        <a href="https://www.buymeacoffee.com/angelosant">
          Buy me <img src="./img/buymecoffee.png" height="30px" width="30px" />
        </a>
        <Player />
      </nav>
    </div>
  );
}

export default Header;
