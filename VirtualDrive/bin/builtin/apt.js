const fs = require("fs");
const path = require("path");
const url = require("url");
exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_CONFIG_FILE = cli.config;
    const ENV_VAR_APT_PROTECTED_DIR = cli.aptProtectedDir;
    const ENV_VAR_BASE_DIR = basePath;
    const ENV_VAR_APT_LOG_LOCATION = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "var" + path.sep + "log" + path.sep + "apt";
    cli.registerCommand("apt", (contextMsg, variableList, abort) => {
        return new Promise((resolve) => {
            abort.signal.addEventListener('abort', () => {
                resolve(137);
            });
            const wget = require(basePath + "/wget-fromscratch.js");
            /* This code is responsible for installing a package. */
            if (contextMsg.content.split(" ")[1] == "install") {
                if (contextMsg.content.split(" ")[2] == undefined) { return; }
                const start = performance.now();
                let updatedCount = 0;
                const downloadNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
                contextMsg.channel.send("Reading config...");
                const branchName = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[2].split('=')[1];
                contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
                const githubRepoUrl = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1];
                const makeURL = githubRepoUrl + branchName + "/" + downloadNameNormalize + "-install.js";
                const downloadDir = ENV_VAR_APT_PROTECTED_DIR;
                contextMsg.channel.send("Get " + makeURL + "...");
                if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
                const parsed = url.parse(makeURL);
                contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
                let download = null;
                /**
                 * @type {UpgradedPackage[]}
                 */
                const packagesInstalled = [];
                if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
                    download = wget.download(makeURL, downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname));
                }
                else {
                    download = wget.download(makeURL, downloadDir + path.sep + path.basename(parsed.pathname));
                }
                download.on('end', function () {
                    contextMsg.channel.send("Download complete.");
                    let pFile = null;
                    if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
                        pFile = downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname);
                        //	console.log("t1");
                    }
                    else {
                        pFile = downloadDir + path.sep + path.basename(parsed.pathname);
                        //	console.log("t2");
                    }
                    // fs.readFile(pFile, function (err, data) {
                    // 	if (err) throw err;
                    contextMsg.channel.send("Setting up \"" + downloadNameNormalize + "\"...");

                    const mod = requireUncached(pFile);
                    if (mod.Options) {
                        if (mod.Options.upgradeFromGithubRequired == true) {
                            contextMsg.channel.send("Warning: this package requires full upgrade from Github. If you don't do this, except errors.");
                            console.log("Warning: this package (" + downloadNameNormalize + ") requires full upgrade from Github. If you don't do this, except errors.");
                        }
                    }
                    mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, cli);
                    packagesInstalled.push(new UpgradedPackage(mod.Version, mod.Version, downloadNameNormalize, makeURL));

                    updatedCount += 1;
                    contextMsg.channel.send("Done").then(() => {
                        const end = performance.now();
                        const time = end - start;
                        contextMsg.channel.send(updatedCount + " package(s) were updated in " + parseInt(time).toFixed() + "ms.");
                        makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("install", start, end, packagesInstalled));
                        resolve(0);
                    });
                    // });
                });
                download.on('error', function () {
                    contextMsg.channel.send("No package found with name \"" + downloadNameNormalize + "\".");
                    resolve(1);
                });
            }

            /* This code is responsible for removing a package from the system. */
            if (contextMsg.content.split(" ")[1] == "remove") {
                if (contextMsg.content.split(" ")[2] == undefined) { return; }
                const start = performance.now();
                let updatedCount = 0;
                const removeNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
                let removeDir = null;
                /**
                 * @type {UpgradedPackage[]}
                 */
                const packagesRemoved = [];
                if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
                    removeDir = ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun";
                }
                else {
                    removeDir = ENV_VAR_APT_PROTECTED_DIR;
                }
                if (!fs.existsSync(removeDir)) fs.mkdirSync(removeDir);
                if (fs.existsSync(removeDir + path.sep + removeNameNormalize + "-install.js")) {
                    //	delete require.cache[removeDir + path.sep + removeNameNormalize + "-install.js"];
                    const targetPackage = requireUncached(removeDir + path.sep + removeNameNormalize + "-install.js");
                    packagesRemoved.push(new UpgradedPackage(targetPackage.Version, targetPackage.Version, removeNameNormalize, ""));

                    fs.rmSync(removeDir + path.sep + removeNameNormalize + "-install.js");

                    cli.removeListeners();
                    cli.registerAllCommands();
                    fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
                        if (file == "empty.txt") { return; }
                        try {
                            const package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
                            package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, cli);

                        }
                        catch (error) {
                            contextMsg.channel.send("An unexpected error occurred while trying to run package: " + file);
                        }
                    });
                    updatedCount += 1;
                    contextMsg.channel.send(removeNameNormalize + " removed successfully.").then(() => {
                        const end = performance.now();
                        const time = end - start;
                        contextMsg.channel.send(updatedCount + " package(s) were removed in " + parseInt(time).toFixed() + "ms.");
                        makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("remove", start, end, packagesRemoved));
                        resolve(0);
                    });
                }
                else {
                    contextMsg.channel.send(removeNameNormalize + " not found.");
                    resolve(1);
                }
            }

            // corrected this comment because ai lol
            /* This code is a simple update script. It will download all packages from the repository and replace the old ones. */
            if (contextMsg.content.split(" ")[1] == "update") {
                let finished = false;
                const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
                let updatedCount = 0;
                const branchName = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1];
                contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
                const githubRepoUrl = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[1].split('=')[1];
                const start = performance.now();
                /**
                 * @type {UpgradedPackage[]}
                 */
                const updatesInstalled = [];
                const downloadsInProgress = [];
                fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
                    if (file == "empty.txt") { return; }
                    console.log(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
                    const makeURL = githubRepoUrl + branchName + "/" + file;
                    const download = wget.download(makeURL, BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
                    contextMsg.channel.send("Checking " + file.replace("-install.js", "") + "...");
                    downloadsInProgress.push(download);
                    download.on('end', function () {
                        const package = requireUncached(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
                        const packageOld = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
                        if (package.Version != packageOld.Version) {
                            contextMsg.channel.send("Replace \"" + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file) + "\" (Version " + packageOld.Version + ") with version " + package.Version + ".");
                            fs.writeFileSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file, fs.readFileSync(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)));
                            contextMsg.channel.send("Replacing finished.");
                            updatesInstalled.push(new UpgradedPackage(packageOld.Version, package.Version, file.replace("-install.js", ""), makeURL));
                            updatedCount += 1;
                            finished = true;
                        }
                        delete require.cache[BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)];
                        delete require.cache[ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file];
                        // delete downloadsInProgress[downloadsInProgress.indexOf(download)];
                        downloadsInProgress.splice(downloadsInProgress.indexOf(download), 1);
                    });
                    download.on('error', function () {
                        contextMsg.channel.send("No package found with name \"" + path.basename(file) + "\".");
                        // delete downloadsInProgress[downloadsInProgress.indexOf(download)];
                        downloadsInProgress.splice(downloadsInProgress.indexOf(download), 1);
                    });
                });

                const waitForDownloadsInProgressToBeEmpty = (cb, params) => {
                    if (!(downloadsInProgress.length == 0)) {
                        setTimeout(waitForDownloadsInProgressToBeEmpty, 100, cb, params);
                    }
                    else {
                        // CODE GOES IN HERE
                        cb(params);
                    }
                };

                // waitForConditionToBeTrue(downloadsInProgress, "length", 0, () => {
                waitForDownloadsInProgressToBeEmpty(() => {
                    if (finished) {
                        cli.removeListeners();
                        cli.registerAllCommands();
                        // console.log("test");

                        fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
                            if (file == "empty.txt") { return; }
                            try {
                                const package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
                                package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, cli);
                                // console.log(updatesInstalled.map(function (e) { return e.name; }).indexOf(file.replace("-install.js", "")));
                                // console.log(typeof package.OnUpdate === 'function');
                                // console.log("test");
                                if (updatesInstalled.map(function (e) { return e.name; }).indexOf(file.replace("-install.js", "")) != -1 && typeof package.OnUpdate === 'function') {
                                    package.OnUpdate(null, contextMsg.channel);
                                }
                            }
                            catch (error) {
                                //	contextMsg.channel.send("An unexpected error occurred while trying to run package: " + file);
                                console.log(error);
                            }
                        });
                    }
                    contextMsg.channel.send("Done.").then(() => {
                        const end = performance.now();
                        const time = end - start;
                        contextMsg.channel.send(updatedCount + " package(s) were updated in " + parseInt(time).toFixed() + "ms.");
                        makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("update", start, end, updatesInstalled));
                        resolve(0);
                    });
                });

                // setTimeout(function () {
                // 	if (finished && updatedCount > 0) {
                // 		// if (finished) {
                // 		client.removeAllListeners("message");
                // 		register();
                // 		// console.log("test");

                // 		fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
                // 			if (file == "empty.txt") { return; }
                // 			try {
                // 				const package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
                // 				package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client.safeClient);
                // 				// console.log(updatesInstalled.map(function (e) { return e.name; }).indexOf(file.replace("-install.js", "")));
                // 				// console.log(typeof package.OnUpdate === 'function');
                // 				// console.log("test");
                // 				if (updatesInstalled.map(function (e) { return e.name; }).indexOf(file.replace("-install.js", "")) != -1 && typeof package.OnUpdate === 'function') {
                // 					package.OnUpdate(null, contextMsg.channel);
                // 				}
                // 			}
                // 			catch (error) {
                // 				//	contextMsg.channel.send("An unexpected error occurred while trying to run package: " + file);
                // 				console.log(error);
                // 			}
                // 		});
                // 	}
                // 	contextMsg.channel.send("Done.").then(v => {
                // 		const end = performance.now();
                // 		const time = end - start;
                // 		contextMsg.channel.send(updatedCount + " package(s) were updated in " + parseInt(time).toFixed() + "ms.");
                // 		makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("update", start, end, updatesInstalled));
                // 	});
                // }, 2500);
            }

            /* Send message with all packages in the repository. */
            if (contextMsg.content.split(" ")[1] == "list-all") {
                contextMsg.channel.send("Collecting data from repository...").then(() => {
                    cli.readAptRepo().then(v => {
                        // getAllRepoPackages().then(v => {
                        contextMsg.channel.send(v.join("\n"));
                        resolve(0);
                        // contextMsg.channel.send("Done.");
                    });
                });
            }

            if (contextMsg.content.split(" ")[1] == "help") {
                contextMsg.channel.send("`install <package name>` - `install package by name`\n`remove <package name>` - `remove package by name`\n`update` - `replace all outdated packages with newer ones`\n`list-all` - `list all packages in repository.`\n`change-branch <branch name>` - `change branch used in apt update and install`\n`what-branch` - `show currently used branch`");
                resolve(0);
            }

            if (contextMsg.content.split(" ")[1] == "change-branch" && contextMsg.content.split(" ")[2]) {
                // console.log(contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, ""))
                contextMsg.channel.send("Read `/root/.config`...");
                const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
                const changedBranch = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString();
                const c2 = changedBranch.split("\n")[2].split('=')[0] + "=" + contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
                contextMsg.channel.send("Replace lines...");
                // c2.split('=')[1] = ;
                // console.log(changedBranch.split("\n"))
                // console.log(c2);
                let final = "";
                for (let index = 0; index < changedBranch.split("\n").length; index++) {
                    // console.log(changedBranch.split("\n")[index])
                    // console.log(index)

                    if (index == 2) {
                        final += c2;
                        continue;
                    }
                    final += changedBranch.split("\n")[index] + "\n";
                }
                contextMsg.channel.send("Write to `/root/.config`...");
                // console.log(final);
                fs.writeFileSync(BASEDIR + "root" + path.sep + ".config", final);
                contextMsg.channel.send("Done.");
                // shellFunctionProcessor({ "content": ENV_VAR_PREFIX + "cat /root/.config", "channel": contextMsg.channel });
                cli.executeCommand(cli.fakeMessageFromOriginal(ENV_VAR_PREFIX + "cat /root/.config", contextMsg));
                resolve(0);
            }
            if (contextMsg.content.split(" ")[1] == "what-branch") {
                const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
                contextMsg.channel.send(fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1]);
                resolve(0);
            }
        });
    }, "Advanced Packaging Tool, used for managing packages. Use 'apt help' for sub-commands.");
};

