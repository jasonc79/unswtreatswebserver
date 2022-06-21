import {getData, setData} from './dataStore.js';
function clearV1() {
  let data = getData();
  data.users = [];
  data.channels = [];
  data.messages = [];
  setData(data);
  return {};
}

export { clearV1 };
