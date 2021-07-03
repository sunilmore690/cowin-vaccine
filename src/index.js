import 'regenerator-runtime/runtime'

import React from 'react'
import { StrictMode }from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";

import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <div className="container" >
      <Router>
        <Route path="/" component={App} />
      </Router>
    </div>
  </StrictMode>,
  rootElement
);
