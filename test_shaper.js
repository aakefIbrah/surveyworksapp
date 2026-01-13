import { reshapeArabic } from './src/utils/arabic-shaper.js';

const input = "فندق";
const output = reshapeArabic(input);

console.log('Input:', input);
console.log('Output:', output);
console.log('Hex codes:');
for (let i = 0; i < output.length; i++) {
    console.log(output.charCodeAt(i).toString(16).toUpperCase());
}
