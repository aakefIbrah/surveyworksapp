import { reshapeArabic } from './src/utils/arabic-shaper.js';

const text = "سجل العمل";
console.log("Original:", text);
const shaped = reshapeArabic(text);
console.log("Shaped:", shaped);
console.log("Hex Codes:");
for (let i = 0; i < shaped.length; i++) {
    console.log(shaped.charCodeAt(i).toString(16));
}
