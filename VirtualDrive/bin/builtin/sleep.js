exports.Init = function (args, chan, basePath, cli) {
    cli.registerCommand("sleep", (contextMsg, variableList, abort) => {
        return new Promise((resolve) => {
            abort.signal.addEventListener('abort', () => {
                resolve(137);
            });
            let num = 1;
            if (contextMsg.content.split(" ")[1])
                num = Number(contextMsg.content.split(" ")[1]);
            setTimeout(() => {
                resolve(0);
            }, num * 1000);
        });
    }, "usage: sleep <seconds>");
};