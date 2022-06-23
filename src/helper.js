import { getData } from './dataStore.js'

function checkValidId(id) {
    let data = getData();
    for (let user of data.users) {
        if (user.uId === id) {
            return true;
        }
    }
    return false;
}
export { checkValidId };