import { getData, setData, Data } from './dataStore';
/**
 * clearV1
 * Resets the internal data of the application to its initial state
 *
 * @returns {} when no error
 */

function clearV1(): object {
  const data: Data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  data.standups = [];
  setData(data);
  return {};
}

export { clearV1 };
