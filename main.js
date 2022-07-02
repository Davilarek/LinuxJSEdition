/* eslint-disable no-unused-vars */

// 16.05.2022 - I just realized that in real linux systems, you have access to binaries of commands instead of commands built in. when I think about it now, it's a huge mistake to use commands built in instead of modules.
// at this moment, I'm too lazy to change it. I hope I will change it in the future.

const executeTimestamp = performance.now()
const Discord = require('discord.js');

// sounds dangerous
var open = Discord.TextChannel.prototype.send;

function openReplacement(text) {
	// console.log(text);
	client.commandOutputHistory[0] = text;
	return open.apply(this, arguments);
}

Discord.TextChannel.prototype.send = openReplacement;

const client = new Discord.Client();
const fs = require('fs');
const path = require('path');
const wget = require('wget-improved');
const url = require("url");
let mod = null;
let ENV_VAR_BOOT_COMPLETE = false;
const ENV_VAR_BASE_DIR = process.cwd();
const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
let ENV_VAR_LIST = {
	"$HOME": "/root",
	"~": "/root",
	"$USER": "root"
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}
let ENV_VAR_BOT_TOKEN;
try {
	ENV_VAR_BOT_TOKEN = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "token.txt").toString();
} catch (error) {
	console.log("No bot token found. Cannot continue.");
	process.exit(0);
}

const ENV_VAR_APT_PROTECTED_DIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "bin";
const ENV_VAR_CONFIG_FILE = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config";
const ENV_VAR_APT_LOG_LOCATION = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "var" + path.sep + "log" + path.sep + "apt";
const ENV_VAR_NULL_CHANNEL = {
	/** 
	 * @param {string} content
	*/
	send: function (content) {
		client.commandOutputHistory[0] = content;
		content = null;
		return {
			"then": (v) => {
				// v = null;
				// console.log(v);
				// v();
			}
		}
	}
};
const ENV_VAR_CONSOLE_CHANNEL = {
	/** 
	 * @param {string} content
	*/
	send: function (content) {
		client.commandOutputHistory[0] = content;
		console.log(content);
		content = null;
		return {
			"then": (v) => {
				// v = null;
				// console.log(v);
				// v();
			}
		}
	}
}
const ENV_VAR_NULL_GUILD = {
	me: {
		setNickname: function (text) {
			if (client.safeClient["bootChannel"] != null) {
				client.safeClient["bootChannel"].guild.me.setNickname(text);
			}
		}
	}
}
let ENV_VAR_VERSION = 0;
let ENV_VAR_STARTUP_NICKNAME;
getVersion().then(v => {
	ENV_VAR_VERSION = v;
});

client.on('ready', () => {
	console.log("Connected as " + client.user.tag)
	client.user.setActivity("Linux JS Edition testing...");
	process.chdir('VirtualDrive');

	ENV_VAR_STARTUP_NICKNAME = client.user.username;
	// ENV_VAR_STARTUP_NICKNAME = client.user.username;
	console.log("Startup took " + (performance.now() - executeTimestamp) + "ms.");
	register();

	// getHash();
});

client.cmdList = {
	"cmdlist": `displays list of available commands and description`,
	"cmdinfo": `shows description of provided command (use without $ sign)`,
	"apt": `Advanced Packaging Tool, used for managing packages. Use 'apt help' for sub-commands.`,
	"ls": `display files in directory.`,
	"tree": `displays the folder and file structure of a path`,
	"pwd": `print working directory.`,
	"cd": `change directory.`,
	"mkdir": `make directory`,
	"cat": `read files`,
	"wget": `download files from web`,
	"cp": `copy file`,
	"rmdir": `remove directory`,
	"rm": `remove file`,
	"mv": `move file`,
	"touch": `create new file`,
	"js": `execute js file from bin directory`,
	"upgrade-os": `upgrade everything and re-download the os`,
	"reboot": `reboots os`,
	"sh": `runs a file executing every line with command from this list.`,
	"echo": 'simple echo command. supports variables',
	"secho": 'silent echo, prints to console',
	"export": 'makes a variable global',
	"whoami": `displays current user (always root)`
}

client.enableStdin = true;

client.commandHistory = [];

client.executeCommand = shellFunctionProcessor;

client.listEnv = ENV_VAR_LIST;

client.fakeMessageCreator = createFakeMessageObject;

client.commandOutputHistory = {};

client.coolTools = {
	"replaceAll": replaceAll
}

/* Registering an external command. */
client.registerExternalCommand = (name, func) => {
	externalCommandList[name] = func;
}

client.safeClient = {
	"cmdList": client.cmdList,
	"enableStdin": client.enableStdin,
	// "commandHistory": client.commandHistory,
	"executeCommand": client.executeCommand,
	"listEnv": ENV_VAR_LIST,
	"fakeMessageCreator": client.fakeMessageCreator,
	// "commandOutputHistory": client.commandOutputHistory,
	"coolTools": client.coolTools,
	"registerExternalCommand": client.registerExternalCommand
}

client.safeClient["bootChannel"] = null;

// very unsafe
// exports.cli = client;

/**
 * Get commit count from Github and return it
 * @returns The latest commit count.
 */
async function getVersion() {
	const bent = require('bent')
	const getHeaders = bent('https://api.github.com')
	// you may want to change this
	let str = getHeaders("/repos/Davilarek/LinuxJSEdition/commits?sha=master&per_page=1&page=1", null, { 'User-Agent': 'request' });
	var a = await str;
	let result = a.headers.link.split("https://api.github.com")[2].split("&")[2].split("=")[1].split(">")[0]
	return result;
}

/**
 * Get all the packages from the apt-repo repository
 */
async function getAllRepoPackages() {
	const bent = require('bent')
	const getJSON = bent('json')
	var repoUrl = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1].split("/")[fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1].split("/").length - 3] + "/" + fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1].split("/")[fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1].split("/").length - 2]
	//console.log(repoUrl);
	let str = getJSON("https://api.github.com/repos/" + repoUrl + "/git/trees/" + fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[2].split('=')[1], null, { 'User-Agent': 'request' });
	var a = await str;
	//console.log(a);
	var tree = await a.tree;
	var packages = [];
	for (let i = 0; i < tree.length; i++) {
		if (path.extname(tree[i].path) != ".js") { continue; }
		//console.log(tree[i].path);
		let ready = tree[i].path.replace("-install.js", "")
		fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
			// console.log(file);
			if (file == "empty.txt") { return; }
			// let addInstalled = false;
			// console.log(file)
			if (tree[i].path != file)
				return;
			// console.log(addInstalled)

			let package
			try {
				package = require(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
				package.Init(null, ENV_VAR_NULL_CHANNEL, ENV_VAR_BASE_DIR, client.safeClient);
			} catch (error) {
				// message.channel.send("An unexpected error occurred while trying to run package: " + file);
				console.log(error);
			}
			// if (addInstalled) {
			ready += "/" + package.Version + " [installed]";
			// }
			// else {
			// }
		});
		if (!ready.endsWith("[installed]"))
			ready += "/unknown version";
		// console.log(ready)
		packages.push(ready);
	}
	return packages;
}

