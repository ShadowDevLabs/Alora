import type { Component } from 'solid-js';

import NewPage from './pages/NewPage';
import Home from './pages/Home';
import Test from './pages/Test';
import { Router, Route } from "@solidjs/router";

const App: Component = () => {
  return (
    <Router>
      <Route path='/new' component={ NewPage } />
      <Route path='/' component={ Home } />
      <Route path='/test' component={ Test } />
    </Router>

  );
};

export default App;
