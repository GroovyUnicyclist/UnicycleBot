import 'bulma/css/bulma.min.css';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            unicycling.party
          </Link>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" to="/tricktionary">
              Tricktionary
            </Link>

            <Link className="navbar-item" to="/discord">
              Discord
            </Link>
          </div>

          <div className="navbar-end">

          </div>
        </div>
      </nav>

      <div className="content">
        <div className="columns">
          <div className="column">
            <div className="box">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
