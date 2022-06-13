import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bulma/css/bulma.min.css';

function App() {
  return (
    <div>
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="https://bulma.io">
            unicycling.party
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item">
              Trictionary
            </a>

            <a className="navbar-item">
              Discord
            </a>
          </div>

          <div className="navbar-end">
            
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
