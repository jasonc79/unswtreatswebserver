import { getData } from './dataStore.js'
import { checkValidId } from './helper.js'

/*
userProfileV1 checks if authUserId and uId are valid and then returns an object containing 
an array of objects containing the user's details

Arguments:
    authUserId (number)     - holds the id of the user that is searching for the infomation
    uId (number)            - holds the id of the user that's details are being searched for

Return Value:
    Returns 
        { users: 
            uId: user.uId, 
            email: user.email,
            nameFirst: user.nameFirst, 
            nameLast: user.nameLast, 
            handleStr: user.handleStr, 
        } 
        on if authUserId and uId are valid
    Returns { error: 'error' } on an invalid authUserId or uId
*/

function userProfileV1(authUserId, uId) {
    if (!checkValidId(authUserId)) {
        return { error: 'error' };
    }

    let data = getData();
    for (let user of data.users) {
        if (user.uId === uId) {
            return { 
                user: {
                    uId: user.uId, 
                    email: user.email,
                    nameFirst: user.nameFirst, 
                    nameLast: user.nameLast, 
                    handleStr: user.handleStr,
                }
            }
        }
    }
    return { error: 'error' };
}

export { userProfileV1 }
