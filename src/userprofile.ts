import { error, getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import { checkValidToken, returnValidUser } from './helper';
import { PORT, HOST } from './server';

const sizeOf = require('image-size');
const Jimp = require('jimp');

function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Record<string, never> | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const fileType: string = imgUrl.substring(imgUrl.length - 3);
  if (fileType !== 'jpg') {
    throw HTTPError(400, 'Image uploaded is not a JPG');
  }

  const res = request('GET', imgUrl);
  const body = res.getBody();
  const uniqueUrl = Math.floor(Math.random() * Date.now());
  const image = `profilepics/${uniqueUrl}.jpg`;
  fs.writeFileSync(image, body, { flag: 'w' });

  if (res.statusCode !== 200) {
    fs.unlinkSync(image);
    throw HTTPError(400, 'Error when attempting to retrieve image');
  }

  const dimensions = sizeOf(image);
  if (xStart < 0 || yStart < 0 || xEnd > dimensions.width || yEnd > dimensions.height) {
    fs.unlinkSync(image);
    throw HTTPError(400, 'Crop bounds are outside dimensions of the image');
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    fs.unlinkSync(image);
    throw HTTPError(400, 'Invalid crop bounds');
  }

  // Cropping the image
  Jimp.read(image, (image: any) => {
    image.crop(xStart, yStart, xEnd, yEnd);
    image.write(`profilepics/${uniqueUrl}.jpg`);
  });
  fs.unlinkSync(image);

  const currUser = returnValidUser(token);
  const data = getData();
  for (const user of data.users) {
    if (user.uId === currUser.uId) {
      user.profileImgUrl = `http://${HOST}:${PORT}/img/${uniqueUrl}.jpg`;
    }
  }
  setData(data);

  return {};
}

export { uploadPhotoV1 };

/* Default photo link
http://i.pinimg.com/474x/ff/ae/8a/ffae8a01233abcc8799022b191b29faa.jpg
*/
