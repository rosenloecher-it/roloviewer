
// --------------------------------------------------------------------------
// debug

//export const DEBUG_ARGS =  [ 'unknownPathToBinary', '--screensaver', '--fullscreen' ] ;
export const DEBUG_ARGS =  [ 'unknownPathToBinary' ] ;
export const DEBUG_DEVTOOLS_PROD = true;
export const DEBUG_SHOW_WORKER_WINDOW = false;
export const DEBUG_DONT_SAVE_CONFIG = false;

// --------------------------------------------------------------------------
// app

export const APP_TITLE = 'RoloSlider';
export const APP_VERSION = '0.7.0';
export const APP_URL = 'https://www.rosenloecher-it.de';

export const APP_CREATOR = 'Raul Rosenlöcher';

export const CONFIG_NAME = 'RoloSlider';
export const APP_BASENAME = 'roloslider';

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
export const DEFCONF_PATH_SHORTEN_ELEMENTS = 4;
export const DEFCONF_RANDOM = true;

export const DEFCONF_CRAWLER_MAX_FILES_PER_FOLDER = 1000;
export const DEFCONF_CRAWLER_UPDATE_DIRS_AFTER_MINUTES = 24 * 60;
export const DEFCONF_CRAWLER_WEIGHTING_RATING = 60;
export const DEFCONF_CRAWLER_WEIGHTING_REPEATED = DEFCONF_CRAWLER_WEIGHTING_RATING / 4;
export const DEFCONF_CRAWLER_WEIGHTING_SEASON_BASE = 182;
export const DEFCONF_CRAWLER_WEIGHTING_SEASON = DEFCONF_CRAWLER_WEIGHTING_SEASON_BASE;
export const DEFCONF_CRAWLER_WEIGHTING_SELPOW = 3;
export const DEFCONF_CRAWLER_TODAY_SHIFT_SEASON = 10;

export const DEFCONF_LOG = '.';
export const DEFCONF_LOGNAME = 'roloslider.log';
export const DEFCONF_LOGLEVEL_FILE = 'warn';
export const DEFCONF_LOGLEVEL_CONSOLE = 'warn';

export const DEFCONF_CRAWLER_BATCHCOUNT = 10;

export const DEFCONF_RENDERER_ITEM_RESERVE = DEFCONF_CRAWLER_BATCHCOUNT - 3;

export const DEFCONF_META2MAPURL_FORMAT = 'http://www.openstreetmap.org/?mlat=<LATI_NUM>&mlon=<LONG_NUM>&zoom=15&layers=M';

// --------------------------------------------------------------------------

export const CRAWLER_MAX_WEIGHT = Number.MAX_VALUE;

// --------------------------------------------------------------------------
// format meta => mapUrl

export const LATI_ABS = "<LATI_ABS>";
export const LATI_NUM = "<LATI_NUM>";
export const LATI_REF = "<LATI_REF>";
export const LATI_REL = "<LATI_REL>";
export const LONG_ABS = "<LONG_ABS>";
export const LONG_NUM = "<LONG_NUM>";
export const LONG_REF = "<LONG_REF>";
export const LONG_REL = "<LONG_REL>";

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

export const CONTAINER_UNKNOWN = 0;
export const CONTAINER_AUTOSELECT = 1;
export const CONTAINER_FOLDER = 2;
export const CONTAINER_PLAYLIST = 3;
export const CONTAINER_CLIPBOARD = 4;

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

export const AI_SHUTDOWN = 'AI_SHUTDOWN'; // main to workerState + renderer

export const AI_DUMMY = "AI_DUMMY";

export const AI_SPREAD_REDUX_ACTION = 'AI_SPREAD_REDUX_ACTION';

export const AI_TOOGLE_FULLSCREEN = 'AI_TOOGLE_FULLSCREEN'; // send to main

export const AI_QUITTING_SCREENSAVER_MODE = 'AI_QUITTING_SCREENSAVER_MODE'; // send to main

export const AI_QUIT_APP_BY_WORKER = 'AI_QUIT_APP_BY_WORKER'; // send from worker to main

// --------------------------------------------------------------------------
// actions - context

