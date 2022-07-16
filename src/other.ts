import { getData, setData, Data } from './dataStore';

/*
Clears the users and channels array in datastore

Return Value:
    Returns {} on successful clear

*/
function clearV1(): object {
  const data: Data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  setData(data);
  return {};
}

export { clearV1 };
