import fs from 'fs';
import https from 'https';
import path from 'path';

const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf';
const outputPath = path.join('src', 'assets', 'Tajawal-Regular.js');

console.log('Fetching Tajawal font...');

https.get(fontUrl, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed to download font:', res.statusCode);
        return;
    }

    const data = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const jsContent = `export const tajawalFont = '${base64}';`;

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, jsContent);
        console.log('Font saved to', outputPath);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
