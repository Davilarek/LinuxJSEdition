exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_PREFIX = cli.prefix;
    cli.registerCommand("secho", (contextMsg, variableList) => {
        return cli.executeCommand(cli.createConsoleMessageObject(ENV_VAR_PREFIX + "echo " + contextMsg.content), variableList, true);
    }, "silent echo, prints to bot's host console");
};