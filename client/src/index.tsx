import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import React from "react";
import Layout from "./pages/Layout";
import Tricktionary from "./pages/Tricktionary";
import Discord from "./pages/Discord";
import NoPage from "./pages/NoPage";
import Home from "./pages/Home";
import Trick from "./pages/Trick";
import DiscordInvite from "./pages/DiscordInvite";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tricktionary" element={<Tricktionary />} />
          <Route path="discord" element={<Discord />} />
          <Route path="discord/invite" element={<DiscordInvite />} />
          <Route path="tricks/:name" element={<Trick />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
