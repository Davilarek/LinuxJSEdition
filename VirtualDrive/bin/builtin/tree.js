const fs = require("fs");
const path = require("path");

exports.Init = function (args, chan, basePath, cli) {
    const ENV_VAR_LIST = cli.listEnv;
    const ENV_VAR_PREFIX = cli.prefix;
    const ENV_VAR_BASE_DIR = basePath;
    cli.registerCommand("tree", (contextMsg, variableList) => {
        return new Promise((resolve) => {
            // let pathWithoutDrive = process.cwd().replace(ENV_VAR_BASE_DIR + path.sep + 'VirtualDrive' + path.sep, '');
            // pathWithoutDrive = cli.coolTools.replaceAll(pathWithoutDrive, "\\", "/");

            let pathCorrected = contextMsg.content.substring(contextMsg.content.indexOf(" ") + 1);

            if (pathCorrected == ENV_VAR_PREFIX + "tree")
                pathCorrected = process.cwd();

            // console.log(pathCorrected);

            const localVarList = { ...ENV_VAR_LIST, ...variableList };

            for (let i = 0; i < Object.keys(localVarList).length; i++) {
                pathCorrected = cli.coolTools.replaceAll(pathCorrected, Object.keys(localVarList)[i], localVarList[Object.keys(localVarList)[i]]);
            }

            if (pathCorrected.startsWith("/")) {
                pathCorrected = pathCorrected.replace("/", ENV_VAR_BASE_DIR + path.sep + "VirtualDrive" + path.sep);
            }
            if (fs.existsSync(pathCorrected)) {
                if (!path.resolve(pathCorrected).includes("VirtualDrive")) {
                    // if (!path.resolve(pathCorrected).includes("VirtualDrive") || pathCorrected.includes("VirtualDrive") || ENV_VAR_DISABLED_FOLDERS.includes((path.basename(path.resolve(pathCorrected))))) {
                    contextMsg.channel.send("Error: cannot access this path.");
                    resolve(126);
                }
                else {
                    // console.log((new Array(level + 1)).join(" "))

                    // console.log(getDirectoriesInDirectories(pathCorrected));

                    const str = readTree(buildTree(cli.coolTools.replaceAll(pathCorrected, "\\", "/")), 0) + '\n' + getAllDirectories(pathCorrected).length + " directories, " + getAllFiles(pathCorrected).length + ' files';
                    // var str = readTree(buildTree(replaceAll(pathCorrected, "\\", "/")), 0) + '\n' + DirectoryTools.ThroughDirectory(pathCorrected, [], [])[1].length + " directories, " + DirectoryTools.ThroughDirectory(pathCorrected, [], [])[0].length + ' files';
                    for (let i = 0; i < str.length; i += 1800) {
                        const toSend = str.substring(i, Math.min(str.length, i + 1800));
                        contextMsg.channel.send("```\n" + toSend + "\n```");
                    }
                    resolve(0);
                    // contextMsg.channel.send("```\n" +  + "\n```", { split: true });
                }
            }
            else {
                contextMsg.channel.send("Error: directory doesn't exist.");
                resolve(1);
            }
        });
    }, "displays the folder and file structure of a path");
};

// tree command
class TreeNode {
    constructor(mainPath) {
        this.path = mainPath;
        this.children = [];
    }
}

function buildTree(pathToRoot) {
    const root = new TreeNode(pathToRoot);

    const stack = [root];

    while (stack.length) {
        const currentNode = stack.pop();

        if (currentNode) {
            const children = fs.readdirSync(currentNode.path);

            for (const child of children) {
                const childPath = `${currentNode.path}/${child}`;
                const childNode = new TreeNode(childPath);
                currentNode.children.push(childNode);

                if (fs.statSync(childNode.path).isDirectory()) {
                    stack.push(childNode);
                }
            }
        }
    }
    return root;
}

function readTree(tree, level) {
    let final = "";
    // console.log(tree.children);
    // console.log(tree.path);
    // console.log(tree.path.split("/").length)
    if (tree.path.split("/").length == 1 || tree.path.split("/")[tree.path.split("/").length - 1] == "")
        final += (new Array(level)).join("─") + "/:" + "\n";
    else if (tree.path)
        final += (new Array(level + 1)).join(" ") + "└─" + (new Array(level + 1)).join("─") + tree.path.split("/")[tree.path.split("/").length - 1] + "\n";
    if (tree.children)
        for (let index = 0; index < tree.children.length; index++) {
            const element = tree.children[index];
            // console.log(element.path.split("/")[element.path.split("/").length - 1])
            // final += (new Array(level + 1)).join("-") + element.path.split("/")[element.path.split("/").length - 1]
            if (element.children) {
                // final +=  readTree(element.children, level + 1) + "\n";
                // console.log(element.children)
                if (!element.children)
                    final += readTree(element, level + 1) + "\n";
                else
                    final += readTree(element, level + 1);
            }
        }
    return final;
}

const getDirectories = source =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

function getDirectoriesInDirectories(source) {
    const directories = [];
    getDirectories(source).forEach(function (dir) {
        directories.push(path.join(source, dir));
        const subdirectories = getDirectoriesInDirectories(path.join(source, dir));
        if (subdirectories.length > 0) {
            directories.push(subdirectories);
        }

        // directories.push(getDirectoriesInDirectories(source + path.sep + dir));
    });
    return directories;
}

function flatten(items) {
    const flat = [];

    items.forEach(item => {
        if (Array.isArray(item)) {
            flat.push(...flatten(item));
        }
        else {
            flat.push(item);
        }
    });

    return flat;
}

function getAllDirectories(source) {
    return flatten(getDirectoriesInDirectories(source));
}

/**
 * Get all the files in a directory and its subdirectories
 * @param dirPath - The path to the directory you want to search.
 * @param arrayOfFiles - An array of files to be returned.
 * @returns An array of all the files in the directory.
 */
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + path.sep + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + path.sep + file, arrayOfFiles);
        }
        else {
            arrayOfFiles.push(path.join(dirPath, path.sep, file));
        }
    });
    return arrayOfFiles;
}