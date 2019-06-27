const optionDefinitions = [
    { name: 'link', alias: 'l', type: String, multiple: true, defaultOption: true },
    { name: 'help', alias: 'h', type: Boolean},
    { name: 'path', alias: 'p', type: String }
]


const fs = require('fs');
const ytdl = require('ytdl-core');

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

if (options['help'] == true) {
    console.log("node main.js -p PATH(optional) -l youtube_link(s)");
}


console.log(process.argv);

let link = options['link'];

let path = options['path'] || "./video/";


let index = 0;
let size = link.length;

link.forEach(video => {
    ytdl.getInfo(video, (err, info) => {
        if (err) throw err;
        index += 1;
        console.log("downloading " + info['title'] + "!");
        ytdl(video, { quality: 'highest',  filter: (format) => format.container === 'mp4' }).pipe(fs.createWriteStream(path + info['title'] + '.mp4'));
        console.log(index + "/" + size +" complete!");
    });
});