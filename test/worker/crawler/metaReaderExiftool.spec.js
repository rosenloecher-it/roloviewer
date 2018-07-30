import path from 'path';
import fs from "fs";
import {MetaReaderExiftool} from '../../../app/worker/crawler/metaReaderExiftool';
import {isWinOs} from "../../../app/common/utils/systemUtils";

// ----------------------------------------------------------------------------------

const _logKey = 'test-metaReaderExiftool';
const _defaultExifToolPath = '/usr/bin/exiftool';

// ----------------------------------------------------------------------------------

function checkRequirementsExternReader() {
  if (isWinOs())
    return false; // not supported

  const expectedExifToolPath = '/usr/bin/exiftool';
  if (!fs.lstatSync(expectedExifToolPath).isFile())
    return false; // cannot test!

  return true;
}

// ----------------------------------------------------------------------------------

function testImage1(metaReader) {
  // nikon d7100 + lightroom

  expect(metaReader).not.toBeNull();

  const testFile = path.join(__dirname, 'testImage1-Nikon-D7100-Lightroom.jpg');
  expect(fs.lstatSync(testFile).isFile()).toBe(true);
  const expectedRating = 3;
  const expectedTag = 'Kategorie:Landschaft';

  const p = metaReader.init().then(() => {
    //console.log(`${__filename} - extractMeta - success`, tags);

    console.log(`${_logKey} - init - ready`);

    //readMeta(file, prepareOnlyCrawlerTags)
    return metaReader.readMeta(testFile, true);

  }).then((meta) => {

    console.log(`${_logKey} - meta-short=\n`, meta);

    expect(meta).not.toBeNull();
    expect(meta.file).toBe(testFile);
    expect(meta.rating).toBe(expectedRating);
    const containsTag = meta.tags.includes(expectedTag);
    expect(containsTag).toBe(true);

    //readMeta(file, prepareOnlyCrawlerTags)
    return metaReader.readMeta(testFile, false);

  }).then((meta) => {

    console.log(`${_logKey} - meta-long=\n`, meta);

    expect(meta).not.toBeNull();
    expect(meta.file).toBe(testFile);
    expect(meta.rating).toBe(expectedRating);
    const containsTag = meta.tags.includes(expectedTag);
    expect(containsTag).toBe(true);

    expect(meta.cameraModel).toBe('NIKON D7100');
    expect(!!meta.gpsLocation).toBe(true); //gpsLocation: 'Hirtshals | Region Nordjylland | Dänemark'

    return metaReader.shutdown();
  });

  return p;
}

// ----------------------------------------------------------------------------------

describe(_logKey, () => {

  it('readMeta-intern', () => {

    const metaReader = MetaReaderExiftool.createReader(null);

    const p = testImage1(metaReader);

    return p;
  });

  // .......................................................

  it('readMeta-extern', () => {

    if (!checkRequirementsExternReader())
      return;

    const metaReader = MetaReaderExiftool.createReader(_defaultExifToolPath);

    const p = testImage1(metaReader);

    return p;

  });

  // .......................................................

  it('findExifTool', () => {

    if (!checkRequirementsExternReader())
      return;

    const p = MetaReaderExiftool.findExifTool().then((exifToolFullPath) => {

      console.log('exifToolFullPath =', exifToolFullPath);
      expect(!!exifToolFullPath).toBe(true);
      const isFile = fs.lstatSync(exifToolFullPath).isFile();
      expect(isFile).toBe(true);

      return Promise.resolve();
    })

    return p;
  });

  // .......................................................

  it('readMeta-temp', () => {

    // if (!checkRequirementsExternReader())
    //   return;
    //
    // const metaReader = MetaReaderExiftool.createReader(_defaultExifToolPath);
    // expect(metaReader).not.toBeNull();
    //
    // const testFile = '/home/data/mymedia/201x/2015/20150815 Sammelsurium/20150823-1700-5579.jpg';
    // expect(fs.lstatSync(testFile).isFile()).toBe(true);
    //
    // const expectedRating = 3;
    // const expectedTag = 'Kategorie:Landschaft';
    //
    // const p = metaReader.init().then(() => {
    //
    //   //readMeta(file, prepareOnlyCrawlerTags)
    //   return metaReader.readMeta(testFile, true);
    //
    // }).then((meta) => {
    //
    //   console.log(`${_logKey} - meta=\n`, meta);
    //
    //   return metaReader.shutdown();
    // });
    //
    // return p;

  });

  // .......................................................

});
