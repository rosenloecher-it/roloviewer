import {MetaReader} from '../../app/worker/metaReader';
import {ConfigWorker} from "../../app/worker/workerConfig";

describe('reading meta via exiftool', () => {

  it('load meta - nikon', () => {

    const config = new ConfigWorker();

    const metaReader = new MetaReader();
    metaReader.coupleObjects({ config });
    return metaReader.init();

    // return metaReader.extractMeta('/home/data/mymedia/201x/2018/20180521-urlaub-böhmisches-paradies/20180513-1405-2608d.jpg')
    //   .then(function(tags) {
    //     console.log(`${__filename} - extractMeta - success`, tags);
    //
    //
    //
    //     expect(1 + 2).toBe(3);
    //   });

      // .catch (function() {
      //   console.log(`${__filename} - extractMeta - failed`);
      // });

    // console.log(meta);
    // const result = 3;
    // expect(1 + 2).toBe(result);
  });

});
