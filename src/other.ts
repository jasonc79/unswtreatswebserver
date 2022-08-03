import { getData, setData, Data, empty } from './dataStore';
/**
 * clearV1
 * Resets the internal data of the application to its initial state
 *
 * @returns {} when no error
 */

function clearV1(): empty {
  const data: Data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  data.channelsExist = [];
  data.dmsExist = [];
  data.messagesExist = [];
  data.totalMessagesExist = 0;
  data.totalDmsExist = 0;
  data.totalChannelsExist = 0;
  data.standups = [];
  data.resetCodes = [];
  setData(data);
  return {};
}

export { clearV1 };
