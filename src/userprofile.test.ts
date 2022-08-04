import { authUserReturn, requestAuthRegister, requestUserUploadPhoto, requestClear } from './helperTests';
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
          const imgUrl = 'http://th-thumbnailer.cdn-si-edu.com/-IrlU4HxX8GSYm1ik10SZVI4=/fit-in/1600x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Design-Decoded-Smiley-Face-631%20copy.jpg';
          requestUserUploadPhoto(authUser.token, imgUrl, 0, 0, 100, 100, 400);
        }); 

        test('Out of dimension', () => {
          const imgUrl = 'http://th-thumbnailer.cdn-si-edu.com/-IrlU4HxX8GSYm1ik10SQGnZVI4=/fit-in/1600x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Design-Decoded-Smiley-Face-631%20copy.jpg';
          requestUserUploadPhoto(authUser.token, imgUrl, 0, 0, 800, 800, 400);
        });

        test('xEnd is less than or equal to xStart or yEnd is less than or equal to yStart', () => {
          const imgUrl = 'http://th-thumbnailer.cdn-si-edu.com/-IrlU4HxX8GSYm1ik10SQGnZVI4=/fit-in/1600x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Design-Decoded-Smiley-Face-631%20copy.jpg';
          requestUserUploadPhoto(authUser.token, imgUrl, 0, 0, 0, 0, 400); 
        });

        test('image uploaded is not a JPG', () => {
          const imgUrl = 'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png';
          requestUserUploadPhoto(authUser.token, imgUrl, 0, 0, 100, 100, 400);
        });
    });

    describe('Valid inputs', () => {
      test('Jpg smiley face with valid dimensions', () => {
        const imgUrl = 'http://th-thumbnailer.cdn-si-edu.com/-IrlU4HxX8GSYm1ik10SQGnZVI4=/fit-in/1600x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Design-Decoded-Smiley-Face-631%20copy.jpg';
        const pfp = requestUserUploadPhoto(authUser.token, imgUrl, 0, 0, 100, 100);
        expect(pfp).toStrictEqual({});
      });
    });
}); 