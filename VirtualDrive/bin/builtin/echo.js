exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    cli.registerCommand("echo", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            // console.log(localVarList);

            if (pathCorrected == ENV_VAR_PREFIX + "echo") { return; }
            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            contextMsg.channel.send(pathCorrected);
            resolve(0);
        });
    }, "simple echo command. supports variables");
};