"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs = require("fs");
const cv = require("opencv4nodejs");
const path = require("path");
const ProgressBar = require("progress");
function Normalize(directory) {
    let stats = [];
    if (!fs.existsSync(directory)) {
        console.log(chalk_1.default.red(`'${directory}' does not exist`));
        return;
    }
    let input = fs.readdirSync(directory);
    console.log(chalk_1.default.green("Gathering images"));
    let bar = new ProgressBar(chalk_1.default.yellow(":percent :current/:total :etas | :elapseds [:currentFile]"), input.length);
    for (let item of input) {
        bar.tick({
            currentFile: item
        });
        bar.render();
        let img = cv.imread(path.join(directory, item));
        stats.push({
            name: item,
            width: img.cols,
            height: img.rows,
            ratio: img.cols / img.rows
        });
    }
    let width = stats.map(x => x.width).sort((a, b) => a - b).slice(-1)[0];
    let height = stats.map(x => x.height).sort((a, b) => a - b).slice(-1)[0];
    console.log(chalk_1.default.green("Normalizing images"));
    bar.update(0);
    for (let item of input) {
        bar.tick({
            currentFile: item
        });
        bar.render();
        let img = cv.imread(path.join(directory, item));
        img = img.resize(width, height);
        cv.imwrite(path.join(directory, item), img);
    }
    console.log(chalk_1.default.green("Done."));
}
exports.default = Normalize;
