
// --------------------------------------------------------------------------
// debug

export const DEBUG_ARGS =  [ 'unknownPathToBinary' ] ; // "-r -o fff -a 12 -t 12"
export const DEBUG_DEVTOOLS_PROD = true;
export const DEBUG_SHOW_WORKER_WINDOW = false;
export const DEBUG_DONT_SAVE_CONFIG = false;

// --------------------------------------------------------------------------
// app

export const APP_TITLE = 'RoloSlider';
export const APP_VERSION = '0.0.1';

export const COMPANY_NAME = 'Rosenlöcher IT';

export const CONFIG_NAME = 'RoloSlider';
export const CONFIG_BASENAME = 'roloslider';

// --------------------------------------------------------------------------
// config

export const DEFCONF_WIDTH_DEF = 1024;
export const DEFCONF_WIDTH_MIN = 640;
export const DEFCONF_HEIGHT_DEF = 768;
export const DEFCONF_HEIGHT_MIN = 480;

export const DEFCONF_TRANSITION_TIME_AUTOPLAY = 3000;
export const DEFCONF_TRANSITION_TIME_MANUAL = 600;
export const DEFCONF_TIMER = 7000;
export const DEFCONF_POWER_SAVE_BLOCK_TIME = 30;
export const DEFCONF_DBNAME = 'crawler.db';

export const DEFCONF_LOG = '.';
export const DEFCONF_LOGNAME = 'roloslider.log';
export const DEFCONF_LOGLEVEL_FILE = 'warn';
export const DEFCONF_LOGLEVEL_CONSOLE = 'warn';

export const DEFCONF_CRAWLER_BATCHCOUNT = 10;

export const DEFCONF_RENDERER_ITEM_RESERVE = DEFCONF_CRAWLER_BATCHCOUNT - 2;

// --------------------------------------------------------------------------
// messages

export const MSG_TYPE_INFO = 1;
export const MSG_TYPE_ERROR = 2;
export const MSG_TYPE_WARNING = 3;


export const ERROR_NOT_IMPLEMENTED = "ERROR: Not implemented!";

// --------------------------------------------------------------------------

// CSS classes
export const CORNER_POS_1 = "popover-left-bottom";
export const CORNER_POS_2 = "popover-left-top";
export const CORNER_POS_3 = "popover-right-top";
export const CORNER_POS_4 = "popover-right-bottom";

export const DETAILS_STATE_ALL = "ALL";
export const DETAILS_STATE_MIN = "MIN";
export const DETAILS_STATE_OFF = "OFF";

// --------------------------------------------------------------------------
// enums

export const CONTAINER_AUTOSELECT = 1;
export const CONTAINER_FOLDER = 2;
export const CONTAINER_PLAYLIST = 3;

// --------------------------------------------------------------------------
// ipc (channels === destination)

export const IPC_MAIN = 'IPC_MAIN';
export const IPC_RENDERER = 'IPC_RENDERER';
export const IPC_WORKER = 'IPC_WORKER';

// ##########################################################################

// --------------------------------------------------------------------------
// ipc actions

export const AI_CHILD_REQUESTS_CONFIG = 'AI_CHILD_REQUESTS_CONFIG'; // 1. child alive => requests main
export const AI_MAIN_PUSHED_CONFIG = 'AI_MAIN_PUSHED_CONFIG'; // 2. main has pushed config via redux (AI_SPREAD_REDUX_ACTION)
export const AI_CHILD_IS_READY = 'AI_CHILD_IS_READY'; // 3. cilds ready

export const AI_SHUTDOWN = 'AI_SHUTDOWN'; // main to worker + renderer

export const AI_DUMMY = "AI_DUMMY";

export const AI_SPREAD_REDUX_ACTION = 'AI_SPREAD_REDUX_ACTION';

// --------------------------------------------------------------------------
// slideshowActions - context

export const AR_CONTEXT_INIT = 'AR_CONTEXT_INIT';

// --------------------------------------------------------------------------
// slideshowActions - crawler

export const AR_CRAWLER_INIT = 'AR_CRAWLER_INIT';
export const AR_CRAWLER_OPEN = 'AR_CRAWLER_OPEN';
export const AR_CRAWLER_REMOVE_TASK = 'AR_CRAWLER_REMOVE_TASK';
export const AR_CRAWLER_DELIVER_META = 'AR_CRAWLER_DELIVER_META';

