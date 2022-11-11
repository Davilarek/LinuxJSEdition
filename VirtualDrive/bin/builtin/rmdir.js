const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
    cli.registerCommand("rmdir", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == ENV_VAR_PREFIX + "rmdir") { return; }

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
                contextMsg.channel.send("Error: cannot access this path.");
                resolve(126);
            }
            else {
                if (fs.existsSync(pathCorrected)) {
                    if (!fs.lstatSync(pathCorrected).isFile()) {
                        fs.readdir(pathCorrected, (err, files) => {
                            if (!files.length) {
                                fs.rmdirSync(pathCorrected);
                                contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
                                resolve(0);
                            }
                            else {
                                contextMsg.channel.send("Error: directory is not empty.");
                                resolve(1);
                            }
                        });
                    }
                    else {
                        contextMsg.channel.send("Error: given path is not an directory.");
                        resolve(1);
                    }
                }
                else {
                    contextMsg.channel.send("Error: directory doesn't exist.");
                    resolve(1);
                }
            }
        });
    }, "remove directory");
};