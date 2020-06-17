"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs = require("fs");
const cv = require("opencv4nodejs");
const path = require("path");
const ProgressBar = require("progress");
function VideoToFaces(inFile, outDir) {
    if (!fs.existsSync(inFile)) {
        console.error(chalk_1.default.red(`Input file '${inFile} does not exist`));
        return;
    }
    if (fs.existsSync(outDir)) {
        if (fs.readdirSync(outDir).length > 0) {
            console.log(chalk_1.default.red("Output directory is not empty"));
            return;
        }
        else {
            console.log(chalk_1.default.yellow(`Writing to output directory "${outDir}"`));
        }
    }
    else {
        fs.mkdirSync(outDir);
        console.log(chalk_1.default.yellow(`Created output directory "${outDir}"`));
    }
    const cap = new cv.VideoCapture(inFile);
    const totalFrames = cap.get(cv.CAP_PROP_FRAME_COUNT);
    let currentFrame = 0;
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
    const PURPLE = new cv.Vec3(203, 66, 244);
    const bar = new ProgressBar(chalk_1.default.yellow(":percent :current/:total frames  :etas | :elapseds"), {
        total: totalFrames,
    });
    setInterval(() => bar.update(currentFrame / totalFrames), 100);
    (async function render() {
        try {
            currentFrame += 1;
            let img = await cap.readAsync();
            let outImg = img.copy();
            const grayImg = await img.bgrToGrayAsync();
            const { objects, levelWeights } = await classifier.detectMultiScaleWithRejectLevelsAsync(grayImg);
            for (let i in objects) {
                let obj = objects[i];
                let region = outImg.getRegion(obj);
                await cv.imwriteAsync(path.join(outDir, `${currentFrame}-${i}.png`), region);
            }
            if (currentFrame === totalFrames) {
                console.log(chalk_1.default.green(`Done.`));
                process.exit();
            }
        }
        finally {
            setTimeout(render, 0);
        }
    })();
}
exports.default = VideoToFaces;
