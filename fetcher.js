const request = require('request');
const fs = require('fs');
// It should take two command line arguments:

// 1 URL
// 2 local file path
// It should download the resource at the URL to the local path on your machine. Upon completion, it should print out a message like 

//Downloaded and saved 1235 bytes to ./index.html.

//AVOID writeFileSync.  BAD PRACTICE

//gets the next two arguments.
const args = process.argv.slice(2);

//process will close if anything here fails
start(args);

function start(args) {

  //check if there are two arguments
  if (args.length != 2) {
    console.log("please enter a url and path to save.");
    process.exit;
  }

  //need to get tha path and file name SEPARATE.
  //start from the tail and move backwards.
  //find where the char === /.
  const pathName = args[1];
  let slashIndex = -1;
  for (let i = pathName.length - 1; i >= 0; i--) {
    if (pathName[i] === "/") {
      slashIndex = i;
      break;
    }
  }

  //everything 0->i, is the file path.
  //everything i->end, is the name of file.
  const fileName = pathName.slice(slashIndex + 1);
  const path = pathName.slice(0, slashIndex + 1);

  console.log("path:", path);
  console.log("filename:", fileName);

  //this will call initiateFetchAndWrite if it passes.
  checkPath(path);
}

const initiateFetchAndWrite = () => {
  makeRequest(args[0], args[1], writeToDisk);
};

function checkPath(path) {
  fs.access(path, (err) => {
    if (!err) {
      console.log(`The path "${path}" is valid.`);
      initiateFetchAndWrite(); //start checking
      return;
    }

    //path doesn't exist
    if (err.code === 'ENOENT') {
      console.log(`The path "${path}" is not valid.`);
      return;
    }

    //general error
    console.error(`An error occurred: ${err.message}`);
    return;
  });
}

const makeRequest = (url, path, cb) => {
  console.log("path:", path);
  console.log("url:", url);
  request(url, (error, response, body) => {

    // Print the response status code if a response was received
    console.log("statusCode:", response && response.statusCode);
    if (error) {
      console.log(`Error loading website ${url}`, error);
      return;
    }

    //do the writing thingy.
    cb(body, path);
  });
};

const writeToDisk = (body, path) => {
  console.log("Writing to disk");

  fs.writeFile(path, body, err => {
    if (err) {
      console.error(err);
      return;
    }

    // file written successfully
    fs.stat(path, (statErr, stats) => {
      if (statErr) {
        console.error("An error occurred while getting file stats:", statErr);
      } else {
        const fileSizeInBytes = stats.size;
        const fileSizeInKB = fileSizeInBytes / 1024;
        console.log(`Downloaded and saved ${fileSizeInBytes} bytes to ${path}`);
        //console.log(`File size: ${fileSizeInBytes} bytes (${fileSizeInKB} KB)`);
      }
    });
  });
};