import path from 'path';
import fs from "fs";
import {MetaReaderIntern} from '../../../app/worker/crawler/metaReaderIntern';
import {isWinOs} from "../../../app/common/utils/systemUtils";


// ----------------------------------------------------------------------------------

const _logKey = 'test-metaReaderIntern';

// ----------------------------------------------------------------------------------

describe(_logKey, () => {

  it('readMeta', () => {

    // console.warn node_modules/exifreader/dist/exif-reader.js:1
    // Warning: A full DataView implementation is not available. If you're using Node.js you probably want to do this:
    // 1. Install a DataView polyfill, e.g. jdataview: npm install --save jdataview
    // 2. Require that at the top of your script: global.DataView = require('jdataview');
    // See an example of this in the ExifReader example directory.

    // const reader = new MetaReaderIntern();
    //
    // const testFile = path.join(__dirname, 'metaReaderTest.jpg');
    //
    // const p = reader.readMeta(testFile, false).then((meta) => {
    //
    //   console.log('meta=', meta);
    // });
    //
    // return p;
  });

});
