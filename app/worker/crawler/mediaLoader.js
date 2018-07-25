import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../../common/constants";
import * as crawlerTasksActions from "../../common/store/crawlerTasksActions";
import * as rendererActions from "../../common/store/rendererActions";
import {CrawlerBase} from "./crawlerBase";
import {MediaFilter} from "./mediaFilter";

// ----------------------------------------------------------------------------------

const _logKey = "mediaLoader";

// ----------------------------------------------------------------------------------

export class MediaLoader extends CrawlerBase {

  constructor() {
    super();

    this.data.autoFolders = null;

  }

  // ........................................................

  open(input) {
    const func = ".open";

    const p = new Promise((resolve, reject) => {

      let data = null;
      try {
        //log.debug(`${_logKey}.open - in`, input);

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

        //log.debug(`${_logKey}.open - out`);
        resolve();

      } catch (error) {
        const textBase = `${_logKey}${func} - exception -`;
        log.error(textBase, error);
        reject(new Error(`${textBase} ${error}`));
      }

    });

    return p;
  }

  // ........................................................

  openPlayList(playlist) {
    const func = ".openPlayList";

    // TODO implement openPlayList

    this.logAndShowError(`${_logKey}${func}`, 'not implemented!');
  }

  // ........................................................

  openFolder(folder, selectFile) {
    const func = ".openFolder";

    log.debug(`${_logKey}${func} - folder=${folder}, selectFile=${selectFile}`);

    const images = MediaLoader.loadImagesFromFolder(folder);
    images.sort();

    const items = this.createItems(images);
    const action = rendererActions.createActionShowFiles(folder, constants.CONTAINER_FOLDER, items, selectFile);
    this.objects.storeManager.dispatchGlobal(action);

    this.addTasksDeliverFileMeta(images);
  }

  // ........................................................

  openItemFolder(input) {
    const func = ".openItemFolder";

    try {
      //log.debug(`${_logKey}${func} - input=`, input);

      const { selectFile } = input;

      if (!selectFile)
        throw new Error('!selectFile => skip!');

      const folder = path.dirname(selectFile);
      this.openFolder(folder, selectFile);

    } catch (err) {
      this.logAndRethrowError(`${_logKey}${func}`, err);
    }

  }

  // ........................................................

  openAutoSelect() {
    const func = ".openAutoSelect";

    try {
      const {storeManager} = this.objects;

      const crawlerState = storeManager.crawlerState;

      //log.debug(`${_logKey}${func} - crawlerState:`, crawlerState);

      if (!this.data.autoFolders) {

        if (crawlerState.folderSource.length === 0)
          throw new Error("no source folder for crawler defined - no auto select possible!");

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
      const action = rendererActions.createActionAddAutoFiles(items);
      //log.debug(`${_logKey}${func} - action:`, action);

      storeManager.dispatchGlobal(action);

      this.addTasksDeliverFileMeta(autoFiles);

    } catch (err) {
      this.logAndRethrowError(`${_logKey}${func}`, err);
    }
  }

  // ........................................................

  createItems(files) {
    const items = [];
    for (let i = 0; i < files.length; i++) {
      const item = rendererActions.createMediaItem(files[i]);
      if (item)
        items.push(item);
    }
    return items;
  }

  // ........................................................

  addTasksDeliverFileMeta(files) {

    for (let i = 0; i < files.length; i++) {

      const action = crawlerTasksActions.createActionDeliverMeta(files[i]);
      //log.debug(`${_logKey}.addTasksDeliverFileMeta - action:`, action);
      this.objects.storeManager.dispatchGlobal(action);

    }
  }

  // ........................................................

  static loadImagesFromFolder(folder) {
    const images = [];

    const children = fs.readdirSync(folder);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      if (MediaFilter.isImageFormatSupported(fileShort)) {
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

          if (MediaFilter.shouldSkipFolder(fileLong, blacklistFolders, blacklistSnippets)) {
            //console.log(`${_logKey}${func} - skip child folder -`, fileLong);
          } else {
            //console.log(`${_logKey}${func} - analyse child folder -`, fileLong);
            const subChildFolders = MediaLoader.listImageFolderRecursive(fileLong, blacklistFolders, blacklistSnippets, minCountJpg);
            childFolders.push(...subChildFolders);
          }
        } else {
          if (MediaFilter.isImageFormatSupported(fileShort))
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

