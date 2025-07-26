import type { Component } from 'solid-js';

import NewPage from './pages/NewPage';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Test from './pages/Test';
import { Router, Route } from "@solidjs/router";
import Games from './pages/Games';
const App: Component = () => {
  return (
    <Router>
      <Route path='/new' component={ NewPage } />
      <Route path='/' component={ Home } />
      <Route path='/test' component={ Test } />
      <Route path='/settings' component={ Settings } />
      <Route path='/books' component={ Games } />
    </Router>

  );
};

export default App;
