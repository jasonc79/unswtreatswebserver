// user/profile/uploadphoto/v1
import { error, getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import request from 'sync-request'; 
import fs from 'fs'; 

const res = request('GET', imgurl);

function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): {} | error {
    return {}; 
}; 
