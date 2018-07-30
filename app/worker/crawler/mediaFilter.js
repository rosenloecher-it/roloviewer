import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import {isWinOs} from "../../common/utils/systemUtils";

// ----------------------------------------------------------------------------------

const _logKey = "mediaFilter"; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

export class MediaFilter {

  // ........................................................

   static isFolderBlacklisted(sourceFolderIn, blacklistFolders, blacklistSnippets) {

    // blacklistFolders: normalized
    // blacklistSnippets: .trim.toLowercase

    // https://nodejs.org/api/path.html

    if (!sourceFolderIn)
      return true;

    const sourceFolder = path.normalize(sourceFolderIn);

    // not testable
    // if (!fs.lstatSync(sourceFolder).isDirectory())
    //   return true;

    if (isWinOs()) {
      for (let i = 0; i < blacklistFolders.length; i++) {
        if (sourceFolder.indexOf(blacklistFolders[i].toLowerCase()) === 0)
          return true;
      }

    } else {
      for (let i = 0; i < blacklistFolders.length; i++) {
        if (sourceFolder.indexOf(blacklistFolders[i]) === 0)
          return true;
      }

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

  static canImportFolder(file) {
    if (!file)
      return false;

    return fs.lstatSync(file).isDirectory();
  }

  // ........................................................

  static canImportMediaFile(file) {
    if (!file)
      return false;

    if (!fs.lstatSync(file).isFile())
      return false;

    const supportedFormat = MediaFilter.isImageFormatSupported(file);

    return supportedFormat;
  }

  // ........................................................

  static isImageFormatSupported(file) {
    if (!file)
      return false;

    const exts = [ '.jpg', '.jpeg' ];

    const ext = path.extname(file).trim().toLowerCase();

    return exts.includes(ext);
  }

  // ........................................................

  static listMediaFilesShort(folder) {

    const fileNames = [];

    const children = fs.readdirSync(folder);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(folder, fileShort);

      if (!fs.lstatSync(fileLong).isDirectory()) {
        if (MediaFilter.isImageFormatSupported(fileShort))
          fileNames.push(fileShort);
      }
    }

    return fileNames;
  }

  // ........................................................

  static pushMediaFilesFull(folder, resultArray) {

    let count = 0;

    const children = fs.readdirSync(folder);
    for (let k = 0; k < children.length; k++) {
      const fileShort = children[k];
      const fileLong = path.join(folder, fileShort);

      if (!fs.lstatSync(fileLong).isDirectory()) {
        if (MediaFilter.isImageFormatSupported(fileShort)) {
          resultArray.push(fileLong);
          count++;
        }
      }
    }

    return count > 0;
  }

  // ........................................................

  static tumbleArray(valsIn) {

    const valsOut = [];
    let valsClone = valsIn.slice(0);

    while (valsClone.length > 0) {

      const rand = Math.floor(Math.random() * valsClone.length);
      valsOut.push(valsClone[rand]);

      const valsTemp = [];
      for (let i = 0; i < valsClone.length; i++) {
        if (i !== rand)
          valsTemp.push(valsClone[i]);
      }
      valsClone = valsTemp;
    }

    return valsOut;
  }
  // ........................................................

}
