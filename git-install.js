const { spawn } = require("child_process");
const isDone = false;

exports.Init = function (args, chan, cli) {
	cli.on("message", (message) => {
		if (message.content.startsWith("$git")) {
			let ls = null;
			//ls = spawn("git", ["-C", "VirtualDrive", args[0], args[1]]);
			args = message.content.substring(message.content.indexOf(" ") + 1).split(" ");
			ls = spawn("git", [args[0], args[1]]);

			ls.stdout.on("data", data => {
				console.log(`${data}`);
				message.channel.send(data.toString());
			});

			ls.stderr.on("data", data => {
				console.log(`${data}`);
				message.channel.send(data.toString());
			});

			ls.on('error', (error) => {
				console.log(`error: ${error.message}`);
			});

			ls.on("close", code => {
				console.log(`child process exited with code ${code}`);
				message.channel.send("Process completed with code " + code + ".");
			});
		}
	});
};