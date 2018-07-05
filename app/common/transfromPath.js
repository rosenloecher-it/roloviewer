import path from 'path';

// ----------------------------------------------------------------------------------

export function shortenPathElements(fullpath, shortenPathNum) {

  if (!shortenPathNum || !fullpath)
    return path;

  const elements = fullpath.split(path.sep);

  let start = 0;
  if (shortenPathNum > 0) {
    if (elements.length > 0 && !elements[0])
      start = 1;
    start += shortenPathNum;
    if (start >= elements.length)
      start = elements.length - 1;
  } else { // countRemove < 0
    start = elements.length + shortenPathNum;
    if (start <= 0)
      return fullpath;
  }

  let output = "...";
  for (let i = start; i < elements.length; i++) {
    output += path.sep + elements[i];
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function separateFilePath(filepath, shortenPathNum) {
  const output = {};

  if (!filepath)
    return output;

  const splitted = path.parse(filepath);

  output.filename = splitted.base;

  output.dir = shortenPathElements(splitted.dir, shortenPathNum);

  return output;
}

// ----------------------------------------------------------------------------------

export function determinePathAndFilename(item, shortenPathNum) {
  const output = {};

  if (item) {
    if (item.details) {
      output.filename = item.details.filename;
      output.dir = item.details.dir;
    }

    if (!output.filename || !output.dir) {
      const splitted = separateFilePath(item.file, shortenPathNum);
      output.filename = splitted.filename;
      output.dir = splitted.dir;
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------
