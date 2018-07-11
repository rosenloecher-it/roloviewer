import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../../common/constants";
import * as crawlerActions from "../../common/store/crawlerActions";
import * as actionsSlideshow from "../../common/store/slideshowActions";
import storeManager from "../../main/store/mainManager";

// ----------------------------------------------------------------------------------

const _logKey = "mediaLoader";

// ----------------------------------------------------------------------------------

export class MediaLoader {

  constructor() {

    this.data = {
      autoFolders: null
    };

  }

  // ........................................................

  coupleObjects(input) {
    const func = ".coupleObjects";
    log.debug(`${_logKey}${func}`);

    this.data.storeManager = input.storeManager;

    if (!this.data.storeManager)
      throw new Error(`${_logKey}.coupleObjects - no storeManager!`);
  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function(resolve, reject) {
      log.silly(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  open(input) {
    const func = ".open";

    let data = null;
    try {
      //log.debug(`${_logKey}.open -`, data);

      if (!input)
        data = {};
      else if (typeof(input) === typeof("str"))
        data = { container: input };
      else
        data = input;

      if (data.container) {

        if (fs.lstatSync(data.container).isDirectory())
          this.openFolder(data.container, data.selectFile);
        else if (fs.lstatSync(data.container).isFile())
          this.openPlayList(data.container);
      } else {
        this.openAutoSelect();
      }
    } catch (error) {
      const text = `${_logKey}${func} - exception - ${error}`;
      log.error(`${_logKey}${func} - exception -`, error);
      log.error(`${_logKey}${func} - data -`, data);
      //TODO this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, text);
    }

  }

  // ........................................................

  openPlayList(playlist) {
    const func = ".openPlayList";
    // TODO implement
    log.error(`${_logKey}${func} - not implemented - ${playlist}`);
    //TODO this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR
    //  , `${_logKey}${func} - ${constants.ERROR_NOT_IMPLEMENTED} - ${playlist}`);
  }

  // ........................................................

  openFolder(folder, selectFile) {
    const func = ".openFolder";

    log.debug(`${_logKey}${func} - folder=${folder}, selectFile=${selectFile}`);

    const images = MediaLoader.loadImagesFromFolder(folder);
    images.sort();

    const items = this.createItems(images);
    const action = actionsSlideshow.createActionShowFiles(folder, constants.CONTAINER_FOLDER, items, selectFile);
    this.data.storeManager.dispatchGlobal(action);

    this.addTasksDeliverFileMeta(images);
  }

  // ........................................................

  openItemFolder(input) {
    const func = ".openItemFolder";

    try {
      //log.debug(`${_logKey}${func} - input=`, input);

      const { selectFile } = input;

      if (!selectFile) {
        const text = `${_logKey}${func} - !selectFile => skip!`;
        log.error(text);
        //TODO this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, text, null);
        return;
      }

      const folder = path.dirname(selectFile);
      this.openFolder(folder, selectFile);

    } catch (error) {
      log.error(`${_logKey}${func} - exception -`, error);
      throw (error);
    }

  }

  // ........................................................

  openAutoSelect() {
    const func = ".openAutoSelect";

    const {storeManager} = this.data;

    log.debug(`${_logKey}${func}`);

    const crawlerState = storeManager.crawlerState;

    //log.debug(`${_logKey}${func} - crawlerState:`, crawlerState);

    if (!this.data.autoFolders) {



      if (crawlerState.folderSource.length === 0) {
        const text = "no source folder for crawler defined - no auto select possible!";
        log.error(`${_logKey}${func} - ${text}`);
        //TODO this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, text, null);
        return;
      }

      this.data.autoFolders = MediaLoader.listImageFolderRecursive(crawlerState.folderSource
                                , crawlerState.folderBlacklist
                                , crawlerState.folderBlacklistSnippets
                                , crawlerState.batchCount);
    }

    const autoFolder = MediaLoader.selectRandomFolder(this.data.autoFolders);
    const images = MediaLoader.loadImagesFromFolder(autoFolder);
    const autoFiles = MediaLoader.selectRandomItems(images, crawlerState.batchCount);

    autoFiles.sort();

    const items = this.createItems(autoFiles);
    const action = actionsSlideshow.createActionAddAutoFiles(items);
    //log.debug(`${_logKey}${func} - action:`, action);

    storeManager.dispatchGlobal(action);

    this.addTasksDeliverFileMeta(autoFiles);
  }

  // ........................................................

  createItems(files) {
    const items = [];
    for (let i = 0; i < files.length; i++) {
      const item = actionsSlideshow.createItem(files[i]);
      if (item)
        items.push(item);
    }
    return items;
  }

  // ........................................................

  addTasksDeliverFileMeta(files) {

    for (let i = 0; i < files.length; i++) {

      const action = crawlerActions.createActionDeliverMeta(files[i]);
      this.data.storeManager.dispatchGlobal(action);

    }
  }

  // ........................................................

  static shouldSkipSourceFolder(sourceFolderIn, blacklistFolders, blacklistSnippets) {

    // blacklistFolders: normalized
    // blacklistSnippets: .trim.toLowercase

    // https://nodejs.org/api/path.html

    if (!sourceFolderIn)
      return true;

    const sourceFolder = path.normalize(sourceFolderIn);

     // not testable
    // if (!fs.lstatSync(sourceFolder).isDirectory())
    //   return true;

    for (let i = 0; i < blacklistFolders.length; i++) {
      const found = sourceFolder.indexOf(blacklistFolders[i]);
      if (found === 0)
        return true;
    }

    if (blacklistSnippets.length > 0) {
      const sourceFolderLowerCase = sourceFolder.toLowerCase();
      for (let i = 0; i < blacklistSnippets.length; i++) {
        const found = sourceFolderLowerCase.indexOf(blacklistSnippets[i]);
        if (found > -1)
          return true;
      }
    }

    return false;
  }

  // ........................................................

  static isImageFormatSupported(file) {
    if (!file)
      return false;

    return (path.extname(file).trim().toLowerCase() === ".jpg");
  }

  // ........................................................

  static loadImagesFromFolder(folder) {
    const images = [];

    const children = fs.readdirSync(folder);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      if (MediaLoader.isImageFormatSupported(fileShort)) {
        const fileLong = path.join(folder, fileShort);
        if (!fs.lstatSync(fileLong).isDirectory())
          images.push(fileLong)
      }
    };

    return images;
  }

  // ........................................................

  static selectRandomItems(items, batchCount) {
    if (!items)
      return null;

    const source = items.slice(0); // copy array

    const selectionCount = source.length < batchCount ? source.length : batchCount;

    const selection = [];

    for (let i = 0; i < selectionCount; i++) {
      const random = Math.floor(source.length * Math.random());

      //console.log(`selectRandomItems: source.length=${source.length} random=${random} source=`, source);

      selection.push(source[random]);

      source[random] = source[source.length -1];
      source.pop();
    }

    return selection;
  }

  // ........................................................

  static selectRandomFolder(folders) {
    const random = Math.floor(folders.length * Math.random());
    return folders[random];
  }

  // ........................................................

  static listImageFolderRecursive(sourceFoldersIn, blacklistFolders, blacklistSnippets, minCountJpg) {
    const func = ".listImageFolderRecursive";

    const sourceFolders = [];
    const resultFolders = [];

    if (Array.isArray(sourceFoldersIn))
      sourceFolders.push(...sourceFoldersIn);
    else
      sourceFolders.push(sourceFoldersIn);

    for (let i = 0; i < sourceFolders.length; i++) {
      const sourceFolder = sourceFolders[i];

      //console.log(`${_logKey}${func} - source -`, sourceFolder);

      if (!path.isAbsolute(sourceFolder))
        continue;
      if (!fs.lstatSync(sourceFolder).isDirectory())
        continue;

      let countJpg = 0;
      const childFolders = [];

      const files = fs.readdirSync(sourceFolder);
      for (let k = 0; k < files.length; k++) {
        const fileShort = files[k];
        const fileLong = path.join(sourceFolder, fileShort);
        if (fs.lstatSync(fileLong).isDirectory()) {

          if (MediaLoader.shouldSkipSourceFolder(fileLong, blacklistFolders, blacklistSnippets)) {
            //console.log(`${_logKey}${func} - skip child folder -`, fileLong);
          } else {
            //console.log(`${_logKey}${func} - analyse child folder -`, fileLong);
            const subChildFolders = MediaLoader.listImageFolderRecursive(fileLong, blacklistFolders, blacklistSnippets, minCountJpg);
            childFolders.push(...subChildFolders);
          }
        } else {
          if (MediaLoader.isImageFormatSupported(fileShort))
              countJpg++;
        }
      }

      if (countJpg >= minCountJpg)
        resultFolders.push(sourceFolder);
      resultFolders.push(...childFolders);
    }

    return resultFolders;
  }


  // ........................................................

}

// ----------------------------------------------------------------------------------

