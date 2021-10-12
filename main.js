const Discord = require('discord.js')
const client = new Discord.Client()
var setTitle = require('console-title');
const fs = require('fs');
const path = require('path');
const wget = require('wget-improved');
const url = require("url");
let mod = null;
let ENV_VAR_BOOT_COMPLETE = false;
let ENV_VAR_BASE_DIR = process.cwd();
let ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + "\\VirtualDrive\\dir.cfg").toString().split("\n");;
let ENV_VAR_BOT_TOKEN = fs.readFileSync(ENV_VAR_BASE_DIR + "\\token.txt").toString();
let ENV_VAR_ALL_PACKAGES = null;
let ENV_VAR_APT_PROTECTED_DIR = ENV_VAR_BASE_DIR + "\\VirtualDrive\\tmp\\cache";
client.on('ready', () => {
	setTitle("Linux JS Host");
	console.log("Connected as " + client.user.tag)
	client.user.setActivity("Linux JS Edition testing...");
	process.chdir('VirtualDrive');
});

client.on("message", (message) => {
	if (message.author.bot) return;
	if (message.content == "$boot" && !ENV_VAR_BOOT_COMPLETE) {
		message.channel.send("`Linux JS Edition / rc1`\n`Login: root (automatic login)`\n\n`Linux JS v0.1.14.5-amd64`");
		fs.readdirSync(ENV_VAR_BASE_DIR + "\\VirtualDrive\\tmp\\cache").forEach(file => {
			console.log(file);
			let package = require(ENV_VAR_BASE_DIR + "\\VirtualDrive\\tmp\\cache\\" + file);
			package.Init(null, message, client);
		});
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
});
function aptCommand(contextMsg) {
	if (contextMsg.content.split(" ")[1] == "install") {
		let downloadNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		let makeURL = "https://raw.githubusercontent.com/Davilarek/apt-repo/main/" + downloadNameNormalize + "-install.js";
		let downloadDir = ENV_VAR_APT_PROTECTED_DIR;
		contextMsg.channel.send("Get " + makeURL + "...");
		if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
		var parsed = url.parse(makeURL);
		contextMsg.channel.send("Downloading `" + path.basename(parsed.pathname) + "`...");
		let download = wget.download(makeURL, downloadDir + "\\" + path.basename(parsed.pathname));
		download.on('end', function (output) {
			contextMsg.channel.send("Download complete.");
			var pFile = downloadDir + "\\" + path.basename(parsed.pathname);
			fs.readFile(pFile, function (err, data) {
				if (err) throw err;
				mod = require(pFile);
				mod.Init(null, contextMsg, client);
				contextMsg.channel.send("Setting up \"" + downloadNameNormalize + "\"...");
				contextMsg.channel.send("Done");
			});
		});
		download.on('error', function (err) {
			contextMsg.channel.send("No package found with name \"" + downloadNameNormalize + "\".");
		});
	}
	if (contextMsg.content.split(" ")[1] == "remove") {
		let removeNameNormalize = contextMsg.content.split(" ")[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
		let removeDir = ENV_VAR_APT_PROTECTED_DIR;
		if (!fs.existsSync(removeDir)) fs.mkdirSync(removeDir);
		if (fs.existsSync(removeDir + "\\" + removeNameNormalize + "-install.js")) {
			fs.rmSync(removeDir + "\\" + removeNameNormalize + "-install.js");
			contextMsg.channel.send(removeNameNormalize + " removed successfully.");
		}
		else {
			contextMsg.channel.send(removeNameNormalize + " not found.");
		}
	}
}

function lsCommand(contextMsg) {
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '');
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
	var pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + '\\VirtualDrive', '');
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
	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("..") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("\\") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).endsWith("/")) {
		contextMsg.channel.send("Error: cannot create directory.");
	}
	else {
		if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
			fs.mkdirSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
			contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` created successfully.");
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
							contextMsg.channel.send(toSend);
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

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive")) {
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
						contextMsg.channel.send("Directory `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` deleted successfully.");
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
									contextMsg.channel.send("Directory `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` deleted successfully.");
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
					contextMsg.channel.send("File `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` deleted successfully.");
				}
				if (msgSplit[0] == "-rf" || msgSplit[0] == "-fr" || msgSplit[0] == "-r") {
					/*
					if (fs.existsSync(msgSplit[1]) && !fs.lstatSync(msgSplit[1]).isFile()) {
						contextMsg.channel.send("Error: given path is an directory.");
						return;
					}
					*/
					fs.rmSync(msgSplit[1], { recursive: true, force: true });
					contextMsg.channel.send("File(s) `" + path.resolve(msgSplit[1]).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` deleted successfully.");
				}
			}
		}
		else {
			if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
				if (fs.lstatSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).isFile()) {
					fs.rmSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
					contextMsg.channel.send("File `" + path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).replace(ENV_VAR_BASE_DIR + '\\VirtualDrive\\', '') + "` deleted successfully.");
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

	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("VirtualDrive") || contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("dir.cfg") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.split(" ")[1])))) || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(contextMsg.content.split(" ")[2]))))) {
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
client.login(ENV_VAR_BOT_TOKEN);