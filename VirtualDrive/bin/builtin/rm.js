const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
    cli.registerCommand("rm", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == ENV_VAR_PREFIX + "rm") { return; }

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || pathCorrected.includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
                contextMsg.channel.send("Error: cannot access this path.");
                resolve(126);
            }
            else {
                if (pathCorrected.startsWith("-")) {
                    const msgSplit = pathCorrected.split(" ");
                    if (!msgSplit[1]) {
                        contextMsg.channel.send("Error: no file or directory specified.");
                        resolve(1);
                        return;
                    }
                    if (!path.resolve(msgSplit[1]).includes("VirtualDrive") || msgSplit[1].includes("VirtualDrive") || msgSplit[1].includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes(path.basename(path.resolve(msgSplit[1])))) {
                        contextMsg.channel.send("Error: cannot access this path.");
                        resolve(126);
                    }
                    else {
                        if (msgSplit[0] == "-d") {
                            if (fs.existsSync(msgSplit[1])) {
                                if (!fs.lstatSync(msgSplit[1]).isFile()) {
                                    fs.readdir(msgSplit[1], (err, files) => {
                                        if (!files.length) {
                                            fs.rmdirSync(msgSplit[1]);
                                            contextMsg.channel.send("Directory `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
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
                        if (msgSplit[0] == "-f") {
                            if (fs.existsSync(msgSplit[1]) && !fs.lstatSync(msgSplit[1]).isFile()) {
                                contextMsg.channel.send("Error: given path is an directory.");
                                resolve(1);
                                return;
                            }
                            fs.rmSync(msgSplit[1], { force: true });
                            contextMsg.channel.send("File `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
                            resolve(0);
                        }
                        if (msgSplit[0] == "-rf" || msgSplit[0] == "-fr" || msgSplit[0] == "-r") {
                            /*
                            if (fs.existsSync(msgSplit[1]) && !fs.lstatSync(msgSplit[1]).isFile()) {
                                contextMsg.channel.send("Error: given path is an directory.");
                                return;
                            }
                            */
                            fs.rmSync(msgSplit[1], { recursive: true, force: true });
                            contextMsg.channel.send("File(s) `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
                            resolve(0);
                        }
                    }
                }
                else {
                    if (fs.existsSync(pathCorrected)) {
                        if (fs.lstatSync(pathCorrected).isFile()) {
                            fs.rmSync(pathCorrected);
                            contextMsg.channel.send("File `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
                            resolve(0);
                        }
                        else {
                            contextMsg.channel.send("Error: given path is not an file.");
                            resolve(1);
                        }
                    }
                    else {
                        contextMsg.channel.send("Error: file doesn't exist.");
                        resolve(1);
                    }
                }
            }
        });
    }, "remove file");
};