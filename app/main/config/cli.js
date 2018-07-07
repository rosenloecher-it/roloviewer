import argly from 'argly';
import * as constants from '../../common/constants';

// ----------------------------------------------------------------------------------

// https://github.com/patrick-steele-idem/argly

// ----------------------------------------------------------------------------------

export default class Cli {

  constructor(config) {
    this.data = {};

    this.config = config;
    this.parser = null;

    this.arglyError = this.arglyError.bind(this);
    this.arglyValidate = this.arglyValidate.bind(this);
    this.createCliParser = this.createCliParser.bind(this);
    this.parseArray = this.parseArray.bind(this);
    this.storeExitCode = this.storeExitCode.bind(this);

    this.initData();
  }

  // ........................................................

  initData() {
    this.data = {
      exitCode: null,
      argsIn: null
    }
  }
  // ........................................................

  createCliParser() {

    const instance = this;

    let defaultConfigInfo = "";
    if (this.config)
      defaultConfigInfo = ` (default: ${this.config.defaultConfigFile})`;

    return argly
      .createParser({
        '--auto -a': {
          type: 'boolean',
          description: 'Auto-select images (config source in config file)'
        },
        '--configfile -c': {
          type: 'string',
          description: `Explicit config file ${defaultConfigInfo}`
        },
        '--configreadonly': {
          type: 'boolean',
          description: 'Do not wite changes to config file'
        },
        '--fullscreen -f': {
          type: 'boolean',
          description: 'Show fullscreen'
        },
        '--help -h': {
          type: 'boolean',
          description: 'Show this help message'
        },
        '--open -o': {
          type: 'string',
          description: 'Open playlist or directory (default: using crawler)'
        },
        '--screensaver -s': {
          type: 'boolean',
          description:
            'Screensaver mode - quit at most user actions (mouse move + click, space)'
        }
      })
      .usage(`${constants.APP_TITLE} v(${constants.APP_VERSION})`)
      .validate(instance.arglyValidate)
      .onError(instance.arglyError);
  }

  // ........................................................

  parseArray(args) {
    if (!this.parser)
      this.parser = this.createCliParser(this);

    this.initData();
    this.data.argsIn = args; // store for logging, when logger is initialized

    const argsForParser = args.slice(1); // skip first arg ($0 == binary)
    let output = this.parser.parse(argsForParser);
    if (output) {
      output.exitCode = this.data.exitCode;
    } else
      output = { exitCode: 99 };

    return output;
  }

  // ........................................................

  parseFile() {

  }

  // ........................................................

  storeExitCode(exitCode) {
    this.data.exitCode = exitCode;
  }

  // ........................................................

  arglyValidate(result) {
    if (result.help) {
      this.parser.printUsage();
      this.storeExitCode(0);
      return; // abort
    }

    if (result.auto && result.open) {
      this.parser.printUsage();
      console.log('ERROR: choose one mode: file/directory or auto mode!');
      this.storeExitCode(1);
      return; // abort
    }

    // ok
  }

  // ........................................................

  arglyError(err) {
    this.parser.printUsage();
    console.error(err);
    this.storeExitCode(2);
  }

  // ........................................................

  get args() { return this.data.argsIn; }
}

// ----------------------------------------------------------------------------------
