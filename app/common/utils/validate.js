import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------------------------

export function valiBoolean(input) {

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

export function valiInt(input) {

  const num = parseInt(input, 10);

  if (Number.isNaN(num))
    return null;

  return num;
}

// ----------------------------------------------------------------------------------

export function valiString(input) {

  if (input == null)
    return null;

  if (typeof(input) !== typeof "str")
    return null;
  if (input === "undefined" || input === "null")
    return null;

  return input;
}

// ----------------------------------------------------------------------------------

export function valiUrl(input) {
  // TODO implement
  return valiString(input);
}

// ----------------------------------------------------------------------------------

export function valiDir(input) {
  // TODO implement
  return valiString(input);
}

// -----------------------------------------------------------------------------

export function valiRatingArray(input) {
  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let i = 0; i < input.length; i++) {
    const text = input[i];
    const value = valiInt(text);

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

export function valiFolderArray(input) {

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

export function valiBlacklistSnippets(input) {

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

export function valiLogLevel(input) {

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

export function valiTagArray(input) {

  if (!Array.isArray(input))
    return [];

  const output = [];

  for (let i = 0; i < input.length; i++) {
    const text = valiString(input[i]);
    if (text) {
      const value = text.trim().toLowerCase();
      if (!output.includes(value))
        output.push(value);
    }
  }

  return output;
}

// ----------------------------------------------------------------------------------

export function mergeConfigItem(valueDef, valuePrio1, valuePrio2 = null) {

  if (typeof(valueDef) === typeof(valuePrio1))
    return valuePrio1;
  if (typeof(valueDef) === typeof(valuePrio2))
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------

export function mergeIntItem(valueDef, valuePrio1In, valuePrio2In = null) {

  const valuePrio1 = valiInt(valuePrio1In);
  if (typeof(valueDef) === typeof(valuePrio1))
    return valuePrio1;

  const valuePrio2 = valiInt(valuePrio2In);
  if (typeof(valueDef) === typeof(valuePrio2))
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------

export function mergeBoolItem(valueDef, valuePrio1In, valuePrio2In = null) {

  const valuePrio1 = valiBoolean(valuePrio1In);
  if (typeof(valueDef) === typeof(valuePrio1))
    return valuePrio1;

  const valuePrio2 = valiBoolean(valuePrio2In);
  if (typeof(valueDef) === typeof(valuePrio2))
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------

export function mergeStringItem(valueDef, valuePrio1, valuePrio2) {

  if (typeof("str") === typeof(valuePrio1) && valuePrio1 !== "undefined")
    return valuePrio1;
  if (typeof("str") === typeof(valuePrio2) && valuePrio2 !== "undefined")
    return valuePrio2;

  return valueDef;
}

// ----------------------------------------------------------------------------------
