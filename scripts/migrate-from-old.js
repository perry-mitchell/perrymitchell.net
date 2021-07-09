const path = require("path");
const fs = require("fs");
const frontMatter = require("front-matter");
const YAML = require("yaml");
const removeMarkdown = require("remove-markdown");

const POSTS_INPUT = "/Users/perry/temp/website/perrymitchell.net/posts";
const POSTS_OUTPUT = "/Users/perry/git/perrymitchell.net/src/posts";

async function run() {

    const inputResults = fs
        .readdirSync(POSTS_INPUT, {
            withFileTypes: true
        })
        .map(dirent => ({
            filename: path.resolve(POSTS_INPUT, dirent.name),
            type: dirent.isFile() ? "file" : "directory"
        }))
        .filter(item => item.type === "file");

    for (const sourceItem of inputResults) {
        const md = fs.readFileSync(sourceItem.filename, "utf8");
        const {
            attributes,
            body
        } = frontMatter(`---\n${md}`);
        const {
            title,
            tags = [],
            date: dateRaw
        } = attributes;
        const postDate = new Date(dateRaw);
        const [dateSlug] = postDate.toISOString().split("T");
        const fileNameBase = path.basename(sourceItem.filename).replace(".md", "");
        console.log("Processing:", fileNameBase);

        const bodyText = removeMarkdown(body);
        const excerpt = `${bodyText.trim().substring(0, 150)}...`;

        const newPostName = `${dateSlug}-${fileNameBase}`;
        const newPostDir = path.join(POSTS_OUTPUT, newPostName);
        fs.mkdirSync(newPostDir, { recursive: true });

        const newFrontMatter = {
            layout: "post",
            title,
            excerpt,
            slug: fileNameBase,
            permalink: `article/${fileNameBase}/index.html`,
            date: dateSlug,
            updatedDate: dateSlug,
            tags: ["post", ...(tags || [])]
        };

        fs.writeFileSync(
            path.join(newPostDir, "index.md"),
            `---\n${YAML.stringify(newFrontMatter).trim()}\n---\n\n${body}`
        );

        // Copy images
        const imageDir = path.join(POSTS_INPUT, fileNameBase);
        try {
            fs.statSync(imageDir);
        } catch (err) {
            continue;
        }

        const images = fs.readdirSync(imageDir);
        for (const image of images) {
            const sourcePath = path.join(imageDir, image);
            const destPath = path.join(newPostDir, image);
            fs.copyFileSync(sourcePath, destPath);
        }
    }

}

run().catch(err => {
    console.error(err);
});
