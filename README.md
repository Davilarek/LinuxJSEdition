![linuxjs_02](https://user-images.githubusercontent.com/62715937/186477476-951a905c-328b-465c-994b-5c06a3ec6465.png)
# LinuxJSEdition  [[Video link](https://www.youtube.com/watch?v=sEWgsxxMXjs)] ![GitHub repo size](https://img.shields.io/github/repo-size/Davilarek/LinuxJSEdition)
## Linux in Discord... is not a dream anymore!


LinuxJSEdition is a Discord bot that simulates Linux environment.

## TODO
- Fix more security holes
- Remove wget-improved because why use this when http and https are built in -- done
- Port more commands
- Port more *sh features

## Features

- Basic commands, like pwd, cd, ls, cp, etc
- Files aren't deleted after restart
- You can install packages that can expand features
- You can use git inside Discord
- You can download files with wget

Custom packages can be submitted to the apt repository so everyone can install them. Here is the [apt-repo].

## Credits

LinuxJSEdition uses a number of open source projects to work properly:

- [discord.js] - bot
- Creator of Tux image in logo: `lewing@isc.tamu.edu and The GIMP`

## Installation

LinuxJSEdition requires [Node.js](https://nodejs.org/) v14+ to run.

##### Step 1.
Download the repository (or clone), unzip, create new text file called "token.txt" and paste your bot token inside.
##### Step 2.
Install the dependencies and start the application.

```sh
cd LinuxJSEdition
npm i
```
And then...
```
node .
```
Or if you are on Windows...
```
quick-launch.bat
```
##### Step 3.
Add it to your server, go to a channel that bot has access to, type "$boot" to start the entire thing.
Every command has prefix default $ (prefix.txt).
Use $cmdlist to show list of commands (without external commands).
Examples:

$ls

$cd bin

$cat dir.cfg

$apt install git


Please note that these commands doesn't support all SH features like loops or pipe.
## Development
Please report any bugs and security holes, when you find any.

## Tips
- If something doesn't work - try $reboot :)
- Try out $apt list-all!
- If youre looking for an text editor - download text-edit package!
- You can find configuration file in /root/.config.
- You can change prefix using prefix.txt in bot directory

## License

MIT

   [apt-repo]: <https://github.com/Davilarek/apt-repo>
   [wget-improved]: <https://github.com/bearjaws/node-wget>
   [discord.js]: <https://github.com/discordjs/discord.js/>
   [console-title]: <https://github.com/daguej/node-console-title>
   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [node.js]: <http://nodejs.org>
   [bent]: <https://github.com/mikeal/bent>
