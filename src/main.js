#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const Generate_1 = require("./Generate");
const Normalize_1 = require("./Normalize");
const VideoToFaces_1 = require("./VideoToFaces");
const argv = yargs
    .showHelpOnFail(false, "Specify --help for available options")
    .command("$0", false, x => x, () => console.log("Specify --help for available options"))
    .command("get-faces <video> <outdir>", "Get the faces from a vide using opencv", args => {
    return args.positional("video", {
        describe: "Video to grab faces from",
        type: "string",
    }).positional("outdir", {
        describe: "Directory to output the faces",
        type: "string",
    });
}, arg => VideoToFaces_1.default(arg.video, arg.outdir))
    .command("normalize <dir>", "Normalize the images in a directory to the same size", args => {
    return args.positional("dir", {
        describe: "Directory to normalize",
        type: "string",
    });
}, arg => Normalize_1.default(arg.dir))
    .command("generate <dir> <in> <out>", "Generate a mosaic using the given images", args => {
    return args.positional("dir", {
        describe: "Directory to normalize",
        type: "string",
    }).positional("in", {
        describe: "Input image",
        type: "string",
    }).positional("out", {
        describe: "Output file",
        type: "string",
    });
}, arg => Generate_1.default(arg.dir, arg.in, arg.out))
    .argv;
