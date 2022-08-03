import request from 'sync-request';
import fs from 'fs';
 
const res = request(
  'GET',
  // img url
  `${ imgurl }`
);
const body = res.getBody();
fs.writeFileSync('profilepics/test.jpg', body, { flag: 'w' }); 

// how to store images into a folder