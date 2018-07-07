import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------------------------

export function validateBoolean(input) {

  if (input == null)
    return null;
  if (typeof(input) === typeof(true))
    return input;
  const compare = input.toString().trim().toLowerCase();

  if (compare === "true" || compare === "on" || compare === "1")
    return true;
  else if (compare === "false" || compare === "off" || compare === "0")
    return false;

  return null;
}

// ----------------------------------------------------------------------------------

export function validateInt(input) {

  const num = parseInt(input, 10);

  if (Number.isNaN(num))
    return null;

  return num;
}

// ----------------------------------------------------------------------------------

export function validateRatingArray(input) {
  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let i = 0; i < input.length; i++) {
    const text = input[i];
    const value = validateInt(text);

    if (value === null) // make flow happy
      continue;
    if (typeof(value) !== typeof(1))
      continue;
    if (value < 0 || value > 5)
      continue;

    if (!output.includes(value))
      output.push(value);
  }

  return output;
}

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

export function validateLogLevel(input) {

  const defaultLogLevel = "warn";

  if (typeof(input) !== typeof("str"))
    return defaultLogLevel;

  const logLevels = [ "error", "warn", "info", "verbose", "debug", "silly" ];

  const output = input.trim().toLowerCase();

  if (logLevels.indexOf(output) > -1)
    return output;

  return defaultLogLevel;
}

// ----------------------------------------------------------------------------------

export function validateStringArray(input) {

  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let i = 0; i < input.length; i++) {
    const text = input[i];
    if (typeof(text) === typeof "str") {
      const value = text.trim().toLowerCase();
      if (!output.includes(value))
        output.push(value);
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------