function getHash() {
	const crypto = require('crypto');
	const fs = require('fs');

	console.log(__filename);
	const fileBuffer = fs.readFileSync(__filename);
	const hashSum = crypto.createHash('sha1');
	hashSum.update(fileBuffer);

	const hex = hashSum.digest('hex');

	console.log(hex);
}

/**
 * (Re-)register all commands.
 */
function register() {
	console.log("Registering commands...")
	client.on("message", (message) => {
		if (message.author.bot) return;
		//console.log("test");

		/* This code is the first thing that runs when the bot starts. It is used to load all of the packages that are in the autorun folder. */
		if (message.content == "$boot" && !ENV_VAR_BOOT_COMPLETE) {
			message.channel.send("`Linux JS Edition / rc1`\n`Login: root (automatic login)`\n\n`Linux JS v0.1." + ENV_VAR_VERSION + "-amd64`");
			client.safeClient["bootChannel"] = message.channel;
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				if (file == "empty.txt") { return; }
				console.log("Loading " + file + "...");
				try {
					let package = require(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, message.channel, ENV_VAR_BASE_DIR, client.safeClient);
				} catch (error) {
					message.channel.send("An unexpected error occurred while trying to run package: " + file);
					console.log(error);
				}

			});
			// cdCommand({
			// 	content: "$cd $HOME",
			// 	channel: ENV_VAR_NULL_CHANNEL
			// })
			shellFunctionProcessor(createFakeMessageObject("$cd $HOME"));
			if (fs.existsSync(".bashrc"))
				executeShFile(".bashrc", message);
			ENV_VAR_BOOT_COMPLETE = true;
			client.commandHistory.push("$boot");
			return;
		}

		// bot isn't booted, go back
		if (!ENV_VAR_BOOT_COMPLETE) return;

		if (message.content.startsWith("$"))
			client.commandHistory.push(message.content);

		// console.log(client.enableStdin)
		if (client.safeClient["enableStdin"] == true)
			// console.log(client.commandHistory.length);

			// if (client.commandHistory.length > 1 && !client.commandHistory[client.commandHistory.length - 2].startsWith("$edit"))
			// if (client.commandHistory[client.commandHistory.length - 2] && !client.commandHistory[client.commandHistory.length - 2].startsWith("$edit"))
			shellFunctionProcessor(message);
		// else if (client.commandHistory.length > 1)
		// 	shellFunctionProcessor(message);
		// else if ()
		// 	shellFunctionProcessor(message);
	});
	console.log("Registered about " + Object.keys(client.safeClient.cmdList).length + " commands.")
}

/**
 * This function is used to install, remove or update packages.
 * @param contextMsg - The message that triggered the command.
 */
