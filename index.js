let mainFile = require("./main.js");

const fs = require("fs");
const http = require("https");

var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

module.exports.Upgrade = function () {
    mainFile.CloseAndUpgrade();
    delete require.cache[require.resolve("./main.js")];

    download("https://raw.githubusercontent.com/Davilarek/LinuxJSEdition/master/main.js", "./main.js", function () {
        mainFile = requireUncached("./main.js");
    })
};