// apt upgrade
class UpgradedPackage {
    constructor(oldVersion, newVersion, name, packageUrl) {
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.name = name;
        this.url = packageUrl;
    }
}

/**
 * *This function deletes the cached version of the module and then returns the module.
 * This is useful if you want to force a refresh of the module.*
 * @param {string} module - The name of the module to be required.
 */
function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

function makeLogFile(filename, data) {
    if (!fs.existsSync(path.dirname(filename)))
        fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.appendFileSync(filename, "\n" + data);
}

/**
 *
 * @param {*} action
 * @param {*} starttime
 * @param {*} endtime
 * @param {UpgradedPackage[]} packagesAffected
 * @returns
 */
function aptLog(action, starttime, endtime, packagesAffected) {
    const final = [];
    const d = new Date(performance.timeOrigin + starttime);
    const d2 = new Date(performance.timeOrigin + endtime);
    final[0] = "\nStart-Date: " + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    final[1] = "Commandline: " + "apt " + action;

    switch (action) {
        case "update":
            {
                const upgradeText = [];
                for (let i = 0; i < packagesAffected.length; i++) {
                    const element = packagesAffected[i];
                    upgradeText.push(element.name + "(" + element.oldVersion + ", " + element.newVersion + ")");
                }
                final[2] = "Upgrade: " + upgradeText.join(", ");
            }
            break;

        case "install":
            {
                const installText = [];
                for (let i = 0; i < packagesAffected.length; i++) {
                    const element = packagesAffected[i];
                    installText.push(element.name + "(" + element.newVersion + ")");
                }
                final[2] = "Install: " + installText.join(", ");
            }
            break;
        case "remove":
            {
                const removeText = [];
                for (let i = 0; i < packagesAffected.length; i++) {
                    const element = packagesAffected[i];
                    removeText.push(element.name + "(" + element.newVersion + ")");
                }
                final[2] = "Remove: " + removeText.join(", ");
            }
            break;
        default:
            break;
    }
    final[3] = "End-Date: " + d2.getFullYear() + "-" + d2.getMonth() + "-" + d2.getDate() + "  " + d2.getHours() + ":" + d2.getMinutes() + ":" + d2.getSeconds();
    return final.join("\n");
}