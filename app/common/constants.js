
// --------------------------------------------------------------------------
// app

export const APP_TITLE = 'RoloSlider';
export const APP_VERSION = '0.0.1';

export const COMPANY_NAME = 'Rosenlöcher IT';

export const CONFIG_NAME = 'RoloSlider';
export const CONFIG_STANDARD = 'roloslider.ini';
export const CONFIG_WINDOW = 'window.ini';

export const URL_CRASH_REPORT = 'https://your-domain.com/url-to-submit';

// --------------------------------------------------------------------------
// config

export const DEFCONF_WIDTH_DEF = 1024;
export const DEFCONF_WIDTH_MIN = 640;
export const DEFCONF_HEIGHT_DEF = 768;
export const DEFCONF_HEIGHT_MIN = 480;

export const DEFCONF_FULLSCREEN = false;
export const DEFCONF_RANDOM = false;
export const DEFCONF_SCREENSAVER = false;
export const DEFCONF_DETAILS = true;
export const DEFCONF_TRANSITION = 2000;
export const DEFCONF_AWAKE = 30;
export const DEFCONF_DBNAME = 'crawler.db';

export const DEFCONF_LOGNAME = 'roloslider.log';
export const DEFCONF_LOGLEVEL_FILE = 'warn';
export const DEFCONF_LOGLEVEL_CONSOLE = 'warn';
export const DEFCONF_LOG_DELETE_ON_START = true;

// --------------------------------------------------------------------------
// debug

export const DEBUG_ARGS =  ""; // "-r -o fff -a 12 -t 12"
export const DEBUG_DEVTOOLS_PROD = true;
export const DEBUG_SHOW_WORKER_WINDOW = false;
export const DEBUG_IPC_HANDSHAKE = false;


// --------------------------------------------------------------------------
// ipc (channels + destination)

export const IPC_MAIN = 'IPC_MAIN';
export const IPC_RENDERER = 'IPC_RENDERER';
export const IPC_WORKER = 'IPC_WORKER';

// --------------------------------------------------------------------------
// actions

export const ACTION_HANDSHAKE_REQUEST = 'ACTION_HANDSHAKE_REQUEST';
export const ACTION_HANDSHAKE_ANSWER = 'ACTION_HANDSHAKE_ANSWER';

export const ACTION_READY = 'ACTION_READY'; // worker, renderer to main

export const ACTION_PUSH_MAIN_CONFIG = 'ACTION_PUSH_MAIN_CONFIG';


export const ACTION_OPEN = 'ACTION_OPEN'; // args: container: dir or file; when null "auto-mode"
export const ACTION_SHOW_FILES = 'ACTION_SHOW_FILES'; // args: container: dir or file; when null "auto-mode" + items[]


export const ACTION_SHOW_MESSAGE = 'ACTION_SHOW_MESSAGE'; // error, warning, info


// export const IPC_MSG_START = 'IPC_MSG_START';
// export const IPC_STATE_STOPPED = 'IPC_STATE_STOPPED';
// export const IPC_CMD_STATE_CHANGE = 'IPC_CMD_STATE_CHANGE';
// export const IPC_CMD_RE_INIT = 'IPC_MR_INIT';


export const ACTION_NEXT_OBJECT = 'ACTION_NEXT_OBJECT';
export const ACTION_PREV_OBJECT = 'ACTION_PREV_OBJECT';