export const AR_CRAWLER_UPDATE_FILE = "AR_CRAWLER_UPDATE_FILE";
export const AR_CRAWLER_EVAL_FOLDER = "AR_CRAWLER_EVAL_FOLDER";
export const AR_CRAWLER_UPDATE_FOLDER = "AR_CRAWLER_UPDATE_FOLDER"; // merge fs
export const AR_CRAWLER_START_NEW = "AR_CRAWLER_START_NEW";


// --------------------------------------------------------------------------
// slideshowActions - mainwindow

export const AR_MAINWINDOW_INIT = 'AR_MAINWINDOW_INIT';
export const AR_MAINWINDOW_SET_ACTIVE_DEVTOOL = 'AR_MAINWINDOW_SET_ACTIVE_DEVTOOL';

export const AR_MAINWINDOW_SET_FULLSCREEN = 'AR_MAINWINDOW_SET_FULLSCREEN';
export const AR_MAINWINDOW_SET_MAXIMIZED = 'AR_MAINWINDOW_SET_MAXIMIZED';

// --------------------------------------------------------------------------
// slideshowActions - messages

export const AR_MESSAGE_ADD = 'AR_MESSAGE_ADD'; // error, warning, info
export const AR_MESSAGE_REMOVE_FIRST = 'AR_MESSAGE_REMOVE_FIRST';
export const AR_MESSAGE_REMOVE_ALL = 'AR_MESSAGE_REMOVE_ALL';
export const AR_MESSAGE_CLOSE_DIALOG = 'AR_MESSAGE_CLOSE_DIALOG';

// --------------------------------------------------------------------------
// slideshowActions - slideshow

export const AR_SLIDESHOW_INIT = 'AR_SLIDESHOW_INIT';

export const AR_SLIDESHOW_GO_NEXT = 'AR_SLIDESHOW_GO_NEXT';
export const AR_SLIDESHOW_GO_BACK = 'AR_SLIDESHOW_GO_BACK';
export const AR_SLIDESHOW_GO_PAGE = 'AR_SLIDESHOW_GO_PAGE';
export const AR_SLIDESHOW_GO_JUMP = 'AR_SLIDESHOW_GO_JUMP';
export const AR_SLIDESHOW_GO_POS1 = 'AR_SLIDESHOW_GO_POS1';
export const AR_SLIDESHOW_GO_END = 'AR_SLIDESHOW_GO_END';

export const AR_SLIDESHOW_AUTOPLAY_START = 'AR_SLIDESHOW_AUTOPLAY_START';
export const AR_SLIDESHOW_AUTOPLAY_STOP = 'AR_SLIDESHOW_AUTOPLAY_STOP';
export const AR_SLIDESHOW_AUTOPLAY_TOGGLE = 'AR_SLIDESHOW_AUTOPLAY_TOGGLE';

export const AR_SLIDESHOW_CURSOR_HIDE = 'AR_SLIDESHOW_CURSOR_HIDE';
export const AR_SLIDESHOW_CURSOR_SHOW = 'AR_SLIDESHOW_CURSOR_SHOW';

export const AR_SLIDESHOW_HELP_CLOSE = 'AR_SLIDESHOW_HELP_CLOSE';
export const AR_SLIDESHOW_HELP_TOOGLE = 'AR_SLIDESHOW_HELP_TOOGLE';

export const AR_SLIDESHOW_DETAILS_TOOGLE = 'AR_SLIDESHOW_DETAILS_TOOGLE';
export const ACTION_DETAILS_MOVE = 'ACTION_DETAILS_MOVE';

export const AR_SLIDESHOW_SHOW_CONTAINER_FILES = 'AR_SLIDESHOW_SHOW_CONTAINER_FILES';   // args: container: dir or file; when null "auto-mode" + items[]
export const AR_SLIDESHOW_ADD_AUTO_FILES = 'AR_SLIDESHOW_ADD_AUTO_FILES';     // auto-select-mode
export const AR_SLIDESHOW_DELIVER_META = "AR_SLIDESHOW_DELIVER_META";     // add meta info for (one) file

export const AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER = 'AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER';

// --------------------------------------------------------------------------
// slideshowActions - system

export const AR_SYSTEM_INIT = 'AR_SYSTEM_INIT';
export const AR_SYSTEM_SET_LAST_DIALOG_FOLDER = 'AR_SYSTEM_SET_LAST_DIALOG_FOLDER';

// --------------------------------------------------------------------------





