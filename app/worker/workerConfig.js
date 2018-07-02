import deepmerge from 'deepmerge';
import * as constants from "../common/constants";

// ----------------------------------------------------------------------------------

export class ConfigWorker {

  constructor() {

    this.data = ConfigWorker.createDefaultData();
  }

  // ........................................................

  static createDefaultData() {
    const data = {
      context: {},
      crawler: {},
      system: {}
    };

    return data;
  }

  // ........................................................

  init() {
    this.data = ConfigWorker.createDefaultData();
  }

  // ........................................................

  pushMainConfig(dataUpdate) {

    if (dataUpdate.context)
      this.data.context = deepmerge.all([ dataUpdate.context, {} ]);

    if (dataUpdate.system)
      this.data.system = deepmerge.all([ dataUpdate.system, {} ]);

    if (dataUpdate.crawler)
      this.data.crawler = deepmerge.all([ dataUpdate.crawler, {} ]);

  }

  // ........................................................

  isDevelopment() { return this.data.context.isDevelopment; }
  isProduction() { return this.data.context.isProduction; }
  isTest() { return this.data.context.isTest; }
  showDevTools() { return this.data.context.showDevTools; }

  // ........................................................

  get exiftoolPath() { return this.data.system.exiftool; }
  set exiftoolPath(value){ this.data.system.exiftool = value;  }

  // ........................................................

  get crawlerDatabase() { return this.data.crawler.database; }
  set crawlerDatabase(value){ this.data.crawler.database = value;  }

  // ........................................................

  get crawlerBatchCount() { return (this.data.crawler.batchCount || constants.DEFCONF_CRAWLER_BATCHCOUNT); }
  set crawlerBatchCount(value){ this.data.crawler.batchCount = value;  }

  // ........................................................

  get crawlerFolderSource() { return this.data.crawler.folderSource; }
  set crawlerFolderSource(value){ this.data.crawler.folderSource = value;  }

  // ........................................................

  get crawlerFolderBlacklist() { return this.data.crawler.folderBlacklist || []; }
  set crawlerFolderBlacklist(value){ this.data.crawler.folderBlacklist = value;  }

  // ........................................................

  get crawlerFolderBlacklistSnippets() { return this.data.crawler.folderBlacklistSnippets || []; }
  set crawlerFolderBlacklistSnippets(value){ this.data.crawler.folderBlacklistSnippets = value;  }

  // ........................................................


}

// ----------------------------------------------------------------------------------

const instanceConfigWorker = new ConfigWorker();

export default instanceConfigWorker;
