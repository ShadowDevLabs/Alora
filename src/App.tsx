import type { Component } from 'solid-js';

import NewPage from './pages/NewPage';
import Home from './pages/Home';
import { Router, Route } from "@solidjs/router";

const App: Component = () => {
  return (
    <Router>
      <Route path='/new' component={ NewPage } />
      <Route path='/' component={ Home } />
    </Router>

  );
};

export default App;
