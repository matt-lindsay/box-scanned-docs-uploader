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
        // Split the records into fields.
        let records = item.split(',');
        // Search Box for a particular folder.
        client.search.query(records[0], { type: 'folder' }, function (err, data) {
            if (err) throw err;
            
            // Obtain the destination folder id.
            let destination = data.entries[0].id;
            // Obtain the filename to upload.
            let filename = records[1];
            
            // Create a stream to read in the file to upload.
            var stream = fs.createReadStream('./docs/' + records[1]);
            
            // Upload the file to Box.
            client.files.uploadFile(destination, filename, stream, function (err) {
                if (err) console.log(err);
                console.log('>>> Upload complete: ' + filename);
            });
        });
    });
});
