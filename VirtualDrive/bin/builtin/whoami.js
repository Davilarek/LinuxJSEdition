exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_PREFIX = cli.prefix;
    cli.registerCommand("whoami", (contextMsg, variableList) => {
        return cli.executeCommand(cli.fakeMessageFromOriginal(ENV_VAR_PREFIX + "echo $USER", contextMsg), variableList, true);
    }, `displays current user (always root)`);
};