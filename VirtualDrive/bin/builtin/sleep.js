exports.Init = function (args, chan, basePath, cli) {
    cli.registerCommand("sleep", (contextMsg) => {
        return new Promise((resolve) => {
            let num = 1;
            if (contextMsg.content.split(" ")[1])
                num = Number(contextMsg.content.split(" ")[1]);
            setTimeout(() => {
                resolve(0);
            }, num * 1000);
        });
    }, "usage: sleep <seconds>");
};