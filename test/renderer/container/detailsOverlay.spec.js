import {shortenPathElements} from "../../../app/renderer/containers/detailsOverlay";
import path from 'path';

describe('detailsOverlay', () => {


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


});
