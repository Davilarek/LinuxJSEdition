/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const path = require('path');
const wget = require('wget-improved');
const url = require("url");
let mod = null;
let ENV_VAR_BOOT_COMPLETE = false;
const ENV_VAR_BASE_DIR = process.cwd();
const ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
const ENV_VAR_LIST = {
	"$HOME": "/root",
	"~": "/root"
}
const ENV_VAR_BOT_TOKEN = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "token.txt").toString();
const ENV_VAR_APT_PROTECTED_DIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "bin";
const ENV_VAR_CONFIG_FILE = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config";
const ENV_VAR_NULL_CHANNEL = {
	/** 
	 * @param {string} content
	*/
	send: function (content) {
		content = null;
	}
};
let ENV_VAR_VERSION = 0;
getVersion().then(v => {
	ENV_VAR_VERSION = v;
});

client.on('ready', () => {
	console.log("Connected as " + client.user.tag)
	client.user.setActivity("Linux JS Edition testing...");
	process.chdir('VirtualDrive');
	register();

	getHash();
});

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
		packages.push(tree[i].path.replace("-install.js", ""));
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
	client.on("message", (message) => {
		if (message.author.bot) return;
		//console.log("test");

		/* This code is the first thing that runs when the bot starts. It is used to load all of the packages that are in the autorun folder. */
		if (message.content == "$boot" && !ENV_VAR_BOOT_COMPLETE) {
			message.channel.send("`Linux JS Edition / rc1`\n`Login: root (automatic login)`\n\n`Linux JS v0.1." + ENV_VAR_VERSION + "-amd64`");
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				console.log(file);
				if (file == "empty.txt") { return; }
				try {
					let package = require(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, message.channel, ENV_VAR_BASE_DIR, client);
				} catch (error) {
					message.channel.send("An unexpected error occured while trying to run package: " + file);
				}

			});
			cdCommand({
				content: "$cd $HOME",
				channel: ENV_VAR_NULL_CHANNEL
			})
			ENV_VAR_BOOT_COMPLETE = true;
			return;
		}

		// bot isn't booted, go back
		if (!ENV_VAR_BOOT_COMPLETE) return;

		if (message.content.startsWith("$apt install")) {
			aptCommand(message);
			return;
		}
		if (message.content.startsWith("$apt remove")) {
			aptCommand(message);
			return;
		}
		if (message.content.startsWith("$apt update")) {
			aptCommand(message);
			return;
		}
		if (message.content.startsWith("$apt list-all")) {
			aptCommand(message);
			return;
		}
		if (message.content.startsWith("$apt help")) {
			aptCommand(message);
			return;
		}
		if (message.content.startsWith("$ls")) {
			lsCommand(message);
			return;
		}
		if (message.content.startsWith("$pwd")) {
			pwdCommand(message);
			return;
		}
		if (message.content.startsWith("$cd")) {
			cdCommand(message);
			return;
		}
		if (message.content.startsWith("$mkdir")) {
			mkdirCommand(message);
			return;
		}
		if (message.content.startsWith("$cat")) {
			catCommand(message);
			return;
		}
		if (message.content.startsWith("$wget")) {
			wgetCommand(message);
			return;
		}
		if (message.content.startsWith("$cp")) {
			cpCommand(message);
			return;
		}
		if (message.content.startsWith("$rmdir")) {
			rmdirCommand(message);
			return;
		}
		if (message.content.startsWith("$rm")) {
			rmCommand(message);
			return;
		}
		if (message.content.startsWith("$mv")) {
			mvCommand(message);
			return;
		}
		if (message.content.startsWith("$touch")) {
			touchCommand(message);
			return;
		}
		if (message.content.startsWith("$js")) {
			jsCommand(message);
			return;
		}
		if (message.content.startsWith("$cmdlist")) {
			message.channel.send("`apt` - `Advanced Packaging Tool, used for managing packages. Use 'apt help' for sub-commands.`\n`ls` - `display files in current directory.`\n`pwd` - `print working directory.`\n`cd` - `change directory.`\n`mkdir` - `make directory`\n`cat` - `read files`\n`wget` - `download files from web`\n`cp` - `copy file`\n`rmdir` - `remove directory`\n`rm` - `remove file`\n`mv` - `move file`\n`touch` - `create new file`\n`js` - `execute js file from bin directory`\n`upgrade-os` - `upgrade everything and re-download the os`\n`reboot` - `reboots os`");
			return;
		}
		if (message.content.startsWith("$upgrade-os")) {
			UpgradeOS();
			return;
		}
		if (message.content.startsWith("$reboot")) {
			RebootOS();
			return;
		}
		if (message.content.startsWith("$echo")) {
			echoCommand(message);
			return;
		}
	});
}

