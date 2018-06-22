import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { _store, _history } from './store/configureStore';
import './style/app.global.scss';
import * as ipc from './rendererIpc';

render(
  <AppContainer>
    <Root store={_store} history={_history} />
  </AppContainer>,
  document.getElementById('root')
);

ipc.registerListener();

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={_store} history={_history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
