
// --------------------------------------------------------------------------
// app

export const APP_TITLE = 'RoloSlider';
export const APP_VERSION = '0.0.1';

export const COMPANY_NAME = 'Rosenlöcher IT';

export const CONFIG_NAME = 'RoloSlider';
export const CONFIG_BASENAME = 'roloslider';
export const CONFIG_EXT = '.ini';

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

export const DEFCONF_LOG = '.';
export const DEFCONF_LOGNAME = 'roloslider.log';
export const DEFCONF_LOGLEVEL_FILE = 'warn';
export const DEFCONF_LOGLEVEL_CONSOLE = 'warn';
export const DEFCONF_LOG_DELETE_ON_START = true;

export const DEFCONF_CRAWLER_BATCHCOUNT = 10;

export const DEFCONF_RENDERER_ITEM_RESERVE = DEFCONF_CRAWLER_BATCHCOUNT - 2;

// --------------------------------------------------------------------------
// debug

export const DEBUG_ARGS =  ""; // "-r -o fff -a 12 -t 12"
export const DEBUG_DEVTOOLS_PROD = true;
export const DEBUG_SHOW_WORKER_WINDOW = true;
export const DEBUG_IPC_HANDSHAKE = false;


// --------------------------------------------------------------------------
// ipc (channels + destination)

export const IPC_MAIN = 'IPC_MAIN';
export const IPC_RENDERER = 'IPC_RENDERER';
export const IPC_WORKER = 'IPC_WORKER';

// --------------------------------------------------------------------------
// actions - common

export const ACTION_HANDSHAKE_REQUEST = 'ACTION_HANDSHAKE_REQUEST';
export const ACTION_HANDSHAKE_ANSWER = 'ACTION_HANDSHAKE_ANSWER';

export const ACTION_REQUEST_CONFIG = 'ACTION_REQUEST_CONFIG'; // worker + renderer to main
export const ACTION_READY = 'ACTION_READY'; // worker + renderer to main

export const ACTION_SHUTDOWN = 'ACTION_SHUTDOWN'; // main to worker + renderer

export const ACTION_PUSH_MAIN_CONFIG = 'ACTION_PUSH_MAIN_CONFIG';

// actions - destination - renderer

export const ACTION_SHOW_MESSAGE = 'ACTION_SHOW_MESSAGE'; // error, warning, info

export const ACTION_GO_NEXT = 'ACTION_GO_NEXT';
export const ACTION_GO_BACK = 'ACTION_GO_BACK';
export const ACTION_SHOW_FILES = 'ACTION_SHOW_FILES';   // args: container: dir or file; when null "auto-mode" + items[]
export const ACTION_ADD_FILES = 'ACTION_ADD_FILES';     // auto-select-mode
export const ACTION_ADD_META = 'ACTION_ADD_META';     // add meta info for (one) file

// action - destination - worker

export const ACTION_OPEN = 'ACTION_OPEN'; // args: container: dir or file; when null "auto-mode"

export const ACTION_NEXT_TASK = "ACTION_NEXT_TASK";
export const ACTION_DUMMY_TASK = "ACTION_DUMMY_TASK";

export const ACTION_DELIVER_FILE_META = "ACTION_DELIVER_FILE_META";


// action - destination - worker AND crawler only

export const ACTION_CRAWLE_UPDATE_FILE = "ACTION_CRAWLE_UPDATE_FILE";
export const ACTION_CRAWLE_EVAL_FOLDER = "ACTION_CRAWLE_EVAL_FOLDER";
export const ACTION_CRAWLE_UPDATE_FOLDER = "ACTION_CRAWLE_UPDATE_FOLDER"; // merge fs
export const ACTION_CRAWLE_START_NEW = "ACTION_CRAWLE_START_NEW";



// --------------------------------------------------------------------------
// messages

export const MSG_TYPE_INFO = 1;
export const MSG_TYPE_ERROR = 2;
export const MSG_TYPE_WARNING = 3;


export const ERROR_NOT_IMPLEMENTED = "ERROR: Not implemented!";

// --------------------------------------------------------------------------
// worker tasks

export const TASK_DELIVER_FILE_META = "";
export const TASK_CRAWLE_FILE = "";
export const TASK_EVALUATE_FOLDER = "";
export const TASK_CRAWLE_FOLDER = "";
