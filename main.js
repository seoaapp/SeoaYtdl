const optionDefinitions = [
    { name: 'link', alias: 'l', type: String, multiple: true, defaultOption: true },
    { name: 'help', alias: 'h', type: Boolean},
    { name: 'path', alias: 'p', type: String }
] 


const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);


const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);



if (options['help'] == true) {
    console.log("node main.js -p PATH(optional) -l youtube_link(s)");
}

let link = options['link']; // array of links

let path = options['path'] || "./video/"; // optional

fs.existsSync(path) || fs.mkdirSync(path);

let index = 0;
let size = link.length;

link.forEach(video => { // video link forEach
    ytdl.getInfo(video, (err, info) => { // getting info Map
        if (err) throw err;
        index += 1;
        console.log("downloading " + info['title'] + " as " + info['video_id'] + "!");
        ytdl(video, { quality: 137 }).pipe(fs.createWriteStream(path + info['video_id'] + '_videoonly.mp4')).on("finish", ()=> { // download video only file. when it's finished
            ytdl(video, { quality: 140 }).pipe(fs.createWriteStream(path + info['video_id'] + '_audioonly.m4a')).on("finish", ()=>{ // download audio only file
                ffmpeg() // then use ffmpeg
                    .mergeAdd(path + info['video_id'] + '_videoonly.mp4')
                    .mergeAdd(path + info['video_id'] + '_audioonly.m4a') // wrap video to audio
                    .on("end", ()=>{
                        fs.unlinkSync(path + info['video_id'] + '_videoonly.mp4'); // delete video only file
                        fs.unlinkSync(path + info['video_id'] + '_audioonly.m4a'); // delete audio only file
                        console.log(index + "/" + size + " complete!");
                    })
                    .save(path + info['video_id'] + '.mp4'); // finally save
            })
        })
    });
});
