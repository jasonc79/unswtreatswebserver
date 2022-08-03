import express from 'express';
 
const app = express();
const port = 3001;
 
app.use('/static', express.static('profilepics'));
 
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// how to access images in a folder from the server