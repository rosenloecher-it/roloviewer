import argly from 'argly';
import * as constants from '../../common/constants';
import * as configUtils from './configUtils';
import { isProduction } from '../main.dev';

// https://github.com/patrick-steele-idem/argly

// ----------------------------------------------------------------------------------

let cliExitCode = null;

// ----------------------------------------------------------------------------------

function storeCliExitCode(exitCode) {
  cliExitCode = exitCode;
}

// ----------------------------------------------------------------------------------

function createCliParser() {
  const defaultSlideshowConfig = configUtils.getDefaultConfigPathStd();

  return argly
    .createParser({
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
        description:
          'Screensaver mode - quit at most user actions (mouse move + click, space)'
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
    .usage(`${constants.APP_TITLE} v(${constants.APP_VERSION})`)
    .validate(function arglyValidate(result) {
      if (!validateHelp(this, result)) return;
      if (!validateOpenAuto(this, result)) return;

      validateAwake(this, result);
      validateTransition(this, result);
    })
    .onError(function arglyOnError(err) {
      this.printUsage();
      console.error(err);
      storeCliExitCode(2);
    });
}

// ----------------------------------------------------------------------------------

function validateHelp(parser, result) {
  if (result.help) {
    parser.printUsage();
    storeCliExitCode(0);
    return false;
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

function validateOpenAuto(parser, result) {
  if (result.auto && result.open) {
    parser.printUsage();
    console.log('ERROR: choose one mode: file/directory or auto mode!');
    storeCliExitCode(1);
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

function validateAwake(parser, result) {
  if (result.awake) {
    if (Array.isArray(result.awake)) {
      parser.printUsage();
      console.log('ERROR: several occurences for awake!?');
      storeCliExitCode(1);
    } else if (result.awake === true) {
      parser.printUsage();
      console.log('ERROR: missing parameter for awake!');
      storeCliExitCode(1);
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
      storeCliExitCode(1);
    } else if (result.transition === true) {
      parser.printUsage();
      console.log('ERROR: missing parameter for transiton!');
      storeCliExitCode(1);
    }
  }

  return true; // proceed checks
}

// ----------------------------------------------------------------------------------

export default function parseArgs(args) {
  const parser = createCliParser();

  cliExitCode = null;
  let result = parser.parse(args);

  if (result) {
    if (cliExitCode) result.exit_code = cliExitCode;
  } else {
    result = { exit_code: 99 };
  }

  if (!isProduction)
    console.log('\ncli', result, '\n');

  return result;
}

// ----------------------------------------------------------------------------------
