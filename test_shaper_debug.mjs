
import { reshapeArabic } from './src/utils/arabic-shaper.js';

const input = "فندق النهدي";
console.log("Input:", input);
console.log("Input Codes:", input.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' '));

const output = reshapeArabic(input);
console.log("Output:", output);
console.log("Output Codes:", output.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' '));

// Check if we have connected forms
// Aleph (0627) should be FE8D (Iso) or FE8E (Final)
// Lam (0644) should be FEDF (Init), FEE0 (Med), FEDD (Iso), FEDE (Final)
// In "Al-Nahdi" (النهدي):
// Alif (Iso) -> FE8D
// Lam (Init to Nun) -> FEDF ?
// N (Med between L and H) -> FEE8 ?
