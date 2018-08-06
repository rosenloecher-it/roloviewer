import { powerSaveBlocker } from 'electron';
import log from 'electron-log';
import * as constants from "../common/constants";
import storeManager from './store/mainManager';

// ----------------------------------------------------------------------------------

// https://electronjs.org/docs/api/power-save-blocker

const _logKey = "powerSaveBlocker";

let _timerInit = false;
let _timerStart = null;
let _timerStop = null;
let _blocker = null;

// ----------------------------------------------------------------------------------

export function init() {
  const func = ".init";
  try {
    if (_timerInit === false && _timerStart === null && _timerStop === null) {
      _timerInit = true;
      _timerStart = setTimeout(onBlockStart, 5000);
    }
  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception: ${err}`);
  }
}

// ----------------------------------------------------------------------------------

export function shutdown() {
  const func = ".shutdown";
  try {
    if (_timerStart)
      clearTimeout(_timerStart);

    if (_timerStop)
      clearTimeout(_timerStop);

    stop();

  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception: ${err}`);
  }
}

// ----------------------------------------------------------------------------------

function onBlockStart() {
  const func = ".onBlockStart";
  try {
    _timerStart = null;

    const time = storeManager.powerSaveBlockMinutes;
    const timeMilli = time * 60 * 1000;

    //start
    if (time >= 0) {
      _blocker = powerSaveBlocker.start('prevent-display-sleep');

      // stop after x ms
      if (time > 0) {
        _timerStop = setTimeout(onBlockStop, timeMilli);
        log.info(`powerSaveBlocker started (${time} min)`);
      } else
        log.info(`powerSaveBlocker started (${time} == 0 => infinite)`);
    } else
      log.info(`powerSaveBlocker disabled (time(${time}) < 0)`);

  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception: ${err}`);
  }
}

// ----------------------------------------------------------------------------------

function onBlockStop() {
  const func = ".onBlockStop";
  try {
    _timerStop = null;
    stop();
  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception: ${err}`);
  }
}

// ----------------------------------------------------------------------------------

function stop() {
  const func = ".stop";
  try {
    if (_blocker !== null) {
      powerSaveBlocker.stop(_blocker);
      _blocker = null;
      log.info("powerSaveBlocker stopped");
    }
  } catch (err) {
    log.error(`${_logKey}${func} exception:`, err);
    storeManager.showMessage(constants.MSG_TYPE_ERROR, `${_logKey}${func} exception: ${err}`);
  }
}

