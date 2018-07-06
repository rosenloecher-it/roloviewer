import deepmerge from 'deepmerge';
import * as constants from "./constants";

// ----------------------------------------------------------------------------------

export class ConfigBase {
  constructor() {
    this.data = {};

    this.clearData = this.clearData.bind(this);
    this.ensureDefaultData = this.ensureDefaultData.bind(this);
    this.exportData = this.exportData.bind(this);
    this.importData = this.importData.bind(this);

    this.ensureDefaultData();
  }

  // ........................................................

  ensureDefaultData() {
    if (!this.data)
      this.data = {};

    const { data } = this;

    if (!data.context)
      data.context = {};
    if (!data.crawler)
      data.crawler = {};
    if (!data.mainwindow)
      data.mainwindow = {};
    if (!data.slideshow)
      data.slideshow = {};
    if (!data.lastItems)
      data.lastItems = {};
    if (!data.system)
      data.system = {};
  }

  // ........................................................
  // import/export

  clearData() {
    this.data = {};
    ensureDefaultData();
  }

  exportData() {
    const clone = deepmerge.all([ this.data, {} ]);
    return clone;
  }

  importData(dataUpdate) {

    if (dataUpdate)
      this.data = deepmerge.all([ dataUpdate, {} ]);
    else
      clearData();
  }

  // ........................................................
  // common

  isDevelopment() { return this.data.context.isDevelopment; }
  isProduction() { return this.data.context.isProduction; }
  isTest() { return this.data.context.isTest; }
  showDevTools() { return this.data.context.showDevTools; }

  get lastAutoPlay() { return this.data.lastItems.autoPlay; }
  set lastAutoPlay(value) { this.data.lastItems.autoPlay = !!value;  }

  // ........................................................
  // renderer

  get slideshowTimer() { return this.data.slideshow.timer; }
  set slideshowTimer(value){ this.data.slideshow.timer = value;  }

  get slideshowTransitionTimeAutoPlay() { return this.data.slideshow.transitionTimeAutoPlay; }
  set slideshowTransitionTimeAutoPlay(value){ this.data.slideshow.transitionTimeAutoPlay = value;  }

  get slideshowTransitionTimeManual() { return this.data.slideshow.transitionTimeManual; }
  set slideshowTransitionTimeManual(value){ this.data.slideshow.transitionTimeManual = value; }

  // ........................................................
  // worker

  get exiftoolPath() { return this.data.system.exiftool; }
  set exiftoolPath(value){ this.data.system.exiftool = value;  }

  get crawlerDatabase() { return this.data.crawler.database; }
  set crawlerDatabase(value){ this.data.crawler.database = value;  }

  get crawlerBatchCount() { return (this.data.crawler.batchCount || constants.DEFCONF_CRAWLER_BATCHCOUNT); }
  set crawlerBatchCount(value){ this.data.crawler.batchCount = value;  }

  get crawlerFolderSource() { return this.data.crawler.folderSource; }
  set crawlerFolderSource(value) { this.data.crawler.folderSource = value;  }

  get crawlerFolderBlacklist() { return this.data.crawler.folderBlacklist || []; }
  set crawlerFolderBlacklist(value){ this.data.crawler.folderBlacklist = value;  }

  get crawlerFolderBlacklistSnippets() { return this.data.crawler.folderBlacklistSnippets || []; }
  set crawlerFolderBlacklistSnippets(value){ this.data.crawler.folderBlacklistSnippets = value;  }

  // ........................................................


}
