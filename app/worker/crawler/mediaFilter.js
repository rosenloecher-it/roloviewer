import log from 'electron-log';
import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------------------------

const _logKey = "mediaFilter";

// ----------------------------------------------------------------------------------

export class MediaFilter {

  // ........................................................

  static shouldSkipFolder(sourceFolderIn, blacklistFolders, blacklistSnippets) {

    // blacklistFolders: normalized
    // blacklistSnippets: .trim.toLowercase

    // https://nodejs.org/api/path.html

    if (!sourceFolderIn)
      return true;

    const sourceFolder = path.normalize(sourceFolderIn);

    // not testable
    // if (!fs.lstatSync(sourceFolder).isDirectory())
    //   return true;

    if (process.platform.toLowerCase().indexOf('win') >= 0) {
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

  static isImageFormatSupported(file) {
    if (!file)
      return false;

    return (path.extname(file).trim().toLowerCase() === ".jpg");
  }

  // ........................................................

  static listFiles(folder) {

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

}
