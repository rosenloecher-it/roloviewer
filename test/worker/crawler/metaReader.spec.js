import {MetaReader} from '../../../app/worker/crawler/metaReader';
import {isWinOs} from "../../../app/common/utils/systemUtils";
import fs from "fs";

// ----------------------------------------------------------------------------------

describe('metaReader', () => {

  it('meta2MapUrl', () => {

    let format = null;
    let meta = null;
    let url = null;

    meta = {
      gpsLatitude: 60.88714333,
      gpsLatitudeRef: 'North',
      gpsLongitude: 6.853205,
      gpsLongitudeRef: 'East',
      gpsPosition: '60.88714333 N, 6.85320500 E',
    };

    format = 'http://www.openstreetmap.org/?mlat=<LATI_NUM>&mlon=<LONG_NUM>&zoom=15&layers=M'

    url = MetaReader.formatGpsMeta(meta, format);
    console.log('formatGpsMeta', url);

    expect(url).not.toBeNull();

    // const metaReader = new MetaReader();
    // metaReader.coupleObjects({ config });
    // return metaReader.init();

    // return metaReader.extractMeta('/home/data/mymedia/201x/2018/20180521-urlaub-böhmisches-paradies/20180513-1405-2608d.jpg')
    //   .then(function(tags) {
    //     console.log(`${__filename} - extractMeta - success`, tags);
    //
    //
    //
    //     expect(1 + 2).toBe(3);
    //   });

  });


});
