const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
    cli.registerCommand("touch", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == ENV_VAR_PREFIX + "touch") { return; }

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
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, "\n", "_");
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, "\r", "_");
                // weird stuff happens when you not remove new lines

                // remove unicode from pathCorrected
                // eslint-disable-next-line no-control-regex
                pathCorrected = pathCorrected.replace(/[^\x00-\x7F]/g, "_");

                // remove special characters from pathCorrected
                pathCorrected = pathCorrected.replace(/[^a-zA-Z0-9_\-.]/g, "_");

                // remove stuff that file system doesn't like
                pathCorrected = pathCorrected.replace(/[<>:"|?*]/g, "_");

                if (!fs.existsSync(pathCorrected)) {
                    fs.closeSync(fs.openSync(pathCorrected, 'w'));
                    contextMsg.channel.send("Done.");
                    resolve(0);
                }
                else {
                    contextMsg.channel.send("Error: target file already exist.");
                    resolve(1);
                }
            }
        });
    }, "create new file");
};