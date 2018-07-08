import * as vali from "../../app/common/utils/validate";

describe('validate', () => {

  it('validateFolderArray', () => {

    const output = vali.validateFolderArray(null);

    expect(output).not.toBeNull();
    expect(Array.isArray(output)).toBe(true);


  });

});
