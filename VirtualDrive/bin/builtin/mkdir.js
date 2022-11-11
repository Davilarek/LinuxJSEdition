const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
    cli.registerCommand("mkdir", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == ENV_VAR_PREFIX + "mkdir") { return; }

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            // if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("..") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith(path.sep) || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("/")) {
            // 	contextMsg.channel.send("Error: cannot create directory.");
            // }
            // else {
            // 	if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
            // 		fs.mkdirSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
            // 		contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
            // 	}
            // 	else {
            // 		contextMsg.channel.send("Error: directory already exists.");
            // 	}
            // }

            // console.log(pathCorrected);

            if (!path.resolve(pathCorrected).includes("VirtualDrive") || path.basename(pathCorrected) == "VirtualDrive" || pathCorrected.endsWith("..") || pathCorrected.endsWith(path.sep) || pathCorrected.endsWith("/")) {
                contextMsg.channel.send("Error: cannot create directory.");
                resolve(126);
            }
            else {
                // console.log(pathCorrected);

                if (pathCorrected.startsWith("-")) {
                    const msgSplit = pathCorrected.split(" ");
                    if (!msgSplit[1]) {
                        contextMsg.channel.send("Error: no file or directory specified.");
                        resolve(1);
                        return;
                    }
                    if (!path.resolve(msgSplit[1]).includes("VirtualDrive") || path.basename(pathCorrected) == "VirtualDrive" || msgSplit[1].includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes(path.basename(path.resolve(msgSplit[1])))) {
                        contextMsg.channel.send("Error: cannot access this path.");
                        resolve(126);
                    }
                    else {
                        if (msgSplit[0] == "-p") {
                            pathCorrected = msgSplit[1];
                            console.log(pathCorrected);
                            if (!fs.existsSync(pathCorrected)) {
                                try {
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

                                    fs.mkdirSync(pathCorrected, { recursive: true });
                                    contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
                                    resolve(0);
                                }
                                catch (error) {
                                    console.log(error);
                                    contextMsg.channel.send("Unexpected error occurred while creating `" + path.basename(pathCorrected) + "`.");
                                    resolve(1);
                                }
                            }
                            else {
                                contextMsg.channel.send("Error: directory already exists.");
                                resolve(1);
                            }
                        }
                    }
                }
                else
                    if (!fs.existsSync(pathCorrected)) {
                        try {
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

                            fs.mkdirSync(pathCorrected);
                            contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
                            resolve(0);
                        }
                        catch (error) {
                            contextMsg.channel.send("Unexpected error occurred while creating `" + path.basename(pathCorrected) + "`.");
                            resolve(1);
                        }
                    }
                    else {
                        contextMsg.channel.send("Error: directory already exists.");
                        resolve(1);
                    }
            }
        });
    }, "make directory");
};