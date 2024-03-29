const events = require('events');
class wget {
    static download(url3, output) {
        // const https = require("https");
        const fs = require("fs");
        // const url = require("url");
        // const path = require("path");
        const url2 = url3;
        const myWgetInstance = new events.EventEmitter();

        // const file_name = path.basename(url.parse(url2).pathname);
        const file_name = output;
        const writeStream = fs.createWriteStream(file_name);

        // require("https").get(url2, (res) => {
        //     res.statusCode
        // });

        const request = adapterFor(url2).get(url2, (res) => {
            res.pipe(writeStream);
            let error = false;
            if (res.statusCode == 404) {
                // request.emit("error", 404);
                fs.unlink(file_name, () => {
                    myWgetInstance.emit("error", 404);
                });
                error = true;
                return;
            }

            writeStream.on("finish", function () {
                writeStream.close(() => {
                    if (!error)
                        myWgetInstance.emit("end");
                    else
                        myWgetInstance.emit("error", 404);
                });
            });
        });
        // check for request error too
        request.on('error', (err) => {
            fs.unlink(file_name, () => {
                myWgetInstance.emit("error", err);
            });
            // delete the (partial) file and then return the error
        });

        writeStream.on('error', (err) => {
            // Handle errors
            myWgetInstance.emit("fs_error", err);
            // delete the (partial) file and then return the error
        });
        return myWgetInstance;
    }
}

// https://stackoverflow.com/a/38465918
const adapterFor = (function () {
    const url = require('url'),
        adapters = {
            'http:': require('http'),
            'https:': require('https'),
        };

    return function (inputUrl) {
        return adapters[url.parse(inputUrl).protocol];
    };
}());
exports.download = wget.download;