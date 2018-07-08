
// --------------------------------------------------------------------------
// app

export const APP_TITLE = 'RoloSlider';
export const APP_VERSION = '0.0.1';

export const COMPANY_NAME = 'Rosenlöcher IT';

export const CONFIG_NAME = 'RoloSlider';
export const CONFIG_BASENAME = 'roloslider';

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
export const DEFCONF_TRANSITION_TIME_AUTOPLAY = 3000;
export const DEFCONF_TRANSITION_TIME_MANUAL = 600;
export const DEFCONF_TIMER = 7000;
export const DEFCONF_POWER_SAVE_BLOCK_TIME = 30;
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

export const DEBUG_ARGS =  [ 'unknownPathToBinary' ] ; // "-r -o fff -a 12 -t 12"
export const DEBUG_DEVTOOLS_PROD = true;
export const DEBUG_SHOW_WORKER_WINDOW = false;
export const DEBUG_IPC_HANDSHAKE = false;


// --------------------------------------------------------------------------
// ipc (channels + destination)

export const IPC_MAIN = 'IPC_MAIN';
export const IPC_RENDERER = 'IPC_RENDERER';
export const IPC_WORKER = 'IPC_WORKER';

// --------------------------------------------------------------------------
// actionsSls - common

export const ACTION_HANDSHAKE_REQUEST = 'ACTION_HANDSHAKE_REQUEST';
export const ACTION_HANDSHAKE_ANSWER = 'ACTION_HANDSHAKE_ANSWER';

export const ACTION_REQUEST_CONFIG = 'ACTION_REQUEST_CONFIG'; // worker + renderer to main
export const ACTION_READY = 'ACTION_READY'; // worker + renderer to main

export const ACTION_SHUTDOWN = 'ACTION_SHUTDOWN'; // main to worker + renderer

export const ACTION_PUSH_MAIN_CONFIG = 'ACTION_PUSH_MAIN_CONFIG';

export const ACTION_ESC_CLOSING = 'ACTION_ESC_CLOSING';

export const ACTION_SPREAD_REDUX_ACTION = 'ACTION_SPREAD_REDUX_ACTION';



// actionsSls - destination - main

export const ACTION_PERSIST_LAST_ITEM = 'ACTION_PERSIST_LAST_ITEM';
export const ACTION_PERSIST_AUTOPLAY = 'ACTION_PERSIST_AUTOPLAY';

// actionsSls - destination - renderer

export const ACTION_MSG_ADD = 'ACTION_MSG_ADD'; // error, warning, info
export const ACTION_MSG_REMOVE_FIRST = 'ACTION_MSG_REMOVE_FIRST';
export const ACTION_MSG_REMOVE_ALL = 'ACTION_MSG_REMOVE_ALL';
export const ACTION_MSG_CLOSE_DIALOG = 'ACTION_MSG_CLOSE_DIALOG';

export const ACTION_GO_NEXT = 'ACTION_GO_NEXT';
export const ACTION_GO_BACK = 'ACTION_GO_BACK';
export const ACTION_GO_PAGE = 'ACTION_GO_PAGE';
export const ACTION_GO_JUMP = 'ACTION_GO_JUMP';
export const ACTION_GO_POS1 = 'ACTION_GO_POS1';
export const ACTION_GO_END = 'ACTION_GO_END';

export const ACTION_AUTOPLAY_START = 'ACTION_AUTOPLAY_START';
export const ACTION_AUTOPLAY_STOP = 'ACTION_AUTOPLAY_STOP';
export const ACTION_AUTOPLAY_TOGGLE = 'ACTION_AUTOPLAY_TOGGLE';

export const ACTION_CURSOR_HIDE = 'ACTION_CURSOR_HIDE';
export const ACTION_CURSOR_SHOW = 'ACTION_CURSOR_SHOW';

export const ACTION_HELP_OPEN = 'ACTION_HELP_OPEN';
export const ACTION_HELP_CLOSE = 'ACTION_HELP_CLOSE';
export const ACTION_HELP_TOOGLE = 'ACTION_HELP_TOOGLE';

export const ACTION_DETAILS_TOOGLE = 'ACTION_DETAILS_TOOGLE';
export const ACTION_DETAILS_MOVE = 'ACTION_DETAILS_MOVE';

export const ACTION_SHOW_FILES = 'ACTION_SHOW_FILES';   // args: container: dir or file; when null "auto-mode" + items[]
export const ACTION_ADD_FILES = 'ACTION_ADD_FILES';     // auto-select-mode
export const ACTION_DELIVER_FILE_META = "ACTION_DELIVER_FILE_META";     // add meta info for (one) file

// action - destination - worker

export const ACTION_OPEN = 'ACTION_OPEN'; // args: container: dir or file; when null "auto-mode"
export const ACTION_OPEN_ITEM_FOLDER = 'ACTION_OPEN_ITEM_FOLDER'; // main => renderer; fills => worker

export const ACTION_NEXT_TASK = "ACTION_NEXT_TASK";
export const ACTION_DUMMY_TASK = "ACTION_DUMMY_TASK";

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

// --------------------------------------------------------------------------
// enums

export const DETAILS_STATE_ALL = "DETAILS_STATE_ALL";
export const DETAILS_STATE_MIN = "DETAILS_STATE_MIN";
export const DETAILS_STATE_OFF = "DETAILS_STATE_OFF";

export const CONTAINER_AUTOSELECT = 1;
export const CONTAINER_FOLDER = 2;
export const CONTAINER_PLAYLIST = 3;
