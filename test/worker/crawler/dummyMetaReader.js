import {CrawlerBase} from "../../../app/worker/crawler/crawlerBase";

export class DummyMetaReader extends CrawlerBase {

  constructor() {
    super();

  }

  // ........................................................

  // ........................................................

  deliverMeta(file) {
    const func = ".deliverMeta";

    const p = new Promise((resolve, reject) => {

      resolve({});
    });

    return p;
  }

}

// ----------------------------------------------------------------------------------


// ----------------------------------------------------------------------------------
