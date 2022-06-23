import { getData } from './dataStore.js'
import { checkValidId } from './helper.js'

function userProfileV1(authUserId, uId) {
    if (!checkValidId(authUserId)) {
        return { error: 'error' };
    }

    let data = getData();
    for (let user of data.users) {
        if (user.uId === uId) {
            return { 
                users: [{
                    uId: user.uId, 
                    email: user.email,
                    nameFirst: user.nameFirst, 
                    nameLast: user.nameLast, 
                    handleStr: user.handleStr,
                }]
            }
        }
    }
    return { error: 'error' };
}

export { userProfileV1 }