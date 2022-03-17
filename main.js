const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs');
const path = require('path');
const wget = require('wget-improved');
const url = require("url");
let mod = null;
let ENV_VAR_BOOT_COMPLETE = false;
let ENV_VAR_BASE_DIR = process.cwd();
let ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "dir.cfg").toString().split("\n");
let ENV_VAR_BOT_TOKEN = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "token.txt").toString();
let ENV_VAR_APT_PROTECTED_DIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "bin";

client.on('ready', () => {
	console.log("Connected as " + client.user.tag)
	client.user.setActivity("Linux JS Edition testing...");
	process.chdir('VirtualDrive');
	register();
});

function register() {
	client.on("message", (message) => {
		if (message.author.bot) return;
		//console.log("test");
		if (message.content == "$boot" && !ENV_VAR_BOOT_COMPLETE) {
			message.channel.send("`Linux JS Edition / rc1`\n`Login: root (automatic login)`\n\n`Linux JS v0.1.14.5-amd64`");
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				console.log(file);
				try {
					let package = require(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, message.channel, ENV_VAR_BASE_DIR, client);
				} catch (error) {
					message.channel.send("An unexpected error occured while trying to run package: " + file);
				}

			});
			cdCommand({
				content: "$cd root",
				channel: "null"
			})
			ENV_VAR_BOOT_COMPLETE = true;
			return;
		}
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
			message.channel.send("`apt` - `Advanced Packaging Tool, used for managing packages.`\n`ls` - `display files in current directory.`\n`pwd` - `print working directory.`\n`cd` - `change directory.`\n`mkdir` - `make directory`\n`cat` - `read files`\n`wget` - `download files from web`\n`cp` - `copy`\n`rmdir` - `remove directory`\n`rm` - `remove`\n`mv` - `copy`\n`touch` - `create new file`\n`js` - `execute js file from bin directory`\n`upgrade-os` - `upgrade everything and re-download the os`");
			return;
		}
		if (message.content.startsWith("$upgrade-os")) {
			UpgradeOS();
			return;
		}
	});
}

function aptCommand(contextMsg) {
	if (contextMsg.content.split(" ")[1] == "install") {
		let downloadNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		contextMsg.channel.send("Reading config...");
		let branchName = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1];
		contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
		let gitUrlhName = fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config").toString().split("\n")[1].split('=')[1];
		let makeURL = gitUrlhName + branchName + "/" + downloadNameNormalize + "-install.js";
		let downloadDir = ENV_VAR_APT_PROTECTED_DIR;
		contextMsg.channel.send("Get " + makeURL + "...");
		if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
		var parsed = url.parse(makeURL);
		contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
		let download = null
		if (fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config").toString().split("\n")[0].split('=')[1] == "true") {
			download = wget.download(makeURL, downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname));
		}
		else {
			download = wget.download(makeURL, downloadDir + path.sep + path.basename(parsed.pathname));
		}
		download.on('end', function (output) {
			contextMsg.channel.send("Download complete.");
			var pFile = null
			if (fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config").toString().split("\n")[0].split('=')[1] == "true") {
				pFile = downloadDir + path.sep + "autorun" + path.sep + path.basename(parsed.pathname);
				console.log("t1");
			}
			else {
				pFile = downloadDir + path.sep + path.basename(parsed.pathname);
				console.log("t2");
			}
			fs.readFile(pFile, function (err, data) {
				if (err) throw err;
				contextMsg.channel.send("Setting up \"" + downloadNameNormalize + "\"...");
				mod = requireUncached(pFile);
				mod.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
				contextMsg.channel.send("Done");
			});
		});
		download.on('error', function (err) {
			contextMsg.channel.send("No package found with name \"" + downloadNameNormalize + "\".");
		});
	}
	if (contextMsg.content.split(" ")[1] == "remove") {
		let removeNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		let removeDir = null
		if (fs.readFileSync(ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep + "root" + path.sep + ".config").toString().split("\n")[0].split('=')[1] == "true") {
			removeDir = ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun";
		}
		else {
			removeDir = ENV_VAR_APT_PROTECTED_DIR;
		}
		if (!fs.existsSync(removeDir)) fs.mkdirSync(removeDir);
		if (fs.existsSync(removeDir + path.sep + removeNameNormalize + "-install.js")) {
			//delete require.cache[removeDir + path.sep + removeNameNormalize + "-install.js"];
			fs.rmSync(removeDir + path.sep + removeNameNormalize + "-install.js");
			contextMsg.channel.send(removeNameNormalize + " removed successfully.");
			client.removeAllListeners("message");
			register();
			fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
				try {
					let package = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
					package.Init(null, contextMsg.channel, ENV_VAR_BASE_DIR, client);
				} catch (error) {
					contextMsg.channel.send("An unexpected error occured while trying to run package: " + file);
				}
			});
		}
		else {
			contextMsg.channel.send(removeNameNormalize + " not found.");
		}
	}
	if (contextMsg.content.split(" ")[1] == "update") {
		let finished = false;
		const BASEDIR = ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep;
		fs.readdirSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun").forEach(file => {
			console.log(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
			let branchName = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[2].split('=')[1];
			//contextMsg.channel.send("Fetch branch \"" + branchName + "\"...");
			let gitUrlhName = fs.readFileSync(BASEDIR + "root" + path.sep + ".config").toString().split("\n")[1].split('=')[1];
			let makeURL = gitUrlhName + branchName + "/" + file;
			let download = wget.download(makeURL, BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
			download.on('end', function (output) {
				let package = requireUncached(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file));
				let packageOld = requireUncached(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file);
				if (package.Version != packageOld.Version) {
					contextMsg.channel.send("Replace \"" + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file) + "\" (Version " + packageOld.Version + ") with version " + package.Version + ".");
					fs.writeFileSync(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file, fs.readFileSync(BASEDIR + "tmp" + path.sep + "packageCache" + path.sep + path.basename(ENV_VAR_APT_PROTECTED_DIR + path.sep + "autorun" + path.sep + file)));
					contextMsg.channel.send("Done.");
					finished = true;
				}
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
					contextMsg.channel.send("An unexpected error occured while trying to run package: " + file);
				}
			});
		}
	}
}

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

function lsCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
	fs.readdir(process.cwd(), (err, files) => {
		if (!files.length) {
			contextMsg.channel.send("`" + pathWithoutDrive + "` is empty.");
		}
		else {
			contextMsg.channel.send(files.join(', '));
		}
	});
}

function pwdCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive', '');
	if (pathWithoutDrive == "") {
		pathWithoutDrive = "\\";
	}
	contextMsg.channel.send(pathWithoutDrive)
}

function cdCommand(contextMsg) {
	if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
		if (path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") && !path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes(ENV_VAR_APT_PROTECTED_DIR)) {
			const stat = fs.lstatSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
			if (stat.isFile() != true) {
				process.chdir(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
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
}

function mkdirCommand(contextMsg) {
	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("..") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith(path.sep) || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("/")) {
		contextMsg.channel.send("Error: cannot create directory.");
	}
	else {
		if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
			fs.mkdirSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
			contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` created successfully.");
		}
		else {
			contextMsg.channel.send("Error: directory already exists.");
		}
	}
}

function catCommand(contextMsg) {
	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
			const stat = fs.lstatSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
			console.log(stat.size);
			if (stat.isFile() == true) {

				if (stat.size == 0) {
					contextMsg.channel.send("`file is empty`");
				}
				if (stat.size > 50000000) {
					contextMsg.channel.send("Error: file is too big to cat.");
				}
				else {
					let output = '';
					const readStream = fs.createReadStream(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
					readStream.on('data', function (chunk) {
						output += chunk.toString('utf8');
					});
					readStream.on('end', function () {
						var str = output;
						for (let i = 0; i < str.length; i += 2000) {
							const toSend = str.substring(i, Math.min(str.length, i + 2000));
							contextMsg.channel.send("```" + toSend + "```");
						}
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

function wgetCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1) == "$wget") {
			contextMsg.channel.send("Error: link not specified.");
		}
		else {
			if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {

				var parsed = url.parse(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));

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
}

function cpCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.split(" ")[1]).includes("VirtualDrive") || !path.resolve(contextMsg.content.split(" ")[2]).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(contextMsg.content.split(" ")[1])) {
			if (!fs.existsSync(contextMsg.content.split(" ")[2])) {
				fs.copyFile(contextMsg.content.split(" ")[1], contextMsg.content.split(" ")[2], (err) => {
					if (err) throw err;
					contextMsg.channel.send("Done.");
				});
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

function rmdirCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
			if (!fs.lstatSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).isFile()) {

				fs.readdir(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1), (err, files) => {
					if (!files.length) {
						fs.rmdirSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
						contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
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

function rmCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).startsWith("-")) {
			const msgSplit = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).split(" ");
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
			if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
				if (fs.lstatSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).isFile()) {
					fs.rmSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
					contextMsg.channel.send("File `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '') + "` deleted successfully.");
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

function mvCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.split(" ")[1])))) || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.split(" ")[2])))) || !path.resolve(contextMsg.content.split(" ")[1]).includes("VirtualDrive") || !path.resolve(contextMsg.content.split(" ")[2]).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (fs.existsSync(contextMsg.content.split(" ")[1])) {
			if (!fs.existsSync(contextMsg.content.split(" ")[2])) {
				fs.rename(contextMsg.content.split(" ")[1], contextMsg.content.split(" ")[2], (err) => {
					if (err) throw err;
					contextMsg.channel.send("Done.");
				});
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

function touchCommand(contextMsg) {

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)))))) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {
		if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
			fs.closeSync(fs.openSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1), 'w'));
			contextMsg.channel.send("Done.");
		}
		else {
			contextMsg.channel.send("Error: target file already exist.");
		}
	}
}

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

const getAllFiles = function (dirPath, arrayOfFiles) {
	files = fs.readdirSync(dirPath)
	arrayOfFiles = arrayOfFiles || []
	files.forEach(function (file) {
		if (fs.statSync(dirPath + path.sep + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + path.sep + file, arrayOfFiles)
		} else {
			arrayOfFiles.push(path.join(dirPath, path.sep, file))
		}
	})
	return arrayOfFiles
}

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

function UpgradeOS() {
	process.chdir(ENV_VAR_BASE_DIR);
	closeMain();
	require.cache[require.resolve("./index.js")].exports.Upgrade();
}

module.exports.CloseAndUpgrade = function () {
	UpgradeOS();
};

client.login(ENV_VAR_BOT_TOKEN);