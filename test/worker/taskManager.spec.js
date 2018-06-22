import * as constants from "../../app/common/constants";
import {TaskManager} from "../../app/worker/taskManager";

// case constants.ACTION_DUMMY_TASK:
// case constants.ACTION_OPEN:
//   return PRIO_OPEN;
// case constants.ACTION_DELIVER_FILE_META:
//   return PRIO_DELIVER_FILE_META;
// case constants.ACTION_CRAWLE_UPDATE_FILE:
//   return 2;
// case constants.ACTION_CRAWLE_EVAL_FOLDER:
//   return 3;
// case constants.ACTION_CRAWLE_UPDATE_FOLDER:
//   return 4;
// case constants.ACTION_CRAWLE_START_NEW:
//   return 5;

describe('TaskManager', () => {

  it('getPrio', () => {

    const testTasks = [
      { type: constants.ACTION_OPEN, payload: constants.ACTION_OPEN },
      { type: constants.ACTION_DELIVER_FILE_META, payload: constants.ACTION_DELIVER_FILE_META },
      { type: constants.ACTION_CRAWLE_UPDATE_FILE, payload: constants.ACTION_CRAWLE_UPDATE_FILE },
      { type: constants.ACTION_CRAWLE_EVAL_FOLDER, payload: constants.ACTION_CRAWLE_EVAL_FOLDER },
      { type: constants.ACTION_CRAWLE_UPDATE_FOLDER, payload: constants.ACTION_CRAWLE_UPDATE_FOLDER },
      { type: constants.ACTION_CRAWLE_START_NEW, payload: constants.ACTION_CRAWLE_START_NEW }
    ];

    let prio;

    for (let i = 0; i < testTasks.length; i++) {
      const task = testTasks[i];
      prio = TaskManager.getPrio(task.type);
      expect(prio).toBe(i);
    }

    prio = TaskManager.getPrio("should-not-exists");
    expect(prio).toBeNull();
  });

  it('pushTask + pullTask', () => {

    const testTasks = [
      { type: constants.ACTION_DELIVER_FILE_META, payload: constants.ACTION_DELIVER_FILE_META },
      { type: constants.ACTION_CRAWLE_UPDATE_FILE, payload: constants.ACTION_CRAWLE_UPDATE_FILE },
      { type: constants.ACTION_CRAWLE_EVAL_FOLDER, payload: constants.ACTION_CRAWLE_EVAL_FOLDER },
      { type: constants.ACTION_CRAWLE_UPDATE_FOLDER, payload: constants.ACTION_CRAWLE_UPDATE_FOLDER },
      { type: constants.ACTION_CRAWLE_START_NEW, payload: constants.ACTION_CRAWLE_START_NEW }
    ];

    const taskManager = new TaskManager();

    taskManager.pushTask({ type: constants.ACTION_OPEN, payload: 1 });
    expect(taskManager.getTaskCount()).toBe(1);
    taskManager.pushTask({ type: constants.ACTION_OPEN, payload: 2 });
    expect(taskManager.getTaskCount()).toBe(1); // removes old "open"-tasks

    taskManager.pushTask({ type: constants.ACTION_DELIVER_FILE_META, payload: 4 });
    expect(taskManager.getTaskCount()).toBe(2);

    taskManager.pushTask({ type: constants.ACTION_OPEN, payload: 5 });
    expect(taskManager.getTaskCount()).toBe(1); // removes old "open"-tasks + "delivery"

    taskManager.clearTasks(constants.ACTION_OPEN);

    expect(taskManager.getTaskCount()).toBe(0);

    let countTasks = taskManager.getTaskCount();
    expect(countTasks).toBe(0);

    for (let i = testTasks.length - 1; i >= 0; i--) {
      const task = testTasks[i];
      taskManager.pushTask(task);

      expect(taskManager.getTaskCount()).toBe(testTasks.length - i);
    }


    for (let i = 0; i < testTasks.length; i++) {
      expect(taskManager.getTaskCount()).toBe(testTasks.length - i);
      const task = taskManager.pullTask();
      expect(taskManager.getTaskCount()).toBe(testTasks.length - i - 1);

      expect(task.type).toBe(testTasks[i].type);
      expect(task.payload).toBe(testTasks[i].payload);

    }


  });



});
