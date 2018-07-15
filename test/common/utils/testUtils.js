import fs from 'fs-extra';
import path from 'path';

// ----------------------------------------------------------------------------------

const _logkey = 'testUtils';
const _testbase = '__test__';

// ----------------------------------------------------------------------------------

export function prepareTestDir(subdir) {

  const testdir = path.join(process.cwd(), _testbase, subdir);

  fs.mkdirsSync(testdir);

  if (!fs.lstatSync(testdir).isDirectory())
    throw new Error(`${_logkey}.prepareTestDir - cannot create directory '${testdir}'!`);

  return testdir;
}

// ----------------------------------------------------------------------------------

export function ensureEmptyTestDir(subdir) {

  const testdir = path.join(process.cwd(), _testbase, subdir);

  if (fs.existsSync(testdir)) {
    fs.removeSync(testdir);
  }

  fs.mkdirsSync(testdir);

  if (!fs.lstatSync(testdir).isDirectory())
    throw new Error(`${_logkey}.ensureEmptyTestDir - cannot create directory '${testdir}'!`);

  return testdir;
}

// ----------------------------------------------------------------------------------