function aptCommand(contextMsg) {

	/* This code is responsible for installing a package. */
	if (contextMsg.content.split(" ")[1] == "install") {
		if (contextMsg.content.split(" ")[2] == undefined) { return; }
		let start = performance.now();
		let updatedCount = 0;
		let downloadNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		contextMsg.channel.send("Reading config...");
		let branchName = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[2].split('=')[1];
		contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
		let githubRepoUrl = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1];
		let makeURL = githubRepoUrl + branchName + "/" + downloadNameNormalize + "-install.js";
		let downloadDir = ENV_VAR_APT_PROTECTED_DIR;
		contextMsg.channel.send("Get " + makeURL + "...");
		if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
		var parsed = url.parse(makeURL);
		contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
		let download = null
		/**
		 * @type {UpgradedPackage[]}
		 */
		let packagesInstalled = [];
		if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
			download = wget.download(makeURL, downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname));
		}
		else {
			download = wget.download(makeURL, downloadDir + path.sep + path.basename(parsed.pathname));
		}
		download.on('end', function (output) {
			contextMsg.channel.send("Download complete.");
			var pFile = null
			if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
				pFile = downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname);
				//console.log("t1");
			}
			else {
				pFile = downloadDir + path.sep + path.basename(parsed.pathname);
				//console.log("t2");
			}
			fs.readFile(pFile, function (err, data) {
				if (err) throw err;
				contextMsg.channel.send("Setting up \"" + downloadNameNormalize + "\"...");
				mod = requireUncached(pFile);
				mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client.safeClient);
				packagesInstalled.push(new UpgradedPackage(mod.Version, mod.Version, downloadNameNormalize, makeURL));

				updatedCount += 1;
				contextMsg.channel.send("Done").then(v => {
					var end = performance.now();
					var time = end - start;
					contextMsg.channel.send(updatedCount + " package(s) were updated in " + parseInt(time).toFixed() + "ms.");
					makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("install", start, end, packagesInstalled))
				});
			});
		});
		download.on('error', function (err) {
			contextMsg.channel.send("No package found with name \"" + downloadNameNormalize + "\".");
		});
	}


	/* This code is responsible for removing a package from the system. */
	if (contextMsg.content.split(" ")[1] == "remove") {
		if (contextMsg.content.split(" ")[2] == undefined) { return; }
		let start = performance.now();
		let updatedCount = 0;
		let removeNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		let removeDir = null
		/**
		 * @type {UpgradedPackage[]}
		 */
		let packagesRemoved = [];
		if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
			removeDir = ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun";
		}
		else {
			removeDir = ENV_VAR_APT_PROTECTED_DIR;
		}
		if (!fs.existsSync(removeDir)) fs.mkdirSync(removeDir);
		if (fs.existsSync(removeDir + path.sep + removeNameNormalize + "-install.js")) {
			//delete require.cache[removeDir + path.sep + removeNameNormalize + "-install.js"];
			let package = requireUncached(removeDir + path.sep + removeNameNormalize + "-install.js");
			packagesRemoved.push(new UpgradedPackage(package.Version, package.Version, removeNameNormalize, ""));

			fs.rmSync(removeDir + path.sep + removeNameNormalize + "-install.js");

			client.removeAllListeners("message");
			register();
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				if (file == "empty.txt") { return; }
				try {
					let package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client.safeClient);

				} catch (error) {
					contextMsg.channel.send("An unexpected error occurred while trying to run package: " + file);
				}
			});
			updatedCount += 1;
			contextMsg.channel.send(removeNameNormalize + " removed successfully.").then(v => {
				var end = performance.now();
				var time = end - start;
				contextMsg.channel.send(updatedCount + " package(s) were removed in " + parseInt(time).toFixed() + "ms.");
				makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("remove", start, end, packagesRemoved))
			});
		}
		else {
			contextMsg.channel.send(removeNameNormalize + " not found.");
		}
	}


	/* The above code is a simple update script for the bot. It will download all packages from the repository and replace the old ones. */
	if (contextMsg.content.split(" ")[1] == "update") {
		let finished = false;
		const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
		let updatedCount = 0;
		let branchName = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1];
		contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
		let githubRepoUrl = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[1].split('=')[1];
		let start = performance.now();
		/**
		 * @type {UpgradedPackage[]}
		 */
		let updatesInstalled = [];
		fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
			if (file == "empty.txt") { return; }
			console.log(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
			let makeURL = githubRepoUrl + branchName + "/" + file;
			let download = wget.download(makeURL, BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
			contextMsg.channel.send("Checking " + file.replace("-install.js", "") + "...");
			download.on('end', function (output) {
				let package = requireUncached(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
				let packageOld = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
				if (package.Version != packageOld.Version) {
					contextMsg.channel.send("Replace \"" + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file) + "\" (Version " + packageOld.Version + ") with version " + package.Version + ".");
					fs.writeFileSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file, fs.readFileSync(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)));
					contextMsg.channel.send("Done.");
					updatesInstalled.push(new UpgradedPackage(packageOld.Version, package.Version, file.replace("-install.js", ""), makeURL));
					updatedCount += 1;
					finished = true;
				}
				delete require.cache[BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)];
				delete require.cache[ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file];
			});
			download.on('error', function (err) {
				contextMsg.channel.send("No package found with name \"" + path.basename(file) + "\".");
			});
		});
		if (finished) {
			client.removeAllListeners("message");
			register();
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				try {
					let package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client.safeClient);
				} catch (error) {
					//contextMsg.channel.send("An unexpected error occurred while trying to run package: " + file);
				}
			});
		}
		contextMsg.channel.send("Done").then(v => {
			var end = performance.now();
			var time = end - start;
			contextMsg.channel.send(updatedCount + " package(s) were updated in " + parseInt(time).toFixed() + "ms.");
			makeLogFile(ENV_VAR_APT_LOG_LOCATION + path.sep + "history.log", aptLog("update", start, end, updatesInstalled));
		});
	}


	/* Send message with all packages in the repository. */
	if (contextMsg.content.split(" ")[1] == "list-all") {
		contextMsg.channel.send("Collecting data from repository...").then(v => {
			getAllRepoPackages().then(v => {
				contextMsg.channel.send(v.join("\n"));
				// contextMsg.channel.send("Done.");
			});
		})
	}


	if (contextMsg.content.split(" ")[1] == "help") {
		contextMsg.channel.send("`install <package name>` - `install package by name`\n`remove <package name>` - `remove package by name`\n`update` - `replace all outdated packages with newer ones`\n`list-all` - `list all packages in repository.`\n`change-branch <branch name>` - `change branch used in apt update and install`\n`what-branch` - `show currently used branch`");
	}

	if (contextMsg.content.split(" ")[1] == "change-branch") {
		// console.log(contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, ""))
		contextMsg.channel.send("Read `/root/.config`...");
		const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
		let changedBranch = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString();
		let c2 = changedBranch.split("\n")[2].split('=')[0] + "=" + contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "")
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
		shellFunctionProcessor({ "content": "$cat /root/.config", "channel": contextMsg.channel });
	}
	if (contextMsg.content.split(" ")[1] == "what-branch") {
		const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
		contextMsg.channel.send(fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1]);
	}
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
	let final = []
	var d = new Date(performance.timeOrigin + starttime);
	var d2 = new Date(performance.timeOrigin + endtime);
	final[0] = "\nStart-Date: " + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	final[1] = "Commandline: " + "apt " + action;

	switch (action) {
		case "update":
			{
				let upgradeText = [];
				for (let i = 0; i < packagesAffected.length; i++) {
					const element = packagesAffected[i];
					upgradeText.push(element.name + "(" + element.oldVersion + ", " + element.newVersion + ")")
				}
				final[2] = "Upgrade: " + upgradeText.join(", ")
			}
			break;

		case "install":
			{
				let installText = [];
				for (let i = 0; i < packagesAffected.length; i++) {
					const element = packagesAffected[i];
					installText.push(element.name + "(" + element.newVersion + ")")
				}
				final[2] = "Install: " + installText.join(", ")
			}
			break;
		case "remove":
			{
				let removeText = [];
				for (let i = 0; i < packagesAffected.length; i++) {
					const element = packagesAffected[i];
					removeText.push(element.name + "(" + element.newVersion + ")")
				}
				final[2] = "Remove: " + removeText.join(", ")
			}
			break;
		default:
			break;
	}
	final[3] = "End-Date: " + d2.getFullYear() + "-" + d2.getMonth() + "-" + d2.getDate() + "  " + d2.getHours() + ":" + d2.getMinutes() + ":" + d2.getSeconds();
	return final.join("\n");
}

function makeLogFile(filename, data) {
	if (!fs.existsSync(path.dirname(filename)))
		fs.mkdirSync(path.dirname(filename), { recursive: true });
	fs.appendFileSync(filename, "\n" + data);
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

/**
 * It lists the files in the current directory.
 * @param contextMsg - The message that triggered the command.
 */
function lsCommand(contextMsg, variableList) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
	pathWithoutDrive = replaceAll(pathWithoutDrive, "\\", "/");

	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$ls") { pathCorrected = "." }

	// console.log(pathCorrected);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}
	if (fs.existsSync(pathCorrected)) {
		if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
			// if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
			contextMsg.channel.send("Error: cannot access this path.");
		}
		else {
			fs.readdir(pathCorrected, (err, files) => {
				if (!files.length) {
					contextMsg.channel.send("`" + pathWithoutDrive + "` is empty.");
				}
				else {
					contextMsg.channel.send(files.join(', '));
				}
			});
		}
	}
	else {
		contextMsg.channel.send("Error: directory doesn't exist.");
	}
}

