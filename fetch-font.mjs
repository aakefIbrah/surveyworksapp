import fs from 'fs';
// import fetch from 'node-fetch';

const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/Rubik-Regular.ttf';
const outputPath = './src/assets/Rubik-Regular.js';
const variableName = 'rubikFont';

console.log(`Fetching font from ${fontUrl}...`);

fetch(fontUrl)
    .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
        return res.arrayBuffer();
    })
    .then(buffer => {
        const base64Format = Buffer.from(buffer).toString('base64');
        const jsContent = `export const ${variableName} = '${base64Format}';`;

        fs.writeFileSync(outputPath, jsContent);
        console.log(`Font saved to ${outputPath}`);
    })
    .catch(err => console.error(err));
