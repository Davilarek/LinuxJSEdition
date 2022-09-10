/* eslint-disable no-unused-vars */
let mainFile = require("./main.js");

const fs = require("fs");
const http = require("https");

/**
 * Download a file from a URL and save it to a local file
 * @param url - The URL of the file to download.
 * @param dest - The file name to download to.
 * @param cb - A callback function that will be called when the download is complete.
 */
function download(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    }).on('error', function (err) {
        fs.unlink(dest);
        if (cb)
            cb(err.message);
    });
}

// /**
//  * *This function deletes the cached version of the module and then returns the module.
//  * This is useful if you want to force a refresh of the module.*
//  * @param {string} module - The name of the module to be required.
//  */
// function requireUncached(module) {
//     delete require.cache[require.resolve(module)];
//     return require(module);
// }

/**
 * A function that downloads the latest version of the main.js file from the GitHub repository
 * and then runs it.
 */
module.exports.Upgrade = function () {
    //  mainFile.CloseAndUpgrade();
    delete require.cache[require.resolve("./main.js")];

    download("https://raw.githubusercontent.com/Davilarek/LinuxJSEdition/master/main.js", "./main.js", function () {
        mainFile = require("./main.js");
    });
};

/* A way to reload the main.js file. */
module.exports.Reboot = function (msg) {
    delete require.cache[require.resolve("./main.js")];
    mainFile = require("./main.js");
    // console.log(msg);
    if (msg != undefined) {
        setTimeout(() => {
            const msgMod = { "content": msg.content.split("reboot")[0] + "boot", "channel-id-only": msg.channel.id };
            // console.log(msgMod);
            mainFile.clientExternal.startBootSeq(msgMod);
        }, 1000);
    }
};
