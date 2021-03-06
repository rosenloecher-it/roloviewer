import fs from "fs";
import path from "path";
import Cli from "../../app/main/cli";


describe('cli', () => {

  it('all args', () => {

    const app = '/path/binary';
    const pathConfFile = __filename; // has to exist no changes


    let args = null;
    let output = null;
    let compare = null;

    const cli = new Cli();

    compare = { autoselect: true, exitCode: null };
    args = [ app, '--autoselect' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-a' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { configfile: pathConfFile, exitCode: null };
    args = [ app, '--configfile', pathConfFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-c', pathConfFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { configreadonly: true, exitCode: null };
    args = [ app, '--configreadonly' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { fullscreen: true, exitCode: null };
    args = [ app, '--fullscreen' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-f' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { help: true, exitCode: 0 };
    args = [ app, '--help' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-h' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { screensaver: true, exitCode: null };
    args = [ app, '--screensaver' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-s' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    // console.log("cli output:", output);

    expect(cli.shouldExit()).toBe(false);

  });

  it('open', () => {
    //const testFile = path.join(__dirname, );

    let args = null;
    let output = null;
    let compare = null;

    const pathImageFile = path.join(process.cwd(), 'test', 'worker', 'crawler', 'testImage1-Nikon-D7100-Lightroom.jpg');
    output = fs.lstatSync(pathImageFile).isFile();
    expect(output).toBe(true);


    const cli = new Cli();

    const app = '/path/binary';

    // open file
    compare = { open: pathImageFile, exitCode: null };
    args = [ app, pathImageFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-o', pathImageFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { open: pathImageFile, exitCode: null };
    args = [ app, '--open', pathImageFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-o', pathImageFile ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    // open dir
    const pathDir = __dirname; // has to exist no changes

    compare = { open: pathDir, exitCode: null };
    args = [ app, '--open', pathDir ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-o', pathDir ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

  });

  it('wrong config', () => {
    const app = '/path/binary'; // first arg is ignored
    const notExistingPath = '/path/binary/should_not_exitsas/CSDDCASDVFSDVsdc';
    let args = null;
    let output = null;

    const cli = new Cli();

    args = [ app, '--open', notExistingPath ];
    output = cli.parseArray(args);
    expect(output.exitCode).not.toBeNull();
    expect(output.exitCode).toBeGreaterThan(0);

    expect(cli.shouldExit()).toBe(true);

    // console.log("cli output:", output);
  });

  it('cat first args', () => {
    let argsIn = null;
    let argsOut = null;

    const remainingArg = '--remarg';
    //  [ '/home/data/projects/electron/roloviewer/node_modules/electron/dist/electron', './app/', --realArg ]

    argsIn = [ '/home/data/projects/electron/roloviewer/node_modules/electron/dist/electron', './app/', remainingArg ];
    argsOut = Cli.prepareArgsForParser(argsIn);
    expect(argsOut.length).toBe(0);

    argsIn = [ '../rolosider', remainingArg ];
    argsOut = Cli.prepareArgsForParser(argsIn);
    expect(argsOut.length).toBe(1);
    expect(argsOut[0]).toBe(remainingArg);



  });
});
