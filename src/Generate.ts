import chalk from "chalk";
import * as fs from "fs";
import * as cv from "opencv4nodejs";
import * as path from "path";
import * as ProgressBar from "progress";

export default function Generate(inDir: string, inImg: string, outImg: string) {
    const smallX = 40;
    const smallY = 40;

    if (!fs.existsSync(inDir)) {
        console.log(chalk.red(`'${inDir}' does not exist`));
        return;
    }

    if (!fs.existsSync(inImg)) {
        console.log(chalk.red(`'${inImg}' does not exist`));
        return;
    }

    let input = fs.readdirSync(inDir);
    // input.sort((a, b) => {
    //     let amatch = a.match(/([0-9]*)-([0-9])\.png$/);
    //     let bmatch = b.match(/([0-9]*)-([0-9])\.png$/);
    //     let aval = (parseInt(amatch[1]) * 10) + parseInt(amatch[2]);
    //     let bval = (parseInt(bmatch[1]) * 10) + parseInt(bmatch[2]);

    //     return aval - bval;
    // });

    input = shuffle(input);

    let image = cv.imread(inImg);

    let r = gcd(image.cols, image.rows);
    let xfact = image.cols / r;
    let yfact = image.rows / r;

    // calculate size
    let x = 0;
    let y = 0;
    let prex = 0;
    let prey = 0;
    while (x * y < input.length) {
        prex = x;
        prey = y;

        x += xfact;
        y += yfact;
    }
    x = prex;
    y = prey;

    console.log(chalk.yellow("Calculating dimentions..."));

    console.table({
        input: {
            size: `${image.cols}x${image.rows}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: image.cols * image.rows
        },
        scaled: {
            size: `${x}x${y}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: x *  y
        },
        output: {
            size: `${smallX * x}x${smallY * x}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: smallX * x * smallY * y
        }
    });

    // let sample = cv.imread(path.join(inDir, input[0]));

    image = image.resize(y, x);

    let out = new cv.Mat(smallY * y, smallX * x, image.type);

    let bar = new ProgressBar(chalk.yellow(":percent :current/:total :etas | :elapseds [:currentFile] (:x, :y)"), x * y);

    let counter = 0;
    for (let largeImageY = 0; largeImageY < y; largeImageY++) {
        for (let largeImageX = 0; largeImageX < x; largeImageX++) {
            bar.tick({
                currentFile: input[counter],
                x: largeImageX,
                y: largeImageY
            });
            bar.render();

            let smallImage = cv.imread(path.join(inDir, input[counter])).resize(smallY, smallX);

            // tslint:disable-next-line:no-any
            let [red, green, blue]: [number, number, number]  = image.atRaw(largeImageY, largeImageX) as any;
            let colorOverlay = new cv.Mat(smallImage.rows, smallImage.cols, smallImage.type, [red, green, blue]);

            smallImage = smallImage.addWeighted(0.4, colorOverlay, 0.6, 1);

            // smallImage.drawRectangle(new cv.Rect(0, 0, smallImage.cols, smallImage.rows), new cv.Vec3(blue, green, red), -1);

            for (let smallImageY = 0; smallImageY < smallImage.rows; smallImageY++) {
                for (let smallImageX = 0; smallImageX < smallImage.cols; smallImageX++) {
                    out.set(smallImageY + smallImage.rows * largeImageY,
                            smallImageX + smallImage.cols * largeImageX,
                            smallImage.at(smallImageY, smallImageX));
                }
            }

            // cv.imshow("current frame", smallImage);
            cv.imshow("out", out.resize(1000, 1000));

            cv.waitKey(1);
            counter ++;
        }
    }

    let d = new Date(Date.now());

    // cv.imshowWait("image", out);
    cv.imwrite(outImg, out);

    console.log(chalk.green(`\nDONE...\nOutput: ${outImg}`));
}

function gcd(a: number, b: number): number {
    return (b === 0) ? a : gcd(b, a % b);
}

/**
 * Shuffles array in place. ES6 version
 */
function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}