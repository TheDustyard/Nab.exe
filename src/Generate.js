"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs = require("fs");
const cv = require("opencv4nodejs");
const path = require("path");
const ProgressBar = require("progress");
function Generate(inDir, inImg, outImg) {
    const smallX = 40;
    const smallY = 40;
    if (!fs.existsSync(inDir)) {
        console.log(chalk_1.default.red(`'${inDir}' does not exist`));
        return;
    }
    if (!fs.existsSync(inImg)) {
        console.log(chalk_1.default.red(`'${inImg}' does not exist`));
        return;
    }
    let input = fs.readdirSync(inDir);
    input = shuffle(input);
    let image = cv.imread(inImg);
    let r = gcd(image.cols, image.rows);
    let xfact = image.cols / r;
    let yfact = image.rows / r;
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
    console.log(chalk_1.default.yellow("Calculating dimentions..."));
    console.table({
        input: {
            size: `${image.cols}x${image.rows}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: image.cols * image.rows
        },
        scaled: {
            size: `${x}x${y}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: x * y
        },
        output: {
            size: `${smallX * x}x${smallY * x}`,
            aspectRatio: `${xfact}:${yfact}`,
            pixels: smallX * x * smallY * y
        }
    });
    image = image.resize(y, x);
    let out = new cv.Mat(smallY * y, smallX * x, image.type);
    let bar = new ProgressBar(chalk_1.default.yellow(":percent :current/:total :etas | :elapseds [:currentFile] (:x, :y)"), x * y);
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
            let [red, green, blue] = image.atRaw(largeImageY, largeImageX);
            let colorOverlay = new cv.Mat(smallImage.rows, smallImage.cols, smallImage.type, [red, green, blue]);
            smallImage = smallImage.addWeighted(0.4, colorOverlay, 0.6, 1);
            for (let smallImageY = 0; smallImageY < smallImage.rows; smallImageY++) {
                for (let smallImageX = 0; smallImageX < smallImage.cols; smallImageX++) {
                    out.set(smallImageY + smallImage.rows * largeImageY, smallImageX + smallImage.cols * largeImageX, smallImage.at(smallImageY, smallImageX));
                }
            }
            cv.imshow("out", out.resize(1000, 1000));
            cv.waitKey(1);
            counter++;
        }
    }
    let d = new Date(Date.now());
    cv.imwrite(outImg, out);
    console.log(chalk_1.default.green(`\nDONE...\nOutput: ${outImg}`));
}
exports.default = Generate;
function gcd(a, b) {
    return (b === 0) ? a : gcd(b, a % b);
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
