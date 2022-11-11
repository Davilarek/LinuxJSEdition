const fs = require("fs");
const path = require("path");
const url = require("url");
exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_PREFIX = cli.prefix;
    const wget = require(basePath + "/wget-fromscratch.js");

    cli.registerCommand("wget", (contextMsg, variableList, abort) => {
        return new Promise((resolve) => {
            abort.signal.addEventListener('abort', () => {
                resolve(137);
            });
            if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1) == ENV_VAR_PREFIX + "wget") {
                contextMsg.channel.send("Error: link not specified.");
                resolve(1);
            }
            else {
                const parsed = url.parse(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
                if (!fs.existsSync(path.basename(parsed.pathname))) {
                    contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
                    const download = wget.download(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1), path.basename(parsed.pathname));
                    download.on('end', function () {
                        contextMsg.channel.send("Download complete.");
                        resolve(0);
                    });
                }
                else {
                    contextMsg.channel.send("Error: file already exist.");
                    resolve(1);
                }
            }
        });
    }, "download files from web");
};