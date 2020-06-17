import chalk from "chalk";
import * as fs from "fs";
import * as cv from "opencv4nodejs";
import * as path from "path";
import * as ProgressBar from "progress";

export default function VideoToFaces(inFile: string, outDir: string) {
    if(!fs.existsSync(inFile)) {
        console.error(chalk.red(`Input file '${inFile} does not exist`));
        return;
    }

    if (fs.existsSync(outDir)) {
        if (fs.readdirSync(outDir).length > 0) {
            console.log(chalk.red("Output directory is not empty"));
            return;
        } else {
            console.log(chalk.yellow(`Writing to output directory "${outDir}"`));
        }
    } else {
        fs.mkdirSync(outDir);
        console.log(chalk.yellow(`Created output directory "${outDir}"`));
    }

    const cap = new cv.VideoCapture(inFile);

    // tslint:disable-next-line:no-any
    const totalFrames: number = cap.get(cv.CAP_PROP_FRAME_COUNT) as any;
    let currentFrame = 0;

    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

    const PURPLE = new cv.Vec3(203, 66, 244);

    const bar = new ProgressBar(chalk.yellow(":percent :current/:total frames  :etas | :elapseds"), {
        total: totalFrames,
        // complete: "-",
        // head: "}",
        // incomplete: " ",
        // width: 15
    });

    setInterval(() => bar.update(currentFrame/totalFrames), 100);

    (async function render() {
        try {
            currentFrame += 1;

            let img = await cap.readAsync();
            let outImg = img.copy();

            const grayImg = await img.bgrToGrayAsync();

            const { objects, levelWeights } = await classifier.detectMultiScaleWithRejectLevelsAsync(grayImg);

            for (let i in objects) {
                let obj = objects[i];
                // let weight = levelWeights[i];

                // let color = new cv.Vec3(255 - weight * 3, 255, 255 - weight * 3);

                let region = outImg.getRegion(obj);
                await cv.imwriteAsync(path.join(outDir, `${currentFrame}-${i}.png`), region);

                // img.drawRectangle(obj, color, 2, 2);
                // img.putText(`${Math.round(weight * 100) / 100}`, new cv.Point2(obj.x, obj.y - 5), 0, 1, PURPLE, 2, 2);
            }

            // cv.imshow("Raw video feed", img);
            // cv.waitKey(10);

            // bar.tick();

            if (currentFrame === totalFrames) {
                console.log(chalk.green(`Done.`));
                process.exit();
            }
        } finally {
            setTimeout(render, 0);
        }
    })();
}