function treeCommand(contextMsg, variableList) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
	pathWithoutDrive = replaceAll(pathWithoutDrive, "\\", "/");

	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$tree") { pathCorrected = process.cwd() }

	// console.log(pathCorrected);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}
	if (fs.existsSync(pathCorrected)) {
		if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
			// if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
			contextMsg.channel.send("Error: cannot access this path.");
		}
		else {
			// console.log((new Array(level + 1)).join(" "))
			var str = readTree(buildTree(replaceAll(pathCorrected, "\\", "/")), 0);
			for (let i = 0; i < str.length; i += 1800) {
				const toSend = str.substring(i, Math.min(str.length, i + 1800));
				contextMsg.channel.send("```\n" + toSend + "\n```");
			}
			// contextMsg.channel.send("```\n" +  + "\n```", { split: true });
		}
	}
	else {
		contextMsg.channel.send("Error: directory doesn't exist.");
	}
}

function readTree(tree, level) {
	let final = "";
	// console.log(tree.children);
	// console.log(tree.path);
	// console.log(tree.path.split("/").length)
	if (tree.path.split("/").length == 1 || tree.path.split("/")[tree.path.split("/").length - 1] == "")
		final += (new Array(level)).join("─") + "/:" + "\n"
	else if (tree.path)
		final += (new Array(level + 1)).join(" ") + "└─" + (new Array(level + 1)).join("─") + tree.path.split("/")[tree.path.split("/").length - 1] + "\n"
	if (tree.children)
		for (let index = 0; index < tree.children.length; index++) {
			const element = tree.children[index];
			// console.log(element.path.split("/")[element.path.split("/").length - 1])
			// final += (new Array(level + 1)).join("-") + element.path.split("/")[element.path.split("/").length - 1]
			if (element.children) {
				// final +=  readTree(element.children, level + 1) + "\n";
				// console.log(element.children)
				if (!element.children)
					final += readTree(element, level + 1) + "\n";
				else
					final += readTree(element, level + 1);
			}
		}
	return final;
}

/**
 * It returns the current working directory.
 * @param contextMsg - The message that triggered the command.
 */
function pwdCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive', '');
	pathWithoutDrive = replaceAll(pathWithoutDrive, "\\", "/");
	if (pathWithoutDrive == "") {
		pathWithoutDrive = "/";
	}
	// console.log(pathWithoutDrive)
	contextMsg.channel.send(pathWithoutDrive)
}

/**
 * Change the current working directory to the given path
 * @param contextMsg - The message that triggered the command.
 */
function cdCommand(contextMsg, variableList) {
	// if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).startsWith("$") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).startsWith("~")) {
	// 	if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).toString().replace("$", "") in ENV_VAR_LIST) {
	// 		const stat = fs.lstatSync(ENV_VAR_LIST[contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).replace("$", "")]);
	// 		if (stat.isFile() != true) {
	// 			process.chdir(ENV_VAR_LIST[contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).replace("$", "")]);
	// 		}
	// 		else {
	// 			contextMsg.channel.send("Error: given path is not an directory.");
	// 		}
	// 	}
	// }
	// else {


	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$cd") { return; }

	//console.log("test")

	//console.log(pathCorrected);


	//console.log(pathCorrected);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		//console.log(i);
		//console.log(ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
		//console.log(Object.keys(ENV_VAR_LIST)[i]);

		// it doesn't look good
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}
	//console.log(pathCorrected);

	if (pathCorrected.startsWith("/")) {
		//if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}
	//console.log(pathCorrected);

	if (fs.existsSync(pathCorrected)) {
		if (path.resolve(pathCorrected).includes("VirtualDrive") && !path.resolve(pathCorrected).includes(ENV_VAR_APT_PROTECTED_DIR)) {
			const stat = fs.lstatSync(pathCorrected);
			if (stat.isFile() != true) {
				process.chdir(pathCorrected);
				let pwd = runAndGetOutput("$pwd", localVarList)
				// console.log(pwd.length);
				// console.log(len(ENV_VAR_STARTUP_NICKNAME+ pwd));
				// console.log(pwd.split("/")[pwd.split("/").length - 1])
				if ((ENV_VAR_STARTUP_NICKNAME.length + pwd.length) < 31)
					contextMsg.guild.me.setNickname(ENV_VAR_STARTUP_NICKNAME + " [" + pwd + "]");
				else
					contextMsg.guild.me.setNickname(ENV_VAR_STARTUP_NICKNAME + " [" + pwd.split("/")[pwd.split("/").length - 1] + "]");
			}
			else {
				contextMsg.channel.send("Error: given path is not an directory.");
			}
		}
		else {
			contextMsg.channel.send("Error: cannot `cd` into this directory.");
		}
	}
	else {
		contextMsg.channel.send("Error: directory doesn't exist.");
	}
	//}
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace all occurrences of the string find in str with the string replace
 * @param {string} str - The string to be modified.
 * @param {string} find - The string to search for.
 * @param {string} replace - The string to replace the matches with.
 * @returns {string} The string with the replaced values.
 */
function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * Create a directory.
 * @param contextMsg - The message object that triggered the command.
 */
function mkdirCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == "$mkdir") { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	// if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("..") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith(path.sep) || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("/")) {
	// 	contextMsg.channel.send("Error: cannot create directory.");
	// }
	// else {
	// 	if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
	// 		fs.mkdirSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
	// 		contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
	// 	}
	// 	else {
	// 		contextMsg.channel.send("Error: directory already exists.");
	// 	}
	// }

	// console.log(pathCorrected);

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || path.basename(pathCorrected) == "VirtualDrive" || pathCorrected.endsWith("..") || pathCorrected.endsWith(path.sep) || pathCorrected.endsWith("/")) {
		contextMsg.channel.send("Error: cannot create directory.");
	}
	else {
		// console.log(pathCorrected);

		if (pathCorrected.startsWith("-")) {
			const msgSplit = pathCorrected.split(" ");
			if (!msgSplit[1]) {
				contextMsg.channel.send("Error: no file or directory specified.");
				return;
			}
			if (!path.resolve(msgSplit[1]).includes("VirtualDrive") || path.basename(pathCorrected) == "VirtualDrive" || msgSplit[1].includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes(path.basename(path.resolve(msgSplit[1])))) {
				contextMsg.channel.send("Error: cannot access this path.");
			}
			else {
				if (msgSplit[0] == "-p") {
					pathCorrected = msgSplit[1];
					console.log(pathCorrected);
					if (!fs.existsSync(pathCorrected)) {
						try {
							fs.mkdirSync(pathCorrected, { recursive: true });
							contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
						} catch (error) {
							console.log(error)
							contextMsg.channel.send("Unexpected error occurred while creating `" + path.basename(pathCorrected) + "`.");
						}
					}
					else {
						contextMsg.channel.send("Error: directory already exists.");
					}
				}
			}
		}
		else
			if (!fs.existsSync(pathCorrected)) {
				try {
					fs.mkdirSync(pathCorrected);
					contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
				} catch (error) {
					contextMsg.channel.send("Unexpected error occurred while creating `" + path.basename(pathCorrected) + "`.");
				}
			}
			else {
				contextMsg.channel.send("Error: directory already exists.");
			}
	}
}

