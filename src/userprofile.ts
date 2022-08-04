import { error, getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import request from 'sync-request'; 
import fs from 'fs'; 
import { checkValidToken } from './helper';
const sharp = require('sharp'); 

function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): {} | error {
    if (!checkValidToken(token)) {
        throw HTTPError(403, 'Token is invalid');
    }

    const res = request('GET', imgUrl);
    const body = res.getBody();
    fs.writeFileSync(`profilepics/${ token }.jpg`, body, { flag: 'w' });
    if (res.statusCode !== 200) {
        throw HTTPError(400, 'Error when attempting to retrieve image'); 
    }

    // Outside dimensions - change this
        // If start < 0
        // If end > image height/ width 
    // if () {
    //     throw HTTPError(400, 'Crop bounds are outside dimensions of the image');
    // }

    if (xEnd <= xStart || yEnd <= yStart) {
        throw HTTPError(400, 'Invalid crop bounds'); 
    }

    const fileType: string = imgUrl.substring(imgUrl.length - 3); 
    if (fileType !== 'jpg') {
        throw HTTPError(400, 'Image uploaded is not a JPG')
    }
     
    return {}; 
}; 

export { uploadPhotoV1 }
