import * as vali from "../../../app/common/utils/validate";
import {valiBoolean} from "../../../app/common/utils/validate";
import {mergeConfigItem} from "../../../app/common/utils/validate";

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

});
