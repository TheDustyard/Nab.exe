import chalk from "chalk";
import * as fs from "fs";
import * as cv from "opencv4nodejs";
import * as path from "path";
import * as ProgressBar from "progress";

export default function Normalize(directory: string) {
    interface IStatistic {
        name: string;
        width: number;
        height: number;
        ratio: number;
    }
    let stats: IStatistic[] = [];

    if (!fs.existsSync(directory)) {
        console.log(chalk.red(`'${directory}' does not exist`));
        return;
    }

    let input = fs.readdirSync(directory);

    console.log(chalk.green("Gathering images"));

    let bar = new ProgressBar(chalk.yellow(":percent :current/:total :etas | :elapseds [:currentFile]"), input.length);

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

    console.log(chalk.green("Normalizing images"));

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

    console.log(chalk.green("Done."));
}