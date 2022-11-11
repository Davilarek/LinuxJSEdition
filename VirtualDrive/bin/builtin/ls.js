exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const fs = require("fs");
    const path = require("path");
    cli.registerCommand("ls", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
            pathWithoutDrive = cli.coolTools.replaceAll(pathWithoutDrive, "\\", "/");

            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            if (pathCorrected == ENV_VAR_PREFIX + "ls")
                pathCorrected = ".";

            // console.log(pathCorrected);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }
            if (fs.existsSync(pathCorrected)) {
                if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
                    // if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
                    contextMsg.channel.send("Error: cannot access this path.");
                    resolve(126);
                }
                else {
                    fs.readdir(pathCorrected, (err, files) => {
                        if (!files.length) {
                            contextMsg.channel.send("`" + pathWithoutDrive + "` is empty.");
                            resolve(0);
                        }
                        else {
                            contextMsg.channel.send(files.join(', '));
                            resolve(0);
                        }
                    });
                }
            }
            else {
                contextMsg.channel.send("Error: directory doesn't exist.");
                resolve(1);
            }
        });
    }, "display files in directory.");
};