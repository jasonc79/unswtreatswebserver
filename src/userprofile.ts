import { error } from './dataStore';
import HTTPError from 'http-errors';
import request from 'sync-request'; 
import fs from 'fs'; 
import { checkValidToken } from './helper';
const sizeOf = require('image-size'); 
const Jimp = require('jimp');

function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): {} | error {
    if (!checkValidToken(token)) {
        throw HTTPError(403, 'Token is invalid');
    }

    const fileType: string = imgUrl.substring(imgUrl.length - 3); 
    if (fileType !== 'jpg') {
        throw HTTPError(400, 'Image uploaded is not a JPG')
    }

    const res = request('GET', imgUrl);
    const body = res.getBody();
    const uniqueUrl = Math.floor(Math.random() * Date.now());
    const image = `profilepics/${ uniqueUrl }.jpg`;
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
    const imageName = `profilepics/${ uniqueUrl }`;
    Jimp.read(image, (err, imageName ) => {
        if (err) throw err; 
        imageName.crop(xStart, yStart, xEnd, yEnd); 
        imageName.write(`profilepics/cropped-${ uniqueUrl }.jpg`);
    })
    fs.unlinkSync(image);
    return {}; 
}; 

export { uploadPhotoV1 }
