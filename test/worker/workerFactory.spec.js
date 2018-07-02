import {WorkerFactory} from "../../app/worker/workerFactory";
import {TestProcessConnector} from "./testProcessConnector";

describe('WorkerFactory', () => {

  it('WorkerFactory.loadObjects + .shutdownObjects', () => {

    const processConnector = new TestProcessConnector();

    const testObjects = {
      processConnector
    };

    const factory = new WorkerFactory();
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
