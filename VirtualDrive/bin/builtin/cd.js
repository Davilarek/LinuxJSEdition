exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_APT_PROTECTED_DIR = cli.aptProtectedDir;
    const ENV_VAR_STARTUP_NICKNAME = cli.startupNickname;
    const fs = require("fs");
    const path = require("path");
    cli.registerCommand("cd", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            if (pathCorrected == ENV_VAR_PREFIX + "cd") { return; }
            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                // it doesn't look good
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected == "-")
                pathCorrected = ENV_VAR_LIST["$OLDPWD"];

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }

            if (fs.existsSync(pathCorrected)) {
                if (path.resolve(pathCorrected).includes("VirtualDrive") && !path.resolve(pathCorrected).includes(ENV_VAR_APT_PROTECTED_DIR)) {
                    const stat = fs.lstatSync(pathCorrected);
                    if (stat.isFile() != true) {
                        cli.listEnv["$OLDPWD"] = cli.coolTools.runAndGetOutput(ENV_VAR_PREFIX + "pwd", localVarList);
                        process.chdir(pathCorrected);
                        const pwd = cli.coolTools.runAndGetOutput(ENV_VAR_PREFIX + "pwd", localVarList);
                        cli.listEnv["$PWD"] = pwd;
                        // console.log(pwd.length);
                        // console.log(len(ENV_VAR_STARTUP_NICKNAME+ pwd));
                        // console.log(pwd.split("/")[pwd.split("/").length - 1])
                        if ((ENV_VAR_STARTUP_NICKNAME.length + pwd.length) < 31)
                            contextMsg.guild.me.setNickname(ENV_VAR_STARTUP_NICKNAME + " [" + pwd + "]");
                        else
                            contextMsg.guild.me.setNickname(ENV_VAR_STARTUP_NICKNAME + " [" + pwd.split("/")[pwd.split("/").length - 1] + "]");
                        resolve(0);
                    }
                    else {
                        contextMsg.channel.send("Error: given path is not an directory.");
                        resolve(1);
                    }
                }
                else {
                    contextMsg.channel.send("Error: cannot `cd` into this directory.");
                    resolve(126);
                }
            }
            else {
                contextMsg.channel.send("Error: directory doesn't exist.");
                resolve(1);
            }
        });
    }, "change directory.");
};