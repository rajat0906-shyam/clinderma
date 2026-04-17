const fs = require('fs');
const path = require('path');

const datasetDir = __dirname;

function organizeImages() {
    const entries = fs.readdirSync(datasetDir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const currentDirPath = path.join(datasetDir, entry.name);
            const subEntries = fs.readdirSync(currentDirPath, { withFileTypes: true });

            for (const subEntry of subEntries) {
                if (subEntry.isFile() && /\.(png|jpg|jpeg)$/i.test(subEntry.name)) {
                    let nameNoExt = path.parse(subEntry.name).name;
                    // Regex removes trailing digits/underscores (e.g. acne29_1 -> acne)
                    let className = nameNoExt.replace(/[\d_]+$/, '').replace(/^_+|_+$/g, '').toLowerCase();

                    if (!className) className = 'unknown';

                    const targetDir = path.join(datasetDir, className);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir);
                    }

                    const srcPath = path.join(currentDirPath, subEntry.name);
                    const dstPath = path.join(targetDir, subEntry.name);

                    console.log(`Moving ${subEntry.name} -> ${className}/`);
                    fs.renameSync(srcPath, dstPath);
                }
            }
        } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
            // Root level files
            let nameNoExt = path.parse(entry.name).name;
            let className = nameNoExt.replace(/[\d_]+$/, '').replace(/^_+|_+$/g, '').toLowerCase();

            if (!className) className = 'unknown';

            const targetDir = path.join(datasetDir, className);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir);
            }

            const srcPath = path.join(datasetDir, entry.name);
            const dstPath = path.join(targetDir, entry.name);

            console.log(`Moving ${entry.name} -> ${className}/`);
            fs.renameSync(srcPath, dstPath);
        }
    }
}

organizeImages();
console.log("Done organizing.");
