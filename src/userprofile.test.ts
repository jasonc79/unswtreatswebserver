import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, requestChannelMessages, requestDmMessages, requestClear } from './helperTests';
import { removeFile } from './helperTests';
import { channelId, MessageId, dmId } from './dataStore';

let authUser: authUserReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

beforeEach(() => {
    removeFile();
    requestClear();
    authUser = requestAuthRegister(email, password, nameFirst, nameLast);
  });
  
  afterEach(() => {
    removeFile();
    requestClear();
  });

  // ===========================================================================//
// Tests
// ===========================================================================//

describe('Testing user/profile/uploadphoto/v1', () => {
    describe('Error cases', () => {
        test('imgUrl returns HTTP status other than 200', () => {

        }); 

        test('Out of dimension', () => {

        });

        test('xEnd is less than or equal to xStart or yEnd is less than or equal to yStart', () => {

        });

        test('image uploaded is not a JPG', () => {

        });

        
    });

    describe('Valid inputs', () => {

    });

}); 