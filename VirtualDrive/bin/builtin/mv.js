const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
    cli.registerCommand("mv", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.split(" ")[1];
            let pathCorrected2 = contextMsg.content.split(" ")[2];

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == undefined) { return; }
            if (pathCorrected2 == undefined) { return; }

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
                pathCorrected2 = cli.coolTools.replaceAll(pathCorrected2, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }
            if (pathCorrected2.startsWith("/")) {
                pathCorrected2 = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            //	console.log(pathCorrected);

            if (!path.resolve(pathCorrected).includes("VirtualDrive") || !path.resolve(pathCorrected2).includes("VirtualDrive") || pathCorrected.includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected)))) || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected2))))) {
                contextMsg.channel.send("Error: cannot access this path.");
                resolve(126);
            }
            else {
                if (fs.existsSync(pathCorrected)) {
                    if (!fs.existsSync(pathCorrected2)) {
                        try {
                            pathCorrected2 = cli.coolTools.replaceAll(pathCorrected2, "\n", "_");
                            pathCorrected2 = cli.coolTools.replaceAll(pathCorrected2, "\r", "_");
                            // weird stuff happens when you not remove new lines

                            // remove unicode from pathCorrected
                            // eslint-disable-next-line no-control-regex
                            pathCorrected2 = pathCorrected2.replace(/[^\x00-\x7F]/g, "_");

                            // remove special characters from pathCorrected
                            pathCorrected2 = pathCorrected2.replace(/[^a-zA-Z0-9_\-.]/g, "_");

                            // remove stuff that file system doesn't like
                            pathCorrected2 = pathCorrected2.replace(/[<>:"|?*]/g, "_");

                            fs.renameSync(pathCorrected, pathCorrected2);
                            contextMsg.channel.send("Done.");
                            resolve(0);
                        }
                        catch (error) {
                            contextMsg.channel.send("Unexpected error occurred while moving `" + path.basename(pathCorrected) + "`.");
                            resolve(1);
                        }
                    }
                    else {
                        contextMsg.channel.send("Error: target file already exist or is directory.");
                        resolve(1);
                    }
                }
                else {
                    contextMsg.channel.send("Error: source file doesn't exist.");
                    resolve(1);
                }
            }
        });
    }, "move file");
};