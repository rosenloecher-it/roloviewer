import Cli from "../../../app/main/config/cli";

describe('cli', () => {

  it('all args', () => {

    const app = '/path/binary';
    const conf = '/path/config';
    let args = null;
    let output = null;
    let compare = null;

    const cli = new Cli();

    compare = { auto: true, exitCode: null };
    args = [ app, '--auto' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-a' ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));

    compare = { configfile: conf, exitCode: null };
    args = [ app, '--configfile', conf ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-c', conf ];
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

    compare = { open: conf, exitCode: null };
    args = [ app, '--open', conf ];
    output = cli.parseArray(args);
    expect(JSON.stringify(output)).toBe(JSON.stringify(compare));
    args = [ app, '-o', conf ];
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
  });

  it('wrong config', () => {
    const app = '/path/binary';
    const conf = '/path/config';
    let args = null;
    let output = null;
    let compare = null;

    const cli = new Cli();

    compare = { auto: true, open: conf, exitCode: null };
    args = [ app, '--auto', '--open' ];
    output = cli.parseArray(args);
    expect(output.exitCode).not.toBeNull();
    expect(output.exitCode).toBeGreaterThan(0);

    // console.log("cli output:", output);
  });

});
