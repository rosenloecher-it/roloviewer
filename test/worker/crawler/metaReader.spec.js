import * as metaReader from '../../../app/worker/crawler/metaReader';

// export const LATI_ABS = "<LATI_ABS>";
// export const LATI_NUM = "<LATI_NUM>";
// export const LATI_REF = "<LATI_REF>";
// export const LATI_REL = "<LATI_REL>";
// export const LONG_ABS = "<LONG_ABS>";
// export const LONG_NUM = "<LONG_NUM>";
// export const LONG_REF = "<LONG_REF>";
// export const LONG_REL = "<LONG_REL>";

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

    url = metaReader.formatGpsMeta(meta, format);
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
