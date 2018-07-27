/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './renderer/containers/app';
import Slideshow from './renderer/containers/slideshow';

export default () => (
  <App>
    <Switch>
      <Route path="/" component={Slideshow} />
    </Switch>
  </App>
);
