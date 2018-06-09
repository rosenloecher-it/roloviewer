import { app } from 'electron';
import argly from 'argly';
import * as appConstants from '../appConstants';
import * as fileConfig from './configFromFiles';
import { isDevelopment, isProduction, isTest } from '../main.dev';


// https://github.com/patrick-steele-idem/argly

let module_exit_code = null;

function exit_process(exit_code) {
  module_exit_code = exit_code;
}

function createCliParser() {

  const defaultSlideshowConfig = fileConfig.getDefaultSlideShowConfig();

  return argly.createParser(
    {
      '--help -h': {
        type: 'boolean',
        description: 'Show this help message'
      },
      '--fullscreen -f': {
        type: 'boolean',
        description: 'Show fullscreen'
      },
      '--random -r': {
        type: 'boolean',
        description: 'Show media randomly'
      },
      '--open -o': {
        type: 'string',
        description: 'Open playlist or directory (default: using crawler)'
      },
      '--configfile -c': {
        type: 'string',
        description: `Explicit config file (default: ${defaultSlideshowConfig})`
      },
      '--screensaver -s': {
        type: 'boolean',
        description: 'Screensaver mode - quit at most user actions (mouse move + click, space)'
      },
      '--details -d': {
        type: 'boolean',
        description: 'Show details (exiftool installed)'
      },
      '--awake -a': {
        type: 'integer',
        description: 'Suppress sleep mode for [n] minutes'
      },
      '--transition -t': {
        type: 'integer',
        description: 'Transition time in milliseconds'
      }
    })
    .usage(appConstants.APP_NAME + " (v" + app.getVersion() + ')')
    .validate(function(result) {
        do {
          if (!validateHelp(this, result))
            break;
          if (!validateOpenAuto(this, result))
            break;
          if (!validateAwake(this, result))
            break;
          if (!validateTransition(this, result))
            break;

        } while (false);
    })
    .onError(function(err) {
      this.printUsage();
      console.error(err);
      exit_process(2);
    });
}


// ----------------------------------------------------------------------------------

function validateHelp(parser, result) {
  if (result.help) {
    parser.printUsage();
    exit_process(0);
    return false;
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

function validateOpenAuto(parser, result) {
  if (result.auto && result.open) {
    parser.printUsage();
    console.log('ERROR: choose one mode: file/directory or auto mode!');
    exit_process(1);
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

function validateAwake(parser, result) {
  if (result.awake) {

    if (Array.isArray(result.awake)) {
      parser.printUsage();
      console.log('ERROR: several occurences for awake!?');
      exit_process(1);

    } else if (result.awake === true) {
      parser.printUsage();
      console.log('ERROR: missing parameter for awake!');
      exit_process(1);
    }
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

function validateTransition(parser, result) {
  if (result.transition) {

    if (Array.isArray(result.transition)) {
      parser.printUsage();
      console.log('ERROR: several occurences for transition!?');
      exit_process(1);

    } else if (result.transition === true) {
      parser.printUsage();
      console.log('ERROR: missing parameter for transiton!');
      exit_process(1);
    }
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

export function parseCli(args) {

  const parser = createCliParser();

  module_exit_code = null;
  let result = parser.parse(args);

  if (result) {
    if (module_exit_code)
      result.exit_code = module_exit_code;
  } else {
    result = { exit_code: 99 };
  }

  if (isDevelopment)
    console.log("\ncli", result, "\n");

  return result;
}

export function showCommandLineUsage(args) {
  console.log("")
}
