import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import * as constants from "../../common/constants";
import * as workerActions from "../../common/store/workerActions";
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

  openPlayList(input) {
    const func = ".openPlayList";

    // TODO implement openPlayList
    this.logAndShowError(`${_logKey}${func}`, 'not implemented!');

    const p = new Promise((resolve) => {
      resolve();
    });

    return p;
  }

  // ........................................................

  openFolder(input) {

    const p = new Promise((resolve) => {
      this.openFolderSync(input);
      resolve();
    });

    return p;
  }

  // ........................................................

  openFolderSync(input) {
    const func = ".openFolder";

    try {
      const {container, selectFile} = input;
      const {storeManager} = this.objects;

      log.debug(`${_logKey}${func} - container=${container}, selectFile=${selectFile}`);

      if (!fs.lstatSync(container).isDirectory()) {
        log.error(`${_logKey}${func} - folder does not exist (${container})!`);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `Folder does not exist (${container})!`);
        return;
      }

      const mediaFiles = [];
      MediaFilter.pushMediaFilesFull(container, mediaFiles);

      if (mediaFiles.length <= 0) {
        log.warn(`${_logKey}${func} - directory does not contain supported media files! ${container}`);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, 'The directory does not contain supported media files!');
        return;
      }

      mediaFiles.sort((file1, file2) => {
        return MediaLoader.sortFilename(file1, file2);
      });

      const mediaItems = this.createItems(mediaFiles);
      const action = rendererActions.createActionShowFiles(container, constants.CONTAINER_FOLDER, mediaItems, selectFile);
      this.objects.storeManager.dispatchGlobal(action);

      this.addTasksDeliverFileMeta(mediaFiles);

    } catch(err) {
      this.logAndShowError(`${_logKey}${func}`, err);
    }
  }

  // ........................................................

  openDropped(input) {

    const p = new Promise((resolve) => {
      this.openDroppedSync(input);
      resolve();
    });

    return p;
  }

  // ........................................................

  openDroppedSync(input) {

    const func = ".openFolder";

    try {
      log.debug(`${_logKey}${func} -`, input);

      const {files: filesIn} = input;
      const {storeManager} = this.objects;

      if (filesIn.length === 1) {
        const file = filesIn[0];
        if (MediaFilter.canImportFolder(file)) {
          this.openFolderSync({ container: file, selectFile: null });
          return;
        } else if (MediaFilter.canImportMediaFile(file)) {
          const container = path.dirname(file);
          this.openFolderSync({ container, selectFile: file });
          return;
        }
        // TODO check playlist
        // do the standard (way including) error messaging
      }

      // open as playlist
      const mediaFiles = [];
      for (let i = 0; i < filesIn.length; i++) {
        const file = filesIn[i];
        if (MediaFilter.canImportFolder(file))
          MediaFilter.pushMediaFilesFull(file, mediaFiles);
        else if (MediaFilter.canImportMediaFile(file))
          mediaFiles.push(file);
      }

      if (mediaFiles.length <= 0) {
        log.warn(`${_logKey}${func} - dropped files not supported!`, filesIn);
        storeManager.showMessage(constants.MSG_TYPE_ERROR, `The dropped files are not supported!`);
        return;
      }

      mediaFiles.sort((file1, file2) => {
        return MediaLoader.sortFilename(file1, file2);
      });

      const mediaItems = this.createItems(mediaFiles);
      const action = rendererActions.createActionShowFiles('dropped', constants.CONTAINER_CLIPBOARD, mediaItems, null);
      this.objects.storeManager.dispatchGlobal(action);

      this.addTasksDeliverFileMeta(mediaFiles);

    } catch(err) {
      this.logAndShowError(`${_logKey}${func}`, err);
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

    const {storeManager} = this.objects;

    for (let i = 0; i < files.length; i++) {
      const action = workerActions.createActionDeliverMeta(files[i]);
      //log.debug(`${_logKey}.addTasksDeliverFileMeta - action:`, action);
      storeManager.dispatchGlobal(action);
    }
  }

  // ........................................................

  static sortFilename(filename1, filename2) {
    const f1 = filename1.toLowerCase();
    const f2 = filename2.toLowerCase();
    if (f1 < f2)
      return -1;
    else if (f1 > f2)
      return 1;
    return 0;
  }

  // ........................................................
}