/**
 * It takes a path as an argument, checks if it's a file, and if it is, it checks if it's empty or too
 * big to cat. If it is, it sends an error message. If it isn't, it reads the file and sends it in
 * chunks of 2000 characters
 * @param contextMsg - The message object that triggered the command.
 */
function catCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == "$cat") { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(pathCorrected)) {
			const stat = fs.lstatSync(pathCorrected);
			// console.log(stat.size);
			if (stat.isFile()) {
				if (stat.size == 0) {
					contextMsg.channel.send("`file is empty`");
				}
				if (stat.size > 50000000) {
					contextMsg.channel.send("Error: file is too big to cat.");
				}
				else {
					let output = '';
					const readStream = fs.createReadStream(pathCorrected);
					readStream.on('data', function (chunk) {
						output += chunk.toString('utf8');
					});
					readStream.on('end', function () {
						var str = output;
						for (let i = 0; i < str.length; i += 2000) {
							const toSend = str.substring(i, Math.min(str.length, i + 2000));
							contextMsg.channel.send("```\n" + toSend + "\n```");
						}
						// TODO: replace-able with
						// contextMsg.channel.send("```\n" + str + "\n```", { split: true });
					});
				}
			}
			else {
				contextMsg.channel.send("Error: given path is not an file.");
			}
		}
		else {
			contextMsg.channel.send("Error: file doesn't exist.");
		}
	}
}

/**
 * Downloads a file from a URL to a specified path
 * @param contextMsg - The message object that triggered the command.
 */
function wgetCommand(contextMsg) {
	if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1) == "$wget") {
		contextMsg.channel.send("Error: link not specified.");
	}
	else {
		var parsed = url.parse(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
		if (!fs.existsSync(path.basename(parsed.pathname))) {
			contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
			let download = wget.download(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1), path.basename(parsed.pathname));
			download.on('end', function (output) {
				contextMsg.channel.send("Download complete.");
			});
		}
		else {
			contextMsg.channel.send("Error: file already exist.");
		}
	}
}

/**
 * Copy a file from one path to another
 * @param contextMsg - The message object that triggered the command.
 */
function cpCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.split(" ")[1];
	let pathCorrected2 = contextMsg.content.split(" ")[2];

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == undefined) { return; }
	if (pathCorrected2 == undefined) { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
		pathCorrected2 = replaceAll(pathCorrected2, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}
	if (pathCorrected2.startsWith("/")) {
		pathCorrected2 = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	//console.log(pathCorrected);

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || !path.resolve(pathCorrected2).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(pathCorrected)) {
			if (!fs.existsSync(pathCorrected2)) {
				try {
					fs.copyFileSync(pathCorrected, pathCorrected2);
					contextMsg.channel.send("Done.");
				} catch (error) {
					contextMsg.channel.send("Unexpected error occurred while copying `" + path.basename(pathCorrected) + "`.");
				}
			}
			else {
				contextMsg.channel.send("Error: target file already exist or is directory.");
			}
		}
		else {
			contextMsg.channel.send("Error: source file doesn't exist.");
		}
	}
}

/**
 * It deletes an empty directory.
 * @param contextMsg - The message object that triggered the command.
 */
function rmdirCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == "$rmdir") { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(pathCorrected)) {
			if (!fs.lstatSync(pathCorrected).isFile()) {
				fs.readdir(pathCorrected, (err, files) => {
					if (!files.length) {
						fs.rmdirSync(pathCorrected);
						contextMsg.channel.send("Directory `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
					}
					else {
						contextMsg.channel.send("Error: directory is not empty.");
					}
				});
			}
			else {
				contextMsg.channel.send("Error: given path is not an directory.");
			}
		}
		else {
			contextMsg.channel.send("Error: directory doesn't exist.");
		}
	}
}

/**
 * It deletes a file or directory.
 * @param contextMsg - The message object that triggered the command.
 */
function rmCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == "$rm") { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || pathCorrected.includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (pathCorrected.startsWith("-")) {
			const msgSplit = pathCorrected.split(" ");
			if (!msgSplit[1]) {
				contextMsg.channel.send("Error: no file or directory specified.");
				return;
			}
			if (!path.resolve(msgSplit[1]).includes("VirtualDrive") || msgSplit[1].includes("VirtualDrive") || msgSplit[1].includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes(path.basename(path.resolve(msgSplit[1])))) {
				contextMsg.channel.send("Error: cannot access this path.");
			}
			else {
				if (msgSplit[0] == "-d") {
					if (fs.existsSync(msgSplit[1])) {
						if (!fs.lstatSync(msgSplit[1]).isFile()) {
							fs.readdir(msgSplit[1], (err, files) => {
								if (!files.length) {
									fs.rmdirSync(msgSplit[1]);
									contextMsg.channel.send("Directory `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
								}
								else {
									contextMsg.channel.send("Error: directory is not empty.");
								}
							});
						}
						else {
							contextMsg.channel.send("Error: given path is not an directory.");
						}
					}
					else {
						contextMsg.channel.send("Error: directory doesn't exist.");
					}
				}
				if (msgSplit[0] == "-f") {
					if (fs.existsSync(msgSplit[1]) && !fs.lstatSync(msgSplit[1]).isFile()) {
						contextMsg.channel.send("Error: given path is an directory.");
						return;
					}
					fs.rmSync(msgSplit[1], { force: true });
					contextMsg.channel.send("File `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
				}
				if (msgSplit[0] == "-rf" || msgSplit[0] == "-fr" || msgSplit[0] == "-r") {
					/*
					if (fs.existsSync(msgSplit[1]) && !fs.lstatSync(msgSplit[1]).isFile()) {
						contextMsg.channel.send("Error: given path is an directory.");
						return;
					}
					*/
					fs.rmSync(msgSplit[1], { recursive: true, force: true });
					contextMsg.channel.send("File(s) `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
				}
			}
		}
		else {
			if (fs.existsSync(pathCorrected)) {
				if (fs.lstatSync(pathCorrected).isFile()) {
					fs.rmSync(pathCorrected);
					contextMsg.channel.send("File `" + path.resolve(pathCorrected).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
				}
				else {
					contextMsg.channel.send("Error: given path is not an file.");
				}
			}
			else {
				contextMsg.channel.send("Error: file doesn't exist.");
			}
		}
	}
}

/**
 * Move a file from one location to another
 * @param contextMsg - The message object that triggered the command.
 */
function mvCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.split(" ")[1];
	let pathCorrected2 = contextMsg.content.split(" ")[2];

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == undefined) { return; }
	if (pathCorrected2 == undefined) { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
		pathCorrected2 = replaceAll(pathCorrected2, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}
	if (pathCorrected2.startsWith("/")) {
		pathCorrected2 = pathCorrected2.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	//console.log(pathCorrected);

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || !path.resolve(pathCorrected2).includes("VirtualDrive") || pathCorrected.includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected)))) || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected2))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(pathCorrected)) {
			if (!fs.existsSync(pathCorrected2)) {
				try {
					fs.renameSync(pathCorrected, pathCorrected2);
					contextMsg.channel.send("Done.");
				} catch (error) {
					contextMsg.channel.send("Unexpected error occurred while moving `" + path.basename(pathCorrected) + "`.");
				}
			}
			else {
				contextMsg.channel.send("Error: target file already exist or is directory.");
			}
		}
		else {
			contextMsg.channel.send("Error: source file doesn't exist.");
		}
	}
}

