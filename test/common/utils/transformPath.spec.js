import {shortenPathElements, separateFilePath, determinePathAndFilename} from "../../../app/common/utils/transfromPath";

describe('transfromPath', () => {


  it('shortenPathElements', () => {
    let pathOut;

    const pathIn = "/home/data/mymedia/201x/2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG";

    pathOut = shortenPathElements(pathIn, -3);
    expect(pathOut).toBe(".../2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG");
    pathOut = shortenPathElements(pathIn, -22);
    expect(pathOut).toBe(pathIn);

    pathOut = shortenPathElements(pathIn, 4);
    expect(pathOut).toBe(".../2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG");
    pathOut = shortenPathElements(pathIn, 22);
    expect(pathOut).toBe(".../20111029-2045-5153-ha.JPG");

  });


  it('separateFilePath', () => {
    let output;

    const pathIn = "/home/data/mymedia/201x/2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG";

    output = separateFilePath(pathIn, 4);
    expect(output.filename).toBe("20111029-2045-5153-ha.JPG");
    expect(output.dir).toBe(".../2011/20111029-Helke-Party");

    output = separateFilePath(null, 4);
    expect(output).not.toBeNull();
    expect(!!output.filename).toBe(false);
    expect(!!output.dir).toBe(false);
  });

  it('determinePathAndFilename', () => {

    let output = null;

    const item1 = {
      file: "/home/data/mymedia/201x/2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG",
      details: {
        filename: "file123.jpg",
        dir: "dir456"
      }
    };
    const item2 = {
      file: "/home/data/mymedia/201x/2011/20111029-Helke-Party/20111029-2045-5153-ha.JPG",
      filename: "file123.jpg",
      dir: "dir456"
    };

    output = determinePathAndFilename(item1, 4);
    expect(output.filename).toBe(item1.details.filename);
    expect(output.dir).toBe(item1.details.dir);

    output = determinePathAndFilename(item2, 4);
    expect(output.filename).toBe("20111029-2045-5153-ha.JPG");
    expect(output.dir).toBe(".../2011/20111029-Helke-Party");

    output = determinePathAndFilename(null, 4);
    expect(output).not.toBeNull();
  });

});
