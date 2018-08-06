import * as vali from "../../../app/common/utils/validate";

describe('validate', () => {

  it('valiFolderArray', () => {

    const output = vali.valiFolderArray(null);

    expect(output).not.toBeNull();
    expect(Array.isArray(output)).toBe(true);


  });

  it('valiBoolean', () => {

    let output = null;

    output = vali.valiBoolean(null);
    expect(output).toBeNull();

    output = vali.valiBoolean(false);
    expect(output).toBe(false);

    output = vali.valiBoolean(true);
    expect(output).toBe(true);

    output = vali.valiBoolean("false ");
    expect(output).toBe(false);

    output = vali.valiBoolean(" TRUE ");
    expect(output).toBe(true);

    output = vali.valiBoolean('undefined');
    expect(output).toBe(null);



  });

  it('mergeConfigItem', () => {

    let output = null;

    output = vali.mergeConfigItem(false, null, null);
    expect(output).toBe(false);

    output = vali.mergeConfigItem(false, undefined, null);
    expect(output).toBe(false);

    output = vali.mergeConfigItem(false, null, undefined);
    expect(output).toBe(false);

    output = vali.mergeConfigItem(false, true, null);
    expect(output).toBe(true);

    output = vali.mergeConfigItem(false, null, true);
    expect(output).toBe(true);

  });

  it('mergeIntItem', () => {

    let output = null;

    output = vali.mergeIntItem(1, '2');
    expect(output).toBe(2);

    output = vali.mergeIntItem(1, 'sadfsaf', '3');
    expect(output).toBe(3);

    output = vali.mergeIntItem(1, null, '3');
    expect(output).toBe(3);

  });

  
  it('valiLogLevel', () => {

    let output = null;

    const logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

    output = vali.valiLogLevel(null);
    expect(output).toBe(null);

    output = vali.valiLogLevel('sadfcascvsadcv');
    expect(output).toBe(null);

    for (let i = 0; i < logLevels.length; i++) {
      const logLevel = logLevels[i];
      output = vali.valiLogLevel(logLevel.toUpperCase());
      expect(output).toBe(logLevel);
    }


  });

});
