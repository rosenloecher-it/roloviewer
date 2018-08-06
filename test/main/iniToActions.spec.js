import * as iniToActions from "../../app/main/iniToActions";

// ----------------------------------------------------------------------------------

const defaultIniData = {
  crawler: {
    batchCount: '10',
    database: '/home/raul/.config/RoloViewer/crawler.db',
    blacklistFolderSnippets: [ 'bauen' ],
    sourceFolders: [ '/home/data/mymedia/201x/2016' ]
  }, mainWindow: {
    x: '785',
    y: '930',
    height: '769',
    width: '2091',
    fullscreen: false,
    maximized: false,
    activeDevtool: true
  }, slideshow: {
    autoPlay: false,
    container: 'undefined',
    crawlerInfoPosition: 'popover-right-bottom',
    crawlerInfoShow: false,
    detailsPosition: 'popover-left-bottom',
    detailsState: 'ALL',
    lastContainer: null,
    lastContainerType: '1',
    lastItem: '/home/data/mymedia/201x/2016/20160900 Sammelsurium/20160828-1921-9409-d.jpg',
    random: false,
    timer: '7000',
    transitionTimeAutoPlay: '3000',
    transitionTimeManual: '600'
  }, system: {
    exiftool: '/usr/bin/exiftool',
    lastDialogFolder: '/home/data/projects',
    logfile: null,
    logLevel: 'silly',
    powerSaveBlockMinutes: '30',
    mapUrlFormat: '...',
  }
};

const defaultContext = {
  isDevelopment: true,
  isDevtool: true,
  isProduction: false,
  isTest: false,
  configIsReadOnly: false,
  configFile: '/home/raul/.config/RoloSlider/roloslider_test.ini',
  tempCliAutoplay: false,
  tempCliAutoselect: false,
  tempCliFullscreen: false,
  tempCliOpenContainer: null,
  tempCliScreensaver: false,
  versionElectron: '2.0.4',
  versionExifReader: null,
  isScreensaver: false
};

// ----------------------------------------------------------------------------------

describe('iniToActions', () => {


  it('createSystemAction', () => {
    let action = null;

    const defaultConfigFile = '/tmp/rolosilder.log';
    const defaultExifTool = '/usr/bin/exiftool';

    action = iniToActions.createSystemAction(defaultIniData, defaultContext, defaultConfigFile, defaultExifTool);

    console.log("createSystemAction(action):", action);

    expect(action.payload.lastDialogFolder).toBe(defaultIniData.system.lastDialogFolder);



  });

});