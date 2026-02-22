const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const findPdfs = (dir, callback) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        try {
            if (fs.statSync(fullPath).isDirectory()) {
                findPdfs(fullPath, callback);
            } else if (fullPath.toLowerCase().endsWith('.pdf')) {
                const name = path.basename(fullPath).toLowerCase();
                if (name.includes('meteorologie') && (name.includes('modul') || name.includes('ordnung')) && !name.includes('msc') && !name.includes('master')) {
                    callback(fullPath);
                }
            }
        } catch (e) { }
    });
};

const searchDirs = [
    path.join(require('os').homedir(), 'Desktop'),
    path.join(require('os').homedir(), 'Documents'),
    path.join(require('os').homedir(), 'Downloads')
];

const found = [];
searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) findPdfs(dir, p => found.push(p));
});

console.log("Found: ", found);

(async () => {
    for (const p of found) {
        try {
            let dataBuffer = fs.readFileSync(p);
            let data = await pdf(dataBuffer);
            let outName = path.basename(p, '.pdf') + '.txt';
            fs.writeFileSync(outName, data.text.substring(0, 100000), 'utf-8'); // Save first 100K chars
            console.log("Extracted to: " + outName);
        } catch (e) {
            console.error("Error on " + p, e.message);
        }
    }
})();
