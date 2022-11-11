exports.Init = function (args, chan, basePath, cli) {
    const currentlyRunningProcesses = cli.currentlyRunningProcesses;
    const prefix = cli.prefix;
    cli.registerCommand("ps", (contextMsg) => {
        return new Promise((resolve) => {
            const processList = [];
            const final = "  PID                       TTY          TIME CMD";
            const startupTime = Math.round(
                Math.abs(new Date(Date.now()).getTime() - new Date(cli.startupTimestamp).getTime()) / 1000,
            );
            processList.push(cli.startupTimestamp + " rc1          " + startupTime + " " + "discordshell");
            processList.push(Date.now() + " rc1          " + "0" + " " + prefix + "ps");
            for (const prop in currentlyRunningProcesses) {
                const time = Math.round(
                    Math.abs(new Date(Date.now()).getTime() - new Date(Number(prop)).getTime()) / 1000,
                );
                processList.push(prop + " rc1          " + time + " " + currentlyRunningProcesses[prop].commandName);
            }
            contextMsg.channel.send(final + "\n" + processList.join("\n"));
            resolve(0);
        });
    }, "shows every running process");
};