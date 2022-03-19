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
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
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

/**
 * @param cmd - The command to run.
 * @param cb - Callback function to be executed when the command is finished.
 */
async function RunCmd(cmd, cb) {
    const syncDir = await execute(cmd);
    cb;
}

/**
 * It executes a command in the shell and returns the output.
 * @param command - The command to execute.
 * @returns The output of the command.
 */
async function execute(command) {
    const { promisify } = require('util');
    const exec = promisify(require('child_process').exec)
    // Exec output contains both stderr and stdout outputs
    try {
        const nameOutput = await exec(command, { windowsHide: true, stdio: 'inherit' })
        return nameOutput.stdout;
    }
    catch (e) {
        return e.stderr;
    }
};

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

/* A function that downloads the latest version of the main.js file from the GitHub repository and then
runs the npm install command. */
module.exports.Upgrade = function () {
    //mainFile.CloseAndUpgrade();
    delete require.cache[require.resolve("./main.js")];

    download("https://raw.githubusercontent.com/Davilarek/LinuxJSEdition/master/main.js", "./main.js", function () {
        RunCmd("npm i", function () {
            mainFile = requireUncached("./main.js");
        });
    });
};

/* A way to reload the main.js file. */
module.exports.Reboot = function () {
    delete require.cache[require.resolve("./main.js")];
    mainFile = requireUncached("./main.js");
};