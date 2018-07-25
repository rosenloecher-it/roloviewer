import fs from 'fs';
import {CrawlerBase} from "../../../app/worker/crawler/crawlerBase";
import {DummyTestSystem} from "./dummyTestSystem";
import {separateFilePath} from "../../../app/common/utils/transfromPath";
import * as rendererActions from "../../../app/common/store/rendererActions";

// ----------------------------------------------------------------------------------

export class DummyMetaReader extends CrawlerBase {

  constructor() {
    super();

  }

  // ........................................................

  loadMeta(file) {
    const p = new Promise((resolve, reject) => {

      if (!fs.existsSync(file))
        reject(new Error('file does not exist!'));

      const fileItem = DummyTestSystem.readTestFile(file);

      const sepPath = separateFilePath(file, 4);
      const meta = {
        file,
        filename: sepPath.filename,
        dir: sepPath.dir,
      };

      meta.rating = fileItem.rating || 0;
      meta.tags = fileItem.tags || [];

      resolve(meta);
    });

    return p;
  }

  // ........................................................

  deliverMeta(file) {
    const instance = this;

    const p = new Promise((resolve, reject) => {

      const fileItem = DummyTestSystem.readDummyFile(file);

      if (fs.existsSync(file))
        reject(new Error('file does not exist!'));

      const sepPath = separateFilePath(file, 4);
      const meta = {
        file,
        filename: sepPath.filename,
        dir: sepPath.dir,
      };

      meta.tags = fileItem.rating || 0;
      meta.rating = fileItem.tags || [];

      const action = rendererActions.createActionDeliverFileMeta(meta);
      instance.objects.storeManager.dispatchRemote(action, null);

      resolve({});
    });

    return p;
  }

}

// ----------------------------------------------------------------------------------

