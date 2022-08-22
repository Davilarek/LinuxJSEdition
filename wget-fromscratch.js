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
        const request = adapterFor(url2).get(url2, (res) => {
            res.pipe(writeStream);

            writeStream.on("finish", function () {
                writeStream.close(() => {
                    myWgetInstance.emit("end");
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