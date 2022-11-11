exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_UNAME_STRING = cli.machineInfo;
    cli.registerCommand("uname", (contextMsg) => {
        return new Promise((resolve) => {
            if (!contextMsg.content.split(" ")[1]) {
                contextMsg.channel.send("LinuxJSEdition");
                return;
            }
            if (contextMsg.content.split(" ")[1].startsWith("-")) {
                // contextMsg.channel.send("LinuxJSEdition");
                const option = contextMsg.content.split(" ")[1].replace("-", "");
                // console.log(option);
                let output = "";
                switch (option) {
                    case "-all":
                    case "a":
                        output = cli.coolTools.replaceAll(Object.values(ENV_VAR_UNAME_STRING).join(" "), " unknown", "");
                        break;
                    case "-kernel-name":
                    case "s":
                        output = ENV_VAR_UNAME_STRING.KERNEL_NAME;
                        break;
                    case "-nodename":
                    case "n":
                        output = ENV_VAR_UNAME_STRING.NODENAME;
                        break;
                    case "-kernel-release":
                    case "r":
                        output = ENV_VAR_UNAME_STRING.KERNEL_RELEASE;
                        break;
                    case "-kernel-version":
                    case "v":
                        output = ENV_VAR_UNAME_STRING.KERNEL_VERSION;
                        break;
                    case "-machine":
                    case "m":
                        output = ENV_VAR_UNAME_STRING.MACHINE;
                        break;
                    case "-processor":
                    case "p":
                        output = ENV_VAR_UNAME_STRING.PROCESSOR;
                        break;
                    case "-hardware-platform":
                    case "i":
                        output = ENV_VAR_UNAME_STRING.HARDWARE_PLATFORM;
                        break;
                    case "-operating-system":
                    case "o":
                        output = ENV_VAR_UNAME_STRING.PLATFORM;
                        break;
                    case "-help":
                        // i spent too much time on this
                        // but in the end it still looks ugly
                        output = "Usage: uname [option]\n\n" +
                            "When no option is specified, the output is the same as the -s option.\n\n" +
                            "Options:\n" +
                            " -a, --all					Displays all options in this order, excluding -p and -i if unknown.\n" +
                            " -s, --kernel-name			Displays kernel name\n" +
                            " -n, --nodename 			Displays system network name\n" +
                            " -r, --kernel-release		Displays kernel release number\n" +
                            " -v, --kernel-version		Displays kernel version\n" +
                            " -m, --machine				Displays architecture name\n" +
                            " -p, --processor 			Displays processor type (non-portable)\n" +
                            " -i, --hardware-platform	Displays hardware platform (non-portable)\n" +
                            " -o, --operating-system 	Displays operating system name\n" +
                            " --help				 	Displays this help and exit";
                        break;
                    default:
                        return;
                    // break;
                }
                contextMsg.channel.send("```\n" + output + "\n```");
                resolve(0);
                return;
            }
        });
    }, `prints certain system information. use "' + ENV_VAR_PREFIX + 'uname --help" for more help.`);
};