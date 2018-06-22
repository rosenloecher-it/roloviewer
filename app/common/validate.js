import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------------------------

export function validateFolderArray(input) {

  const output = [];

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      let folder = input[i];
      if (typeof(folder) !== typeof "str")
        continue;
      folder = path.normalize(folder);
      //if (!fs.existsSync(folder))
      //  continue;

      if (!output.includes(folder))
        output.push(folder);
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function validateBlacklistSnippets(input) {

  const output = [];

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      let snippet = input[i];
      if (typeof(snippet) !== typeof "str")
        continue;
      snippet = snippet.trim().toLowerCase();
      if (snippet)
        output.push(snippet);
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function validateBlacklistFolders(blacklistFoldersIn) {
  const blacklistFoldersOut = [];

  for (let i = 0; i < blacklistFoldersIn; i++) {
    const folder = path.normalize(blacklistFoldersIn[i]);
    if (!path.isAbsolute(folder))
      continue;
    if (!fs.lstatSync(folder).isDirectory())
      continue;
    blacklistFoldersOut.push(folder);
  }

  return blacklistFoldersOut;
}

// ----------------------------------------------------------------------------------
