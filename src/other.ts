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
  setData(data);
  return {};
}

export { clearV1 };
