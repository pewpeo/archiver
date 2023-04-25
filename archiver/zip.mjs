#!/usr/bin/env node

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

// remove node executable and mjs filename
const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Please provide file argument(s).')
    process.exit(1);
}

//
// check if files exit
//

try {
    args.forEach((filepath) => {
        // const stats = fs.statSync(filepath);
        const stats = fs.lstatSync(filepath);
        if (!stats.isFile() && !stats.isDirectory()) {
            throw new Error(`Error: ${filepath} is not a file or directory.`);
        }
    });
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

//
// determine location and filename
//

// multiple files: take directory of first file
// one file: take direcotry of file
// directory: take direcoty of direcory
// --> location = dirname(arg[0])
// --> filename = location + file-/directory name

let workDir = path.dirname(args[0]);
let filename = '';
if (args.length > 1 || args[0] === '.' || args[0] === '..') {
    // use the directory name of the first argument
    filename = path.basename(workDir);
} else {
    // use the filename of the first and only argument
    filename = path.basename(args[0], path.extname(args[0]));
}

filename += '.zip';

console.log(`Zipping to '${filename}':`)
console.log(args);

// change to working directory and make filepaths relative
// to have a relative structure in the zip file
console.log(`Working directory: ${workDir}`)
process.chdir(workDir);
filename = path.basename(filename)
let filelist = args.map(elem => path.basename(elem));

// create argument array
let zipArgs = ['-r', filename]
zipArgs = zipArgs.concat(filelist);
zipArgs = zipArgs.concat(['-x', '*.DS_Store']);

// spawn child process
console.log('[Spawn] zip', zipArgs)

// escape spaces with '\' just for console output
// const zipArgsStr = zipArgs.map(elem => elem.replace(/(\s+)/g, '\\$1'));
// console.log('[Call] zip ' + zipArgsStr.join(' '));

const zip = spawn('zip', zipArgs);

zip.stdout.on('data', (data) => {
    process.stdout.write(data);
});

zip.stderr.on('data', (data) => {
    process.stderr.write(data);
});

zip.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
