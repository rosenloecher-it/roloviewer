import fs from 'fs';
import path from 'path';
import {CrawlerBase} from "../../../app/worker/crawler/crawlerBase";
import {DummyTestSystem} from "./dummyTestSystem";
import * as rendererActions from "../../../app/common/store/rendererActions";

// ----------------------------------------------------------------------------------

export class DummyMetaReader extends CrawlerBase {

  loadMeta(file) {
    const p = new Promise((resolve, reject) => {

      if (!fs.existsSync(file))
        reject(new Error('file does not exist!'));

      const fileItem = DummyTestSystem.readTestFile(file);

      const splittedPath = path.parse(file);
      const meta = {
        file,
        filename: splittedPath.base,
        dir: splittedPath.dir,
      };

      meta.rating = fileItem.rating || 0;
      meta.tags = fileItem.tags || [];
      meta.time = fileItem.time || 0;

      resolve(meta);
    });

    return p;
  }

  // ........................................................

  deliverMeta(file) {
    const instance = this;

    const p = new Promise((resolve, reject) => {

      const fileItem = DummyTestSystem.readTestFile(file);

      if (fs.existsSync(file))
        reject(new Error(`file (${file}) does not exist!`));

      const splittedPath = path.parse(file);
      const meta = {
        file,
        filename: splittedPath.base,
        dir: splittedPath.dir,
      };

      meta.tags = fileItem.tags || [];
      meta.rating = fileItem.rating || 0;
      meta.time = fileItem.time || 0;

      const action = rendererActions.createActionDeliverFileMeta(meta);
      instance.objects.storeManager.dispatchRemote(action, null);

      resolve({});
    });

    return p;
  }

}

// ----------------------------------------------------------------------------------

