import * as constants from "../constants";

export const deliverFileMeta = (meta) => ({
  type: constants.ACTION_DELIVER_FILE_META,
  payload: { meta }
});