export const AR_CONTEXT_INIT_REDUCER = 'AR_CONTEXT_INIT_REDUCER';
export const AR_CONTEXT_SET_VERSION_EXIFREADER = 'AR_CONTEXT_SET_VERSION_EXIFREADER';

// --------------------------------------------------------------------------
// actions - workerState

export const AR_WORKER_PREFIX = 'AR_WORKER';

export const AR_WORKER_INIT_REDUCER = 'AR_WORKER_INIT_REDUCER';

export const AR_WORKER_REMOVE_TASK = 'AR_WORKER_REMOVE_TASK';
export const AR_WORKER_REMOVE_TASKTYPES = 'AR_WORKER_REMOVE_TASKTYPES';

export const AR_WORKER_AUTO_SELECT = 'AR_WORKER_AUTO_SELECT';
export const AR_WORKER_OPEN_DROPPED = 'AR_WORKER_OPEN_DROPPED';
export const AR_WORKER_OPEN_FOLDER = 'AR_WORKER_OPEN_FOLDER';
export const AR_WORKER_OPEN_PLAYLIST = 'AR_WORKER_OPEN_PLAYLIST';


  // switched by dispatcher
  // loads directories/playlist by mediaLoader || or by crawler

export const AR_WORKER_DELIVER_META = 'AR_WORKER_DELIVER_META';

export const AR_WORKER_START = 'AR_WORKER_START';
  // load and check config, eventually restart => AR_WORKER_RELOAD_DIRS(true)
  // restore last update-dir-tasks

  // restart: remove all AR_WORKER_UPDATE_FILES + AR_WORKER_UPDATE_DIR

  // load dirs from db into
  //   crawer.data.removeDirList: read by AR_WORKER_REMOVE_DIRS
  //   crawer.data.scanDirMap: read by AR_WORKER_SCAN_FSDIR
  // push AR_WORKER_SCAN_FSDIR with source folders


export const AR_WORKER_REMOVE_DIRS = 'AR_WORKER_REMOVE_DIRS';
  // remove non-existing dirs from crawer.data.removeDirList
  // loop max 10x dirs from crawer.data.removeDirList
  //   check for existence => remove from DB
  // removes the items from  crawer.data.removeDirList
  // if crawer.data.removeDirList still contains data => AR_WORKER_REMOVE_DIRS

export const AR_WORKER_SCAN_FSDIR = 'AR_WORKER_SCAN_FSDIR';
  // scan 1 dir for subdirs (existing dir or source folder)
  // exists not in map, new => AR_WORKER_UPDATE_DIR
  // for children => AR_WORKER_SCAN_FSDIR

export const AR_WORKER_RELOAD_DIRS = 'AR_WORKER_RELOAD_DIRS';
  // para: all == true means all dirs; false means: only update old ones
  // pushes AR_WORKER_UPDATE_DIR per folder


export const AR_WORKER_RATE_DIR_BY_FILE = 'AR_WORKER_RATE_DIR_BY_FILE';
  // 	re-rate file => re-rate dir

export const AR_WORKER_UPDATE_FILES = 'AR_WORKER_UPDATE_FILES';
  // load dirItem and update list of files => re-rate dir

export const AR_WORKER_UPDATE_DIR = 'AR_WORKER_UPDATE_DIR';
  // update single folder (only files, no subdirs; remove non existent, add new ones)
  // adding: check if task already exists


// --------------------------------------------------------------------------
// actions - mainwindow

export const AR_MAINWINDOW_INIT_REDUCER = 'AR_MAINWINDOW_INIT_REDUCER';
export const AR_MAINWINDOW_SET_ACTIVE_DEVTOOL = 'AR_MAINWINDOW_SET_ACTIVE_DEVTOOL';

export const AR_MAINWINDOW_SET_FULLSCREEN = 'AR_MAINWINDOW_SET_FULLSCREEN';
export const AR_MAINWINDOW_SET_MAXIMIZED = 'AR_MAINWINDOW_SET_MAXIMIZED';

// --------------------------------------------------------------------------
// actions - messages

export const AR_MESSAGE_ADD = 'AR_MESSAGE_ADD'; // error, warning, info
export const AR_MESSAGE_REMOVE_FIRST = 'AR_MESSAGE_REMOVE_FIRST';
export const AR_MESSAGE_REMOVE_ALL = 'AR_MESSAGE_REMOVE_ALL';
export const AR_MESSAGE_CLOSE_DIALOG = 'AR_MESSAGE_CLOSE_DIALOG';

