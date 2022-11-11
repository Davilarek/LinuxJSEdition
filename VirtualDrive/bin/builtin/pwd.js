exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_BASE_DIR = basePath;
    const path = require("path");
    cli.registerCommand("pwd", (contextMsg) => {
        return new Promise((resolve) => {
            let pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive', '');
            pathWithoutDrive = cli.coolTools.replaceAll(pathWithoutDrive, "\\", "/");
            if (pathWithoutDrive == "") {
                pathWithoutDrive = "/";
            }
            // console.log(pathWithoutDrive)
            contextMsg.channel.send(pathWithoutDrive);
            resolve(0);
        });
    }, "print working directory.");
};