/**
 * Creates a file at the specified path
 * @param contextMsg - The message object that triggered the command.
 */
function touchCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	if (pathCorrected == "$touch") { return; }

	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	if (pathCorrected.startsWith("/")) {
		pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
	}

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (!fs.existsSync(pathCorrected)) {
			fs.closeSync(fs.openSync(pathCorrected, 'w'));
			contextMsg.channel.send("Done.");
		}
		else {
			contextMsg.channel.send("Error: target file already exist.");
		}
	}
}

/**
 * It loads a JavaScript file from the protected directory, executes it, and then sends a message to
 * the channel
 * @param contextMsg - The message that triggered the command.
 * @returns The return value is the result of the command.
 */
function jsCommand(contextMsg) {
	contextMsg.channel.send("Please note that this command is not supported and I do not take responsibility for any damage caused by using this command.");
	let filenameBase = contextMsg.content.split(" ")[1];
	let pFile = ENV_VAR_APT_PROTECTED_DIR + path.sep + filenameBase;

	if (!fs.existsSync(pFile) || !fs.statSync(pFile).isFile()) { return; }
	contextMsg.channel.send("Setting up \"" + filenameBase + "\"...");
	try {
		mod = require(pFile);
		contextMsg.channel.send("Executing \"" + filenameBase + "\"...");
		mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client.safeClient);
		contextMsg.channel.send("Done");
	} catch (error) {
		contextMsg.channel.send("Cannot execute \"" + filenameBase + "\".");
	}
}

/**
 * Delete the module from the cache and recursively delete all of its children
 * @param moduleName - The name of the module to delete.
 */
function deleteModule(moduleName) {
	var solvedName = require.resolve(moduleName), nodeModule = require.cache[solvedName];
	if (nodeModule) {
		for (var i = 0; i < nodeModule.children.length; i++) {
			var child = nodeModule.children[i];
			deleteModule(child.filename);
		}
		delete require.cache[solvedName];
	}
}

/**
 * Get all the files in a directory and its subdirectories
 * @param dirPath - The path to the directory you want to search.
 * @param arrayOfFiles - An array of files to be returned.
 * @returns An array of all the files in the directory.
 */
function getAllFiles(dirPath, arrayOfFiles) {
	let files = fs.readdirSync(dirPath);
	arrayOfFiles = arrayOfFiles || [];
	files.forEach(function (file) {
		if (fs.statSync(dirPath + path.sep + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + path.sep + file, arrayOfFiles);
		} else {
			arrayOfFiles.push(path.join(dirPath, path.sep, file));
		}
	});
	return arrayOfFiles;
}

/**
 * * Close the main process and kill all modules
 */
function closeMain() {
	client.removeAllListeners("message");
	getAllFiles(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive').forEach(f => {
		try {
			deleteModule(f);
		} catch (error) {
			console.log("skip" + f);
		}
	});
	client.destroy();
}

/**
 * * Navigate to the base directory of the environment variable.
 * * Close the main process.
 * * Run the `Upgrade` function from the `index.js` file
 */
function UpgradeOS() {
	process.chdir(ENV_VAR_BASE_DIR);
	closeMain();
	require.cache[require.resolve("./index.js")].exports.Upgrade();
}
/**
 * * Navigate to the base directory of the environment variable.
 * * Close the main process.
 * * Run the `Reboot` function from the `index.js` file
 */
function RebootOS(msg) {
	process.chdir(ENV_VAR_BASE_DIR);
	closeMain();
	require.cache[require.resolve("./index.js")].exports.Reboot(msg);
}

function echoCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	let localVarList = { ...ENV_VAR_LIST, ...variableList };

	console.log(localVarList)

	if (pathCorrected == "$echo") { return; }
	for (let i = 0; i < Object.keys(localVarList).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
	}

	contextMsg.channel.send(pathCorrected);
}

function readCommand(contextMsg, variableList) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);
	let filter = m => m.author.id === contextMsg.author.id;
	contextMsg.channel.awaitMessages(filter, {
		max: 1
	})
		.then(message => {
			variableList[pathCorrected] = message.content;
		});
}

/**
 * It takes a string and returns a fake message object with the string as the content
 * @param {string} text - The text that you want to send to the bot.
 * @returns A message object with the content of the text and the channel of the null channel.
 */
function createFakeMessageObject(text) {
	let messageObject = { "content": text, "channel": ENV_VAR_NULL_CHANNEL, "guild": ENV_VAR_NULL_GUILD }
	return messageObject;
}

function createConsoleMessageObject(text) {
	let messageObject = { "content": text, "channel": ENV_VAR_CONSOLE_CHANNEL, "guild": ENV_VAR_NULL_GUILD }
	return messageObject;
}

let externalCommandList = {};



