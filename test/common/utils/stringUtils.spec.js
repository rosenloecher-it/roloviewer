import * as stringUtils from "../../../app/common/utils/stringUtils";

describe('stringUtils', () => {

  it ('shortenText', () => {
    let output;

    const input = "123456789";

    output = stringUtils.shortenString(input, 2);
    expect(output).toBe("");

    output = stringUtils.shortenString(input, 3);
    expect(output).toBe("...");
    output = stringUtils.shortenString(input, 6);
    expect(output).toBe("123...");
    output = stringUtils.shortenString(input, 8);
    expect(output).toBe("12345...");

    output = stringUtils.shortenString(input, 9);
    expect(output).toBe(input);
    output = stringUtils.shortenString(input, 10);
    expect(output).toBe(input);

  });


});
