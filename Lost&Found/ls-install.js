const { spawn } = require("child_process");
const isDone = false;

exports.Init = function (chan) {	
	const fs = require('fs');
	var pathWithoutDrive = process.cwd().replace('E:\\LinuxJSEdition\\VirtualDrive', '');
	fs.readdir(process.cwd(), (err, files) => {
		if (!files.length) {
           chan.channel.send("`" + pathWithoutDrive + "` is empty.");
		}
		else
		{
			chan.channel.send(files.join(', '));
		}
	});
};