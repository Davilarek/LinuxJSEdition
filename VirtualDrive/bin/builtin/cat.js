const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    cli.registerCommand("cat", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            if (pathCorrected == ENV_VAR_PREFIX + "cat") { return; }

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
                contextMsg.channel.send("Error: cannot access this path.");
                resolve(126);
            }
            else {
                if (fs.existsSync(pathCorrected)) {
                    const stat = fs.lstatSync(pathCorrected);
                    // console.log(stat.size);
                    if (stat.isFile()) {
                        if (stat.size == 0) {
                            contextMsg.channel.send("`file is empty`");
                            resolve(0);
                        }
                        if (stat.size > 50000000) {
                            contextMsg.channel.send("Error: file is too big to cat.");
                            resolve(1);
                        }
                        else {
                            let output = '';
                            const readStream = fs.createReadStream(pathCorrected);
                            readStream.on('data', function (chunk) {
                                output += chunk.toString('utf8');
                            });
                            readStream.on('end', function () {
                                const str = output;
                                for (let i = 0; i < str.length; i += 2000) {
                                    const toSend = str.substring(i, Math.min(str.length, i + 2000));
                                    contextMsg.channel.send("```\n" + toSend + "\n```");
                                }
                                // TODO: replace-able with
                                // contextMsg.channel.send("```\n" + str + "\n```", { split: true });
                            });
                        }
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
        });
    }, "read files");
};