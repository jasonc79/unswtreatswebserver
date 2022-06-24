import {getData, setData} from './dataStore.js';

/*
Clears the users and channels array in datastore

Return Value:
    Returns {} on successful clear

*/
function clearV1() {
  let data = getData();
  data.users = [];
  data.channels = [];
  setData(data);
  return {};
}

export { clearV1 };
