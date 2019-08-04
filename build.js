const path = require("path");
const fs = require("fs");
const pug = require("pug");
const pify = require("pify");
const mkdirp = pify(require("mkdirp"));

const writeFile = pify(fs.writeFile);

const MANIFEST = {
    "/": "index.pug",
    "/cv": "cv.pug"
};

async function execute() {
    for (const pathKey of Object.keys(MANIFEST)) {
        const inputFile = path.join(__dirname, "./source", MANIFEST[pathKey]);
        const outputFile = path.join(__dirname, "./dist", pathKey, "./index.html");
        console.log(`Rendering path: ${pathKey} (${inputFile})`);
        await mkdirp(path.join(__dirname, "./dist", pathKey));
        await executePugRender(
            inputFile,
            outputFile
        );
    }
}

async function executePugRender(inputFile, outputFile) {
    const pugRender = pug.compileFile(inputFile);
    await writeFile(outputFile, pugRender({}));
}

(async function() {
    try {
        await execute();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
