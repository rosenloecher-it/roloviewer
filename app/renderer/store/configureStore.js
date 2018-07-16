import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import {createHashHistory} from "history";
import {routerMiddleware} from "react-router-redux";
import {createLogger} from "redux-logger";
import rootReducer from "./rendererRootReducer";

// ----------------------------------------------------------------------------------

const _logKey = "configureRendererStore";

const _history = createHashHistory();

const _store = configureStore();

// ----------------------------------------------------------------------------------

function configureStore(initialState?: counterStateType) {
  // Redux Configuration

  try {
    const middleware = [];
    const enhancers = [];

    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    // // Thunk Middleware
    // middleware.push(thunk);

    // Logging Middleware
    const logger = createLogger({
      level: (isDevelopment ? 'info' : 'error'),
      collapsed: true
    });

    // Skip redux logs in console during the tests
    if (!isTest) {
      middleware.push(logger);
    }

    // Router Middleware
    const router = routerMiddleware(_history);
    middleware.push(router);

    let localStore = null;

    if (!isDevelopment) {
      const enhancer = applyMiddleware(...middleware);
      localStore = createStore(rootReducer, initialState, enhancer);

    } else {
      // Redux DevTools Configuration
      // If Redux DevTools Extension is installed use it, otherwise use Redux compose
      /* eslint-disable no-underscore-dangle */
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose;
      /* eslint-enable no-underscore-dangle */

      // Apply Middleware & Compose Enhancers
      enhancers.push(applyMiddleware(...middleware));
      const enhancer = composeEnhancers(...enhancers);

      // Create Store
      localStore = createStore(rootReducer, initialState, enhancer);
    }

    if (isProduction && module.hot) {
      module.hot.accept('./rendererRootReducer', () => {
        const nextReducer = combineReducers(rootReducer);
        localStore.replaceReducer(nextReducer);
      });
    }

    return localStore;
  } catch (err) {
    log.error(`${_logKey}.configureStore - exception -`, err);

    return null;
  }

};

export default { _store, _history };





// // @flow
// if (process.env.NODE_ENV === 'production') {
//   module.exports = require('./configureStore.prod'); // eslint-disable-line global-require
// } else {
//   module.exports = require('./configureStore.dev'); // eslint-disable-line global-require
// }
