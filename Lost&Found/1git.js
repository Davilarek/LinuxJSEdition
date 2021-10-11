const fs = require('fs');
const https = require('https');
// URL of the image
const url2 = 'https://github.com/isomorphic-git/isomorphic-git/archive/main.zip';
const options = {
    // see options below
};



const wget = require('wget-improved');
exports.Init = async function () {
	/*https.get(url,(res) => {
		const path = "git.zip"; 
		const filePath = fs.createWriteStream(path);
		res.pipe(filePath);
		filePath.on('finish',() => {
			filePath.close();
			console.log('Download Completed'); 
		})
	})*/
	//ok();
	await Download();
	console.log("Done.");
};
async function ok()
{
	
}
function Download()
{
	return new Promise((resolve, reject) => {
        let download = wget.download(url2, `git.zip`, options);
		download.on('end', function(output) {
			resolve();
		});   
    });
}