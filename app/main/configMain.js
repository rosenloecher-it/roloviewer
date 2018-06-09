import fs from 'fs';
import * as configCli from "./configFromCli";
import * as configFiles from "./configFromFiles";
import * as appConstants from '../appConstants';
import {isProduction} from "../main.dev";
import {parseCli} from "./configFromCli";

// ----------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------

function transformInt(input) {

  const num = parseInt(input, 10);

  if (isNaN(num))
    return null;
  else
    return num;
}

// ----------------------------------------------------------------------------------

function findExifTool(dataFromFile) {

  if (dataFromFile)
    return dataFromFile;
  else
    return "todo-search-fs";
}

// ----------------------------------------------------------------------------------

export class ConfigMain {

  constructor() {

    // to test whether we have singleton or not
    this.time = new Date();

    this.dataCli = {};
    this.data = ConfigMain.createDefaultData();

  }

  // ........................................................

  static createDefaultData() {
    let data = {
      system: {},
      slideshow: {},
      crawler: {}
    };

    return data;
  }

  // ........................................................

  parseCli() {

    let args;

    if (isProduction)
      args = process.argv;
    else {
      //const args_text = '-r -o fff -a 12 -t 12'.split(' ');
      const args_text = appConstants.DEBUG_ARGS;

      if (!args_text && 0 < args_text.trim.length)
        args = (args_text).split(' ');
    }

    try {
      if (args) {
        console.log("parseCli - args:", args);
        this.dataCli = configCli.parseCli(args);
      } else
        this.dataCli = {};
    } catch (err) {
      console.log("ERROR ConfigMain.parseCli: ", err)
    } finally {
      if (!this.dataCli)
        this.dataCli = {};
    }

  }

  // ........................................................

  shouldExit() {
    return (this.dataCli && this.dataCli.exit_code);
  }

  // ........................................................

  getExitCode() {
    if (this.dataCli)
      return this.dataCli.exit_code;
    else
      return null;
  }

  // ........................................................

  mergeRating(input) {
    if (!Array.isArray(input))
      return [];

    let output = [];

    for (let text of input) {

      const value = transformInt(text);

      if (typeof(value) != typeof(1))
        continue;
      if (value < 0 || value > 5)
        continue;

      if (!output.includes(value))
        output.push(value);
    }

    return output;
  }

  // ........................................................

  mergeStringArray(input) {

    if (!Array.isArray(input))
      return [];

    let output = [];

    for (let text of input) {

      if (typeof(text) != typeof("str"))
        continue;

      const value = text.trim().toLowerCase();
      if (!output.includes(value))
        output.push(value);
    }

    return output;
  }

  // ........................................................

  mergePathArray(input) {

    if (!Array.isArray(input))
      return [];

    let output = [];

    for (let text of input) {

      if (typeof(text) != typeof("str"))
        continue;
      if (!fs.existsSync(text))
        continue;

      if (!output.includes(text))
        output.push(text);
    }

    return output;
  }

  // ........................................................

  validateLogLevel(input) {

    if (typeof(input) !== typeof("str"))
      return null;

    const output = input.trim().toLowerCase();

    if (output === "info")
      return output;
    if (output === "error")
      return output;
    if (output === "warn")
      return output;

    return null;
  }

  // ........................................................

  mergeItem(valueDef, valueCli, valueFile) {

    if (typeof(valueDef) === typeof(valueCli))
      return valueCli;
    if (typeof(valueDef) === typeof(valueFile))
      return valueFile;

    return valueDef;
  }

  // ........................................................

  mergeData(data, dataFromCli, dataFromFile) {

    if (!dataFromCli)
      dataFromCli = {};

    if (!dataFromFile)
      dataFromFile = {};
    if (!dataFromFile.system)
      dataFromFile.system = {};
    if (!dataFromFile.slideshow)
      dataFromFile.slideshow = {};
    if (!dataFromFile.crawler)
      dataFromFile.crawler = {};

    data.system.exiftool = findExifTool(dataFromFile.system.exiftool);

    data.system.loglevel = this.mergeItem(appConstants.DEFCONF_LOGLEVEL,
      this.validateLogLevel(dataFromCli.loglevel),
      this.validateLogLevel(dataFromFile.system.loglevel));

    data.slideshow.fullscreen = this.mergeItem(appConstants.DEFCONF_FULLSCREEN,
      dataFromCli.fullscreen,
      dataFromFile.slideshow.fullscreen);

    data.slideshow.transition = this.mergeItem(appConstants.DEFCONF_TRANSITION,
      transformInt(dataFromCli.transition),
      transformInt(dataFromFile.slideshow.transition));

    data.slideshow.random = this.mergeItem(appConstants.DEFCONF_RANDOM,
      dataFromCli.random,
      dataFromFile.slideshow.random);

    data.slideshow.awake = this.mergeItem(appConstants.DEFCONF_AWAKE,
      transformInt(dataFromCli.awake),
      transformInt(dataFromFile.slideshow.awake));

    data.slideshow.screensaver = this.mergeItem(appConstants.DEFCONF_SCREENSAVER,
      dataFromCli.screensaver,
      null);

    data.slideshow.details = this.mergeItem(appConstants.DEFCONF_DETAILS,
      dataFromCli.details,
      dataFromFile.slideshow.details);

    data.slideshow.open = this.mergeItem(null,
      dataFromCli.open,
      dataFromFile.slideshow.open);
    if (!fs.existsSync(this.data.slideshow.open))
      this.data.slideshow.open = null;

    data.crawler.database = this.mergeItem(configFiles.getDefaultCreawlerDb(),
      null,
      dataFromFile.crawler.database);

    data.crawler.show_rating = this.mergeRating(dataFromFile.crawler.show_rating);
    data.crawler.tag_show = this.mergeStringArray(dataFromFile.crawler.tag_show);
    data.crawler.tag_blacklist = this.mergeStringArray(dataFromFile.crawler.tag_blacklist);
    data.crawler.path_show = this.mergePathArray(dataFromFile.crawler.path_show);
    data.crawler.path_blacklist = this.mergePathArray(dataFromFile.crawler.path_blacklist);


  }

  // ........................................................

  mergeConfigFiles() {

    let useDefaultConfigFile = false;

    if (this.dataCli.config) {
      if (fs.existsSync(this.dataCli.config))
        this.data.system.config = this.dataCli.config;
      else {
        console.log("ConfigMain.mergeConfigFiles: use default config - not exists: " + this.dataCli.config);
      }
    }

    if (!this.data.config)
      this.data.system.config = configFiles.getDefaultSlideShowConfig();

    let loadedDataFromFile = false;
    let dataFromFile;
    try {
      dataFromFile = configFiles.loadConfigFile(this.data.system.config);
      loadedDataFromFile = true;
    } catch (err) {
      console.log("ERROR ConfigMain.mergeConfigFiles (loadFile): ", err)
    }

    //console.log("mergeConfigFiles - dataFromFile", dataFromFile);

    this.mergeData(this.data, this.dataCli, dataFromFile);

    //console.log("mergeConfigFiles", this.data);

    if (!loadedDataFromFile && !useDefaultConfigFile) {
      try {
        configFiles.createDummyConfigFile();
      } catch (err) {
        console.log("ERROR ConfigMain.mergeConfigFiles (createDummyConfigFile): ", err)
      }
    }

  }
}

// ----------------------------------------------------------------------------------

const instanceConfigMain = new ConfigMain();

export default instanceConfigMain;

