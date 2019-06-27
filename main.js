const optionDefinitions = [
    { name: 'link', alias: 'l', type: String, multiple: true, defaultOption: true },
    { name: 'help', alias: 'h', type: Boolean},
    { name: 'path', alias: 'p', type: String }
]


const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);



if (options['help'] == true) {
    console.log("node main.js -p PATH(optional) -l youtube_link(s)");
}

let link = options['link'];

let path = options['path'] || "./video/";

fs.existsSync(path) || fs.mkdirSync(path);

let index = 0;
let size = link.length;

link.forEach(video => {
    ytdl.getInfo(video, (err, info) => {
        if (err) throw err;
        index += 1;
        console.log("downloading " + info['title'] + " as " + info['video_id'] + "!");
        ytdl(video, { quality: 137 }).pipe(fs.createWriteStream(path + info['video_id'] + '_videoonly.mp4')).on("finish", ()=> {
            ytdl(video, { quality: 140 }).pipe(fs.createWriteStream(path + info['video_id'] + '_audioonly.m4a')).on("finish", ()=>{
                ffmpeg()
                    .mergeAdd(path + info['video_id'] + '_videoonly.mp4')
                    .mergeAdd(path + info['video_id'] + '_audioonly.m4a')
                    .on("end", ()=>{
                        fs.unlinkSync(path + info['video_id'] + '_videoonly.mp4');
                        fs.unlinkSync(path + info['video_id'] + '_audioonly.m4a');
                        console.log(index + "/" + size + " complete!");
                    })
                    .save(path + info['video_id'] + '.mp4');
            })
        })
    });
});
