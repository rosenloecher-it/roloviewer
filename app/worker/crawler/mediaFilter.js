import log from "electron-log";
import path from 'path';
import fs from 'fs';
import { isWinOs } from '../../common/utils/systemUtils';
import * as fileUtils from '../../common/utils/fileUtils';

// ----------------------------------------------------------------------------------

const _logKey = 'mediaFilter'; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

export class MediaFilter {
  // ........................................................

  static isFolderInside(folderIn, sourceFolders) {
    // sourceFolders: normalized

    function preparePath(isWindows, fin) {
      if (!fin) return '';

      let pathEnd = '';
      if (fin.charAt(fin.length - 1) !== path.sep) pathEnd = path.sep;

      let fout;
      if (isWindows) fout = path.normalize(fin).toLowerCase() + pathEnd;
      else fout = path.normalize(fin) + pathEnd;

      return fout;
    }

    if (!folderIn || !sourceFolders) return false;

    const isWindows = isWinOs();

    const folder = preparePath(isWindows, folderIn);

    for (let i = 0; i < sourceFolders.length; i++) {
      const sourceFolder = preparePath(isWindows, sourceFolders[i]);
      if (folder.indexOf(sourceFolder) === 0) return true;
    }

    return false;
  }

  // ........................................................

  static isFolderBlacklisted(folderIn, blacklistFolders, blacklistSnippets) {
    // blacklistFolders: normalized
    // blacklistSnippets: .trim.toLowercase

    // https://nodejs.org/api/path.html

    if (!folderIn) return true;

    // not testable
    // if (!fileUtils.isDirectory(sourceFolder))
    //   return true;

    if (MediaFilter.isFolderInside(folderIn, blacklistFolders)) return true;

    if (blacklistSnippets.length > 0) {
      const folderLowerCase = folderIn.toLowerCase();
      for (let i = 0; i < blacklistSnippets.length; i++) {
        const found = folderLowerCase.indexOf(blacklistSnippets[i]);
        if (found > -1) return true;
      }
    }

    return false;
  }

  // ........................................................

  static containsTags(tagsExisting, tagsWanted) {

    try {
      if (!tagsExisting || !tagsWanted)
        return false;
      if (tagsExisting.length === 0)
        return false;
      if (tagsWanted.length === 0)
        return false;

      for (let w = 0; w < tagsWanted.length; w++) {
        if (!tagsWanted[w])
          continue;
        const tagWanted = tagsWanted[w].trim().toUpperCase();

        for (let e = 0; e < tagsExisting.length; e++) {
          if (!tagsExisting[e])
            continue;
          const tagExisting = tagsExisting[e].trim().toUpperCase();
          if (tagWanted === tagExisting)
            return true;
        }
      }

      return false;
    } catch (err) {
      log.error(`${_logKey}.containsTags -`, err);
      return false;
    }

    
  }

  // ........................................................

  static filterRating(ratings, rating) {

    if (!ratings)
      return false;
    if (ratings.length === 0)
      return false;

    for (let r = 0; r < ratings.length; r++) {
      if (rating === ratings[r])
        return false;
    }

    return true;
  }

  // ........................................................

  static canImportFolder(file) {
    if (!file) return false;

    return fileUtils.isDirectory(file);
  }

  // ........................................................

  static canImportMediaFile(file) {
    if (!fileUtils.isFile(file))
      return false;

    const supportedFormat = MediaFilter.isImageFormatSupported(file);

    return supportedFormat;
  }

  // ........................................................

  static canImportAsPlaylist(file) {
    if (!fileUtils.isFile(file))
      return false;

    const supportedFormat = MediaFilter.isPlaylistFormatSupported(file);

    return supportedFormat;
  }

  // ........................................................

  static isImageFormatSupported(file) {
    if (!file) return false;

    const exts = ['.jpg', '.jpeg'];

    const ext = path.extname(file).trim().toLowerCase();

    return exts.includes(ext);
  }

  // ........................................................

  static isPlaylistFormatSupported(file) {
    if (!file) return false;

    const exts = ['.txt', '.m3u'];

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

      if (!fileUtils.isDirectory(fileLong)) {
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

      if (fileUtils.isFile(fileLong)) {
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
        if (i !== rand) valsTemp.push(valsClone[i]);
      }
      valsClone = valsTemp;
    }

    return valsOut;
  }
  // ........................................................
}
