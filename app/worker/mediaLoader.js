import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../common/constants";
import {sendShowMessage} from "./workerIpc";

// ----------------------------------------------------------------------------------

const _logKey = "mediaLoader";

// ----------------------------------------------------------------------------------

export class MediaLoader {

  constructor() {

    this.data = MediaLoader.createDefaultData();

    this.coupleObjects = this.coupleObjects.bind(this);
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);

    this.open = this.open.bind(this);
    this.openPlayList = this.openPlayList.bind(this);
    this.openFolder = this.openFolder.bind(this);
    this.openAutoSelect = this.openAutoSelect.bind(this);
  }

  // ........................................................

  static createDefaultData() {
    return {
      autoFolders: null
    };
  }

  // ........................................................

  coupleObjects(input) {
    const func = ".coupleObjects";
    log.debug(`${_logKey}${func}`);

    this.data.config = input.config;
    this.data.processConnector = input.processConnector;
  }

  // ........................................................

  init() {
    const func = ".init";

    const p = new Promise(function(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  shutdown() {
    const func = ".shutdown";

    const p = new Promise(function(resolve, reject) {
      log.debug(`${_logKey}${func}`);
      resolve();
    });

    return p;
  }

  // ........................................................

  open(input) {
    const func = ".open";

    let data = null;
    if (!input)
      data = {};
    else if (typeof(input) === typeof("str"))
      data = { container: input };
    else
      data = input;

    try {
      log.debug(`${_logKey}.open -`, data);

      if (data.container) {

        if (fs.lstatSync(data.container).isDirectory())
          this.openFolder(data.container);
        else if (fs.lstatSync(data.container).isFile())
          this.openPlayList(data.container);
      } else {
        this.openAutoSelect();
      }
    } catch (error) {
      log.error(`${_logKey}${func} - exception -`, error);
      throw (error);
    }

  }

  // ........................................................

  openPlayList(playlist) {
    const func = ".openPlayList";
    // TODO implement
    log.error(`${_logKey}${func} - not implemented - ${playlist}`);
    this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR
      , `${constants.ERROR_NOT_IMPLEMENTED} - ${_logKey}${func} - not implemented - ${playlist}`);
  }

  // ........................................................

  openFolder(folder) {
    const func = ".openFolder";

    log.debug(`${_logKey}${func} - ${folder}`);

    const images = MediaLoader.loadImagesFromFolder(folder);
    images.sort();

    this.pushFilesToRenderer(constants.ACTION_SHOW_FILES, folder, images);
  }

  // ........................................................

  openAutoSelect() {
    const func = ".openAutoSelect";

    log.debug(`${_logKey}${func}`);

    if (!this.data.autoFolders) {

      const {config} = this.data;
      //log.debug(`${_logKey}${func} - config:`, config);

      if (config.crawlerFolderSource.length === 0) {
        const text = "no source folder for crawler defined - no auto select possible!";
        log.error(`${_logKey}${func} - ${text}`);
        this.data.processConnector.sendShowMessage(constants.MSG_TYPE_ERROR, text, null);
        return;
      }

      this.data.autoFolders = MediaLoader.listImageFolderRecursive(config.crawlerFolderSource
                                , config.crawlerFolderBlacklist
                                , config.crawlerFolderBlacklistSnippets
                                , config.crawlerBatchCount);
    }

    const autoFolder = MediaLoader.selectRandomFolder(this.data.autoFolders);
    const images = MediaLoader.loadImagesFromFolder(autoFolder);
    const autoFiles = MediaLoader.selectRandomItems(images, this.data.config.crawlerBatchCount);

    autoFiles.sort();

    this.pushFilesToRenderer(constants.ACTION_ADD_FILES, null, autoFiles);
  }

  // ........................................................

  pushFilesToRenderer(actionType, container, imageFiles) {
    const func = ".pushFilesToRenderer";

    const payload = {
      container,
      items: []
    };

    for (let i = 0; i < imageFiles.length; i++) {
      const item = this.loadFile(imageFiles[i]);
      if (item)
        payload.items.push(item);
    }

    log.debug(`${_logKey}${func} - ${actionType} (${payload.items.length} items)`);
    this.data.processConnector.send(constants.IPC_RENDERER, actionType, payload);
  }

  // ........................................................

  loadFile(file) {
    const func = ".loadFile";

    // log.debug(`${logKey}${func}: in - ${file}`);
    const item = {
      file: file
    };

    //extractAndStoreMetaData(file);

    return item;
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

    const childFolders = [];

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
      };

      if (countJpg >= minCountJpg)
        resultFolders.push(sourceFolder);
      resultFolders.push(...childFolders);
    }

    return resultFolders;
  }


  // ........................................................

}

// ----------------------------------------------------------------------------------

