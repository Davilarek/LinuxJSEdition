# LinuxJSEdition
## Linux in Discord... is not a dream anymore!

LinuxJSEdition is a Discord bot that simulates Linux environment.

## Features

- Basic commands, like pwd, cd, ls, cp, etc
- Files aren't deleted after restart
- You can install packages that can expand features
- You can use git inside Discord
- You can download files with wget

Custom packages can be submitted to the apt repository so everyone can install them. Here is the [apt-repo].

## Credits

LinuxJSEdition uses a number of open source projects to work properly:

- [wget-improved] - wget command
- [discord.js] - bot

## Installation

LinuxJSEdition requires [Node.js](https://nodejs.org/) v14+ to run.

##### Step 1.
Download the repository, uzip, create new text file called token.txt and paste your bot token inside.
##### Step 2.
Install the dependencies and start the application.

```sh
cd LinuxJSEdition
npm i
node main
```

##### Step 3.
Add it to your server, go to a channel that bot has access to, type "$boot" to start the entire thing.
Every command has prefix $.
Examples:

$ls
$cd bin
$cat dir.cfg
$apt install git

## Development
Please report any bugs and security holes, when you find any.
## License

MIT

   [apt-repo]: <https://github.com/Davilarek/apt-repo>
   [wget-improved]: <https://github.com/bearjaws/node-wget>
   [discord.js]: <https://github.com/discordjs/discord.js/>
   [console-title]: <https://github.com/daguej/node-console-title>
   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [node.js]: <http://nodejs.org>
