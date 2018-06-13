import log from 'electron-log';
import * as workerIpc from './workerIpc';

log.info("worker/index.js - loaded");

workerIpc.registerListener();