/**
 * This function is used to install, remove or update packages.
 * @param contextMsg - The message that triggered the command.
 */
function aptCommand(contextMsg) {

	/* This code is responsible for installing a package. */
	if (contextMsg.content.split(" ")[1] == "install") {
		if (contextMsg.content.split(" ")[2] == undefined) { return; }
		let start = new Date().getTime();
		let updatedCount = 0;
		let downloadNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		contextMsg.channel.send("Reading config...");
		let branchName = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[2].split('=')[1];
		contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
		let gitUrlhName = fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[1].split('=')[1];
		let makeURL = gitUrlhName + branchName + "/" + downloadNameNormalize + "-install.js";
		let downloadDir = ENV_VAR_APT_PROTECTED_DIR;
		contextMsg.channel.send("Get " + makeURL + "...");
		if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
		var parsed = url.parse(makeURL);
		contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
		let download = null
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
				mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
				updatedCount += 1;
				contextMsg.channel.send("Done").then(v => {
					var end = new Date().getTime();
					var time = end - start;
					contextMsg.channel.send(updatedCount + " package(s) were updated in " + time + "ms.");
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
		let start = new Date().getTime();
		let updatedCount = 0;
		let removeNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		let removeDir = null
		if (fs.readFileSync(ENV_VAR_CONFIG_FILE).toString().split("\n")[0].split('=')[1] == "true") {
			removeDir = ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun";
		}
		else {
			removeDir = ENV_VAR_APT_PROTECTED_DIR;
		}
		if (!fs.existsSync(removeDir)) fs.mkdirSync(removeDir);
		if (fs.existsSync(removeDir + path.sep + removeNameNormalize + "-install.js")) {
			//delete require.cache[removeDir + path.sep + removeNameNormalize + "-install.js"];
			fs.rmSync(removeDir + path.sep + removeNameNormalize + "-install.js");

			client.removeAllListeners("message");
			register();
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				if (file == "empty.txt") { return; }
				try {
					let package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
				} catch (error) {
					contextMsg.channel.send("An unexpected error occured while trying to run package: " + file);
				}
			});
			updatedCount += 1;
			contextMsg.channel.send(removeNameNormalize + " removed successfully.").then(v => {
				var end = new Date().getTime();
				var time = end - start;
				contextMsg.channel.send(updatedCount + " package(s) were updated in " + time + "ms.");
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
		let gitUrlhName = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[1].split('=')[1];
		let start = new Date().getTime();
		fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
			if (file == "empty.txt") { return; }
			console.log(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
			let makeURL = gitUrlhName + branchName + "/" + file;
			let download = wget.download(makeURL, BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
			contextMsg.channel.send("Checking " + file.replace("-install.js", "") + "...");
			download.on('end', function (output) {
				let package = requireUncached(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
				let packageOld = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
				if (package.Version != packageOld.Version) {
					contextMsg.channel.send("Replace \"" + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file) + "\" (Version " + packageOld.Version + ") with version " + package.Version + ".");
					fs.writeFileSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file, fs.readFileSync(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)));
					contextMsg.channel.send("Done.");
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
					package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
				} catch (error) {
					//contextMsg.channel.send("An unexpected error occured while trying to run package: " + file);
				}
			});
		}
		contextMsg.channel.send("Done").then(v => {
			var end = new Date().getTime();
			var time = end - start;
			contextMsg.channel.send(updatedCount + " package(s) were updated in " + time + "ms.");
		});
	}


	/* Send message with all packages in the repository. */
	if (contextMsg.content.split(" ")[1] == "list-all") {
		contextMsg.channel.send("Collecting data from repository...").then(v => {
			getAllRepoPackages().then(v => {
				contextMsg.channel.send(v.join("\n"));
				contextMsg.channel.send("Done.");
			});
		})
	}


	if (contextMsg.content.split(" ")[1] == "help") {
		contextMsg.channel.send("`install <package name>` - `install package by name`\n`remove <package name>` - `remove package by name`\n`update` - `replace all outdated packages with newer ones`\n`list-all` - `list all packages in repository.`");
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

/**
 * It lists the files in the current directory.
 * @param contextMsg - The message that triggered the command.
 */
function lsCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
	pathWithoutDrive = replaceAll(pathWithoutDrive, "\\", "/");
	fs.readdir(process.cwd(), (err, files) => {
		if (!files.length) {
			contextMsg.channel.send("`" + pathWithoutDrive + "` is empty.");
		}
		else {
			contextMsg.channel.send(files.join(', '));
		}
	});
}

/**
 * It returns the current working directory.
 * @param contextMsg - The message that triggered the command.
 */
function pwdCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive', '/');
	pathWithoutDrive = replaceAll(pathWithoutDrive, "\\", "/");
	// if (pathWithoutDrive == "") {
	// 	pathWithoutDrive = "\\";
	// }
	contextMsg.channel.send(pathWithoutDrive)
}

/**
 * Change the current working directory to the given path
 * @param contextMsg - The message that triggered the command.
 */
function cdCommand(contextMsg) {
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
	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		//console.log(i);
		//console.log(ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
		//console.log(Object.keys(ENV_VAR_LIST)[i]);

		// it doesn't look good
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
function mkdirCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$mkdir") { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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

	if (!path.resolve(pathCorrected).includes("VirtualDrive") || path.basename(pathCorrected) == "VirtualDrive" || pathCorrected.endsWith("..") || pathCorrected.endsWith(path.sep) || pathCorrected.endsWith("/")) {
		contextMsg.channel.send("Error: cannot create directory.");
	}
	else {
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
function catCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$cat") { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
			console.log(stat.size);
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
function cpCommand(contextMsg) {
	let pathCorrected = contextMsg.content.split(" ")[1];
	let pathCorrected2 = contextMsg.content.split(" ")[2];

	if (pathCorrected == undefined) { return; }
	if (pathCorrected2 == undefined) { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
		pathCorrected2 = replaceAll(pathCorrected2, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
function rmdirCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$rmdir") { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
function rmCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$rm") { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
function mvCommand(contextMsg) {
	let pathCorrected = contextMsg.content.split(" ")[1];
	let pathCorrected2 = contextMsg.content.split(" ")[2];

	if (pathCorrected == undefined) { return; }
	if (pathCorrected2 == undefined) { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
		pathCorrected2 = replaceAll(pathCorrected2, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
function touchCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

	if (pathCorrected == "$touch") { return; }

	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
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
		mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
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
function RebootOS() {
	process.chdir(ENV_VAR_BASE_DIR);
	closeMain();
	require.cache[require.resolve("./index.js")].exports.Reboot();
}

function echoCommand(contextMsg) {
	let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);
	if (pathCorrected == "$echo") { return; }
	for (let i = 0; i < Object.keys(ENV_VAR_LIST).length; i++) {
		pathCorrected = replaceAll(pathCorrected, Object.keys(ENV_VAR_LIST)[i], ENV_VAR_LIST[Object.keys(ENV_VAR_LIST)[i]]);
	}

	contextMsg.channel.send(pathCorrected);
}

module.exports.CloseAndUpgrade = function () {
	UpgradeOS();
};

client.login(ENV_VAR_BOT_TOKEN);