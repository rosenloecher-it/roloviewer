import {Factory} from "../../app/worker/crawler/factory";
import {TestProcessConnector} from "./testProcessConnector";

describe('Factory', () => {

  it('Factory.loadObjects + .shutdownObjects', () => {

    const processConnector = new TestProcessConnector();

    const testObjects = {
      processConnector
    };

    const factory = new Factory();
    return factory.loadObjects(testObjects).then(() => {

      expect(factory.getDispatcher()).not.toBeNull();

      // startup successfully




      return factory.shutdownObjects().then(() => {
        expect(factory.getDispatcher()).toBeNull();
        // shutdown successfully
        return true;
      })
    });
  });



});
