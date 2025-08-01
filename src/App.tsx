import type { Component } from 'solid-js';
import { Route } from "@solidjs/router";

import NewPage from './pages/NewPage';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Test from './pages/Test';
import Games from './pages/Games';
import Ai from './pages/Ai';

const App: Component = () => {
  return (
    <>
      <Route path='/new' component={NewPage} />
      <Route path='/:sessionId?' component={Home} />
      <Route path='/test' component={Test} />
      <Route path='/settings' component={Settings} />
      <Route path='/books' component={Games} />
      <Route path='/ai' component={Ai} />
    </>
  );
};

export default App;