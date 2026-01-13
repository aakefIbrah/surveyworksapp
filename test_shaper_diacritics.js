import { reshapeArabic } from './src/utils/arabic-shaper.js';

// Fa (0641) + Damma (064F) + Nun (0646)
const inputWithTashkeel = "\u0641\u064F\u0646";
const output = reshapeArabic(inputWithTashkeel);

console.log('Input Hex:', inputWithTashkeel.split('').map(c => c.charCodeAt(0).toString(16)));
console.log('Output Hex:', output.split('').map(c => c.charCodeAt(0).toString(16)));
