'use strict';

const fs = require('fs');
const box = require('./box');
const inputData = process.argv[2];

// Instantiate a new Box client.
var client = new box();

// Read in data csv file.
fs.readFile(inputData, 'utf8', function (err, data) {
    if (err) throw err;
    
    // Split the data file into records.
    let filesList = data.split('\n');
    
    filesList.forEach(function (item) {
        // Exclude empty records / lines in the data file.
        if (item) {
            // Split the records into fields.
            let records = item.split(',');
    
            // Search Box for a particular folder.
            client.search.query(records[0], { type: 'folder' }, function (err, jsonData) {
                // Log error e.g. not authorised, doesn't exist or something else.
                if (err) console.log(err); // TODO else proceed with upload.
                
                // Obtain the number of folders found matching the search case number (records[0]).
                let recordCount = jsonData.total_count;
                // If the recordCount is 0 then no match is present within Box.
                if (recordCount === 0) {
                    // TODO Create the required folder in the correct location.
                    console.log('>>> Record does note exist: ' + records[0]);
                    logger('No folder,' + item + '\n');
                } else if (recordCount === 1) { // If there is 1 match then upload the file.
                    // Obtain the destination folder id.
                    let destination = jsonData.entries[0].id;
                    // Obtain the filename to upload.
                    let filename = records[1];
                    console.log(destination);
                    // Create a stream to read in the file to upload.
                    var stream = fs.createReadStream('./docs/' + records[1]);
                    
                    // Upload the file to Box.
                    client.files.uploadFile(destination, filename, stream, function (err) {
                        if (err) console.log(err);
                        console.log('>>> Upload complete: ' + filename);
                    });
                } else if (recordCount > 1) { // If there is more than one match segregate records for separate intervention.
                    console.log('>>> The search criteria is to vague: ' + records[0]);
                    logger('Too many matches,' + item + '\n');
                }
            });
        }
    });
});

function logger (data) {
    fs.appendFile('./logs/contentLog.csv', data, 'utf8', function (err) {
        if (err) throw err;
    });
}

//https://rainsoft.io/7-tips-to-handle-undefined-in-javascript/