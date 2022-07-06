import { error, message, channel, userInfo, channelId, getData, setData, user, data } from "./dataStore";

/*
Clears the users and channels array in datastore

Return Value:
    Returns {} on successful clear

*/
function clearV1(): Object {
  let data: data = getData();
  data.users = [];
  data.channels = [];
  setData(data);
  return {};
}

export { clearV1 };