// --------------------------------------------------------------------------
// actions - status

export const AR_STATUS_RUNNING = 'AR_STATUS_RUNNING';
export const AR_STATUS_DB = 'AR_STATUS_DB';
export const AR_STATUS_NOTIFY_CURRENT_ITEM = 'AR_STATUS_NOTIFY_CURRENT_ITEM';


// --------------------------------------------------------------------------
// actions - slideshow

export const AR_SLIDESHOW_INIT_REDUCER = 'AR_SLIDESHOW_INIT_REDUCER';

export const AR_SLIDESHOW_AUTOPLAY_START = 'AR_SLIDESHOW_AUTOPLAY_START';
export const AR_SLIDESHOW_AUTOPLAY_STOP = 'AR_SLIDESHOW_AUTOPLAY_STOP';
export const AR_SLIDESHOW_AUTOPLAY_TOGGLE = 'AR_SLIDESHOW_AUTOPLAY_TOGGLE';

export const AR_SLIDESHOW_DETAILS_TOOGLE = 'AR_SLIDESHOW_DETAILS_TOOGLE';
export const AR_SLIDESHOW_DETAILS_MOVE = 'AR_SLIDESHOW_DETAILS_MOVE';

export const AR_SLIDESHOW_RANDOM_TOOGLE = 'AR_SLIDESHOW_RANDOM_TOOGLE';

export const AR_SLIDESHOW_CRAWLERINFO_TOOGLE = 'AR_SLIDESHOW_CRAWLERINFO_TOOGLE';
export const AR_SLIDESHOW_CRAWLERINFO_MOVE = 'AR_SLIDESHOW_CRAWLERINFO_MOVE';

export const AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER = 'AR_SLIDESHOW_SET_LAST_ITEM_CONTAINER';

// --------------------------------------------------------------------------
// actions - renderer

export const AR_RENDERER_GO_NEXT = 'AR_RENDERER_GO_NEXT';
export const AR_RENDERER_GO_BACK = 'AR_RENDERER_GO_BACK';
export const AR_RENDERER_GO_RANDOM = 'AR_RENDERER_GO_RANDOM';
export const AR_RENDERER_GO_NOWHERE = 'AR_RENDERER_GO_NOWHERE';
export const AR_RENDERER_GO_PAGE = 'AR_RENDERER_GO_PAGE';
export const AR_RENDERER_GO_JUMP = 'AR_RENDERER_GO_JUMP';
export const AR_RENDERER_GO_POS1 = 'AR_RENDERER_GO_POS1';
export const AR_RENDERER_GO_END = 'AR_RENDERER_GO_END';

export const AR_RENDERER_CURSOR_HIDE = 'AR_RENDERER_CURSOR_HIDE';
export const AR_RENDERER_CURSOR_SHOW = 'AR_RENDERER_CURSOR_SHOW';

export const AR_RENDERER_ABOUT_OPEN = 'AR_RENDERER_ABOUT_OPEN';
export const AR_RENDERER_ABOUT_CLOSE = 'AR_RENDERER_ABOUT_CLOSE';

export const AR_RENDERER_HELP_CLOSE = 'AR_RENDERER_HELP_CLOSE';
export const AR_RENDERER_HELP_TOOGLE = 'AR_RENDERER_HELP_TOOGLE';

export const AR_RENDERER_SHOW_CONTAINER_FILES = 'AR_RENDERER_SHOW_CONTAINER_FILES';   // args: container: dir or file; when null "auto-mode" + items[]
export const AR_RENDERER_ADD_AUTO_FILES = 'AR_RENDERER_ADD_AUTO_FILES';     // auto-select-mode
export const AR_RENDERER_DELIVER_META = "AR_RENDERER_DELIVER_META";     // add meta info for (one) file

// --------------------------------------------------------------------------
// actions - system

export const AR_SYSTEM_INIT_REDUCER = 'AR_SYSTEM_INIT_REDUCER';
export const AR_SYSTEM_SET_LAST_DIALOG_FOLDER = 'AR_SYSTEM_SET_LAST_DIALOG_FOLDER';

// --------------------------------------------------------------------------





