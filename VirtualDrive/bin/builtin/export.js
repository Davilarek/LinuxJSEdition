exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    cli.registerCommand("export", (contextMsg) => {
        return new Promise((resolve) => {
            if (!contextMsg.content.split(" ")[1]) {
                let combined = "";
                for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
                    const element = Object.keys(ENV_VAR_LIST)[i];
                    if (element == "~")
                        continue;
                    combined += "export " + element.replace("$", '') + "=" + Object.values(ENV_VAR_LIST)[i] + "\n";
                }
                contextMsg.channel.send(combined);
                return;
            }
            console.log("Exporting variable " + "$" + contextMsg.content.split(" ")[1].split("=")[0] + "...");
            ENV_VAR_LIST["$" + contextMsg.content.split(" ")[1].split("=")[0]] = contextMsg.content.split(" ")[1].split("=")[1];
            resolve(0);
        });
    }, "makes a variable global");
};