function shellFunctionProcessor(messageObject, variableList) {
	if (!variableList)
		variableList = {}

	if (messageObject.content.startsWith("$"))
		variableList["$RANDOM"] = getRandomInt(32768);

	if (messageObject.content.startsWith("$apt install")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt remove")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt update")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt list-all")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt help")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt change-branch")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$apt what-branch")) {
		aptCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$ls")) {
		lsCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$tree")) {
		treeCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$pwd")) {
		pwdCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$cd")) {
		cdCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$mkdir")) {
		mkdirCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$cat")) {
		catCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$wget")) {
		wgetCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$cp")) {
		cpCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$rmdir")) {
		rmdirCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$rm")) {
		rmCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$mv")) {
		mvCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$touch")) {
		touchCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$js")) {
		jsCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$cmdlist")) {
		// format = 'name' - 'description'
		let commandList = "";
		for (let i = 0; i < Object.keys(client.cmdList).length; i++) {
			commandList += "`" + Object.keys(client.cmdList)[i] + "` - `" + Object.values(client.cmdList)[i] + "`\n";
		}
		// console.log(commandList);
		messageObject.channel.send(commandList);
		return;
	}
	if (messageObject.content.startsWith("$cmdinfo")) {
		for (let i = 0; i < Object.keys(client.cmdList).length; i++) {
			if (Object.keys(client.cmdList)[i] == messageObject.content.split(" ")[1]) {
				messageObject.channel.send("`" + Object.keys(client.cmdList)[i] + "` - `" + Object.values(client.cmdList)[i] + "`\n");
			}
		}
		return;
	}
	if (messageObject.content.startsWith("$upgrade-os")) {
		UpgradeOS();
		return;
	}
	if (messageObject.content.startsWith("$reboot")) {
		RebootOS(messageObject);
		return;
	}
	if (messageObject.content.startsWith("$echo")) {
		echoCommand(messageObject, variableList);
		return;
	}
	if (messageObject.content.startsWith("$secho")) {
		echoCommand(createConsoleMessageObject(messageObject.content), variableList);
		return;
	}
	if (messageObject.content.startsWith("$export")) {
		exportCommand(messageObject);
		return;
	}
	// inline sh
	if (messageObject.content.startsWith("$ish")) {
		// console.log(messageObject.content);
		if (messageObject.content.split("\n")[1].startsWith("```") && messageObject.content.split("\n")[1].endsWith("```")) {
			//console.log(messageObject.content.split("\n")[2]);
			let lines = []
			for (let i = 2; i < messageObject.content.split("\n").length; i++) {
				if (messageObject.content.split("\n")[i].startsWith("```"))
					break;
				lines.push(messageObject.content.split("\n")[i]);
			}
			// create random temp filename
			let tempFileName = ENV_VAR_APT_PROTECTED_DIR + path.sep;
			for (let i = 0; i < 10; i++) {
				tempFileName += getRandomInt(10);
			}
			// lines.push("$rm -rf " + tempFileName);
			// write temp file

			//create file
			fs.writeFileSync(tempFileName, lines.join("\n"));

			// shellFunctionProcessor(createFakeMessageObject("$touch " + tempFileName))
			// fs.writeFileSync(tempFileName, lines.join("\n"));



			// run temp file
			executeShFile(tempFileName, messageObject, variableList);
			fs.rmSync(tempFileName);
		}
	}
	if (messageObject.content.startsWith("$whoami")) {
		whoamiCommand(messageObject);
		return;
	}
	if (messageObject.content.startsWith("$sh")) {
		if (messageObject.content.split(" ")[1] == "" || !messageObject.content.split(" ")[1]) {
			messageObject.channel.send("Error: filename required"); return;
		}

		let pathCorrected = messageObject.content.split(" ")[1];

		if (pathCorrected == "$sh") { return; }

		// console.log(pathCorrected);

		let localVarList = { ...ENV_VAR_LIST, ...variableList };

		for (let i = 0; i < Object.keys(localVarList).length; i++) {
			pathCorrected = replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
		}

		if (pathCorrected.startsWith("/")) {
			pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
		}
		if (fs.existsSync(pathCorrected)) {
			if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
				// if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
				messageObject.channel.send("Error: cannot access this path.");
			}
			else {
				executeShFile(pathCorrected, messageObject, variableList);
			}
		}
		return;
	}

	// doesn't work because command execution can't be paused
	// if (messageObject.content.startsWith("$read")) {
	// 	readCommand(messageObject, variableList);
	// 	return;
	// }
	// console.log(externalCommandList)
	for (let externalCommandIndex = 0; externalCommandIndex < Object.keys(externalCommandList).length; externalCommandIndex++) {
		const element = Object.keys(externalCommandList)[externalCommandIndex];
		// console.log(element);
		if (element == messageObject.content.split(" ")[0]) {
			// console.log(messageObject.content.substring(messageObject.content.indexOf(" ") + 1))
			externalCommandList[element](messageObject, variableList);
		}
	}
}

module.exports.CloseAndUpgrade = function () {
	UpgradeOS();
};

