const Discord = require('discord.js')
const client = new Discord.Client()
var setTitle = require('console-title');
bot_secret_token = "ODk2NDEzMzY3MDQyOTczNzc3.YWGwAQ.zYnqSgClyJshTraJ9ZRxxPTuT_k";
const fs = require('fs')
let mod = null;
let ENV_VAR_BOOT_COMPLETE = false;
let ENV_VAR_BASE_DIR = process.cwd();
let ENV_VAR_DISABLED_FOLDERS = fs.readFileSync(ENV_VAR_BASE_DIR + "\\VirtualDrive\\dir.cfg").toString().split("\n");;
console.log(ENV_VAR_DISABLED_FOLDERS);
client.on('ready', () => {
	setTitle(client.user.username + " control");
	console.log("Connected as " + client.user.tag)
	client.user.setActivity("Linux JS Edition testing...");
	process.chdir('VirtualDrive');
	/*
	setInterval(() => {
		if (process.cwd().startsWith("D:\\") || process.cwd().startsWith("F:\\") || process.cwd().startsWith("C:\\")) {
			process.chdir('E:\\LinuxJSEdition\\VirtualDrive');
		}
		if (!process.cwd().includes("VirtualDrive")) {
			process.chdir('E:\\LinuxJSEdition\\VirtualDrive');
		}
	}, 500)
	*/

});

client.on("message", (message) => {
	if (message.author.bot) return;

	if (message.content == "$boot" && !ENV_VAR_BOOT_COMPLETE) {
		message.channel.send("Linux JS Edition/ rc1\nLogin: root (automatic login)\n\nLinux JS v0.1.14.5-amd64");
		ENV_VAR_BOOT_COMPLETE = true;
		return;
	}

	if (!ENV_VAR_BOOT_COMPLETE) return;

	if (message.content.startsWith("$apt install")) {
		aptCommand(message);
		return;
	}
	/*
	if (fs.existsSync(process.cwd() + "\\" + message.content.split("$")[1].split(" ")[0] + "-install.js")) {
		eval(message.content.split("$")[1].split(" ")[0] + "Command(message)");
		return;
	}
	*/
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
});

function aptCommand(contextMsg) {

	var pFile = ENV_VAR_BASE_DIR + "\\" + contextMsg.content.split(" ")[2] + '.js';
	if (fs.existsSync(pFile)) {
		contextMsg.channel.send("**[**Konsola**]** Pobieranie pakietu...");

		fs.readFile(pFile, function (err, data) {
			if (err) throw err;
			if (data.includes('token')) {
				contextMsg.channel.send("**[**Konsola**]** Pakiet próbuje wykorzystać prywatne części kodu. Instalacja zatrzymana.");
				return;
			}
			else {
				mod = require(pFile);
				mod.Init(null, contextMsg, client);
				contextMsg.channel.send("**[**Konsola**]** Zainstalowano pakiet.");
			}
		});
	} else {
		// file does not exist
		contextMsg.channel.send("**[**Konsola**]** Nie znaleziono pakietu o takiej nazwie.");
	}
}

// Old function for using git
function gitCommand(contextMsg) {
	var pFile = ENV_VAR_BASE_DIR + '/git-install.js';
	var git = require(pFile);
	git.Init(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).split(" "), contextMsg);
}

function lsCommand(contextMsg) {
	/*
	var pFile = 'E:/LinuxJSEdition/ls-install.js';
	var git = require(pFile);
	git.Init(contextMsg);
	*/
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
const path = require('path');
function cdCommand(contextMsg) {
	if (fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
		/*
		if (path.basename(path.resolve(process.cwd())).toString() == 'VirtualDrive') {
			
			if (!contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes(".")) {
				if (!contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("\\")) {
					if (!contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1).includes("/")) {
						process.chdir(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
					}
					else {
						contextMsg.channel.send("Error: cannot `cd` into this directory.");
					}
				}
				else {
					contextMsg.channel.send("Error: cannot `cd` into this directory.");
				}

			}
			else {
				contextMsg.channel.send("Error: cannot `cd` into this directory.");
			}
			
		}
		else {
			process.chdir(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1));
		}
		*/
		if (path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive")) {
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
	const wget = require('wget-improved');
	if (!path.resolve(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1)).includes("VirtualDrive")) {
		contextMsg.channel.send("Error: cannot access this path.");
	}
	else {

		if (contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1) == "$wget") {
			contextMsg.channel.send("Error: link not specified.");
		}
		else {
			if (!fs.existsSync(contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1))) {
				var url = require("url");
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
client.login(bot_secret_token);