function executeShFile(filename, msg, customVarList) {
	let fileContent = fs.readFileSync(filename, 'utf-8')
	let lines = fileContent.split("\n");

	let localVars = {}
	if (customVarList)
		localVars = customVarList;

	localVars["$0"] = filename;
	if (msg) {
		localVars["$1"] = msg.content.split(" ")[2];
		localVars["$2"] = msg.content.split(" ")[3];
		localVars["$3"] = msg.content.split(" ")[4];
		localVars["$4"] = msg.content.split(" ")[5];
		localVars["$5"] = msg.content.split(" ")[6];
		localVars["$6"] = msg.content.split(" ")[7];
		localVars["$7"] = msg.content.split(" ")[8];
		localVars["$8"] = msg.content.split(" ")[9];
		localVars["$9"] = msg.content.split(" ")[10];
	}

	// let ifs = []
	// let ifAmount = 0;
	for (let currentLineIndex = 0; currentLineIndex < lines.length; currentLineIndex++) {
		const element = lines[currentLineIndex];

		console.log("Executing " + filename + ". Current line: " + currentLineIndex)

		if (element.split("=")[1] && !element.startsWith("if [[")) {
			// console.log(element.split("=")[1])
			// console.log(element)
			if (element.split("=")[1].startsWith("$((") && element.split("=")[1].endsWith("))")) {
				localVars["$" + element.split("=")[0]] = parseMath(element.split("=")[1].split("$((")[1].split("))")[0], localVars);
				continue;
			}
			if (element.split("=")[1].startsWith("$(") && element.split("=")[1].endsWith(")")) {
				localVars["$" + element.split("=")[0]] = runAndGetOutput(element.split("=")[1].split("$(")[1].split(")")[0], localVars);
				continue;
			}

			// console.log(element.split("=")[1].split("$((")[1].split("))")[0])

			if (element.split("=")[1].startsWith("$")) {
				localVars["$" + element.split("=")[0]] = localVars[element.split("=")[1]];
				continue;
			}
			if (!element.startsWith("$export"))
				localVars["$" + element.split("=")[0]] = element.split("=")[1];
			// continue;s
		}

		// if (element.startsWith("if [[")) {

		// 	ifs[ifAmount] = [];
		// 	ifs[ifAmount].lines = [];
		// 	ifs[ifAmount].endingLine = 0;
		// 	let allVars = { ...ENV_VAR_LIST, ...localVars }
		// 	let condition = element.split("if [[")[1].split("]]; then")[0]
		// 	for (let index = 0; index < Object.keys(allVars).length; index++) {
		// 		condition = condition.replaceAll(Object.keys(allVars)[index], Object.values(allVars)[index])
		// 	}
		// 	console.log("Condition: " + condition);
		// 	if (Function('"use strict";return (' + condition + ')')() == true) {
		// 		// execute inside if
		// 		console.log("Condition passed");
		// 		for (let i = currentLineIndex; i < lines.length; i++) {
		// 			ifs[ifAmount].lines.push(i);
		// 			if (ifs[ifAmount - 1]) {
		// 				ifs[ifAmount - 1].lines.splice(ifs[ifAmount - 1].lines.indexOf(i), 1);
		// 			}
		// 			if (lines[i].startsWith("fi #") && lines[i].split("fi #")[1] == ifAmount) {
		// 				ifs[ifAmount].endingLine = i;
		// 			}
		// 		}
		// 	}
		// 	else {
		// 		// execute else (if present)
		// 	}
		// 	// console.log(allVars);
		// 	ifAmount++;
		// 	continue;
		// }

		// if (!element.startsWith("if [[")) {
		// 	for (let ifIndx = 0; ifIndx < ifs.length; ifIndx++) {
		// 		console.log("Executing...")
		// 		console.log(ifs);
		// 		console.log(ifIndx)
		// 		// for (let lnIndx = 0; lnIndx < ifs[ifIndx].lines.length; lnIndx++) {
		// 		// 	const lineToCheck = ifs[ifIndx].lines[lnIndx];

		// 		if (ifIndx != 0)
		// 			ifs[ifIndx - 1].lines.splice(ifs[ifIndx - 1].lines.indexOf(currentLineIndex), 1);
		// 		// 	if (ifs.length > 1 && ifIndx > 0) {

		// 		// 		if (ifs[ifIndx - 1].lines[lnIndx] == currentLineIndex) {
		// 		if (ifs[ifIndx].lines.includes(currentLineIndex)) {
		// 			console.log("test")
		if (msg) {
			let msgMod = { "content": element, "channel": msg.channel, "guild": msg.guild };
			shellFunctionProcessor(msgMod, localVars);
		}
		else
			shellFunctionProcessor(createFakeMessageObject(element), localVars);
		// 		}
		// 		else {
		// 			console.log("Reject " + currentLineIndex + ", not in array")
		// 		}
		// 		// }
		// 		// 	}
		// 		// 	else
		// 		// 		if (ifs[ifIndx].lines[lnIndx] == currentLineIndex) {
		// 		// 			if (msg) {
		// 		// 				let msgMod = { "content": element, "channel": msg.channel };
		// 		// 				shellFunctionProcessor(msgMod, localVars);
		// 		// 			}
		// 		// 			else
		// 		// 				shellFunctionProcessor(createFakeMessageObject(element), localVars);
		// 		// 		}
		// 		// }
		// 	}
		// 	if (ifs.length == 0) {
		// 		if (msg) {
		// 			let msgMod = { "content": element, "channel": msg.channel };
		// 			shellFunctionProcessor(msgMod, localVars);
		// 		}
		// 		else
		// 			shellFunctionProcessor(createFakeMessageObject(element), localVars);
		// 	}
		// }
		// console.log(ifIndx)
		// console.log(ifs);

		//shellFunctionProcessor()
	}
}

function runAndGetOutput(msg, variableList) {
	shellFunctionProcessor(createFakeMessageObject(msg), variableList);
	return client.commandOutputHistory[0];
}

function exportCommand(contextMsg, variableList) {
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
}

function whoamiCommand(contextMsg) {
	contextMsg.channel.send(ENV_VAR_LIST["$USER"]);
}

let mathChar = [
	"+",
	"-",
	"/",
	"*",
	"%"
]

function parseMath(input, variableList) {
	// console.log(input);
	let i = 0;
	for (let i2 = 0; i2 < input.split("$").length; i2++) {
		if (!input.includes("$"))
			break;
		for (let index = 0; index < mathChar.length; index++) {
			const element = mathChar[index];
			// console.log(i)
			// console.log(input.split("$")[i + 1].replace(/\s/g, '').split(element)[0])

			if (variableList["$" + input.split("$")[i + 1].replace(/\s/g, '').split(element)[0]]) {
				input = input.replace("$" + input.split("$")[i + 1].replace(/\s/g, '').split(element)[0], variableList["$" + input.split("$")[i + 1].replace(/\s/g, '').split(element)[0]]);
				// console.log(variableList["$" + input])
				// console.log(input);
				i++;
			}
			// if (i > 0)
			// 	return;

		}
	}
	// console.log(input);
	// console.log(input.replace(new RegExp(/^(?=.*[0-9])[- */+%()0-9]+$/gm), '='))

	if (new RegExp(/^(?=.*[0-9])[- */+%()0-9]+$/gm).test(input.replace(/\s/g, ''))) {
		// if (new RegExp('^[0-9]+$').test(parseInt(input))) {
		// console.log("ur ok")
		return Function('"use strict";return (' + input + ')')();
	}
	return 0;
}

// tree command
class TreeNode {
	constructor(path) {
		this.path = path;
		this.children = [];
	}
}

function buildTree(pathToRoot) {
	const root = new TreeNode(pathToRoot);

	const stack = [root];

	while (stack.length) {
		const currentNode = stack.pop();

		if (currentNode) {
			const children = fs.readdirSync(currentNode.path);

			for (let child of children) {
				const childPath = `${currentNode.path}/${child}`;
				const childNode = new TreeNode(childPath);
				currentNode.children.push(childNode);

				if (fs.statSync(childNode.path).isDirectory()) {
					stack.push(childNode);
				}
			}
		}
	}
	return root;
}

//apt upgrade
class UpgradedPackage {
	constructor(oldVersion, newVersion, name, url) {
		this.oldVersion = oldVersion;
		this.newVersion = newVersion;
		this.name = name;
		this.url = url;
	}
}

const getFileStructure = () => {
	return ["bin", "etc", "home", "root", "tmp", "usr", "dir.cfg", "root/.config", "tmp/packageCache", "bin/autorun"]
}

console.log("Checking file structure...")
let fileStructureChecksPassed = 0;
for (let index = 0; index < getFileStructure().length; index++) {
	const element = getFileStructure()[index];

	if (fs.existsSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + element)) {
		console.log(index + 1 + " passed out of " + getFileStructure().length);
		fileStructureChecksPassed++;
	}
}
if (fileStructureChecksPassed != getFileStructure().length) {
	console.log("File missing, cannot continue."); process.exit(1);
}

client.login(ENV_VAR_BOT_TOKEN);