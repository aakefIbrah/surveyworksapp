/**
 * Simple Arabic Reshaper & BiDi support for jsPDF
 * Maps standard Arabic characters to their Presentation Forms B
 * and handles basic RTL reversal.
 * 
 * IMPROVEMENTS:
 * - Strips Tashkeel (Diacritics) to prevent disjointed text in jsPDF.
 * - Handles Lam-Alif Ligatures.
 */

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;

// Basic Forms: [Isolated, Final, Initial, Medial]
const FORMS = {
    '\u0622': ['\uFE81', '\uFE82', '\uFE81', '\uFE82'], // alif_madda
    '\u0623': ['\uFE83', '\uFE84', '\uFE83', '\uFE84'], // alif_hamza
    '\u0624': ['\uFE85', '\uFE86', '\uFE85', '\uFE86'], // waw_hamza
    '\u0625': ['\uFE87', '\uFE88', '\uFE87', '\uFE88'], // alif_hamza_below
    '\u0626': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'], // ya_hamza
    '\u0627': ['\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E'], // alif
    '\u0628': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'], // ba
    '\u0629': ['\uFE93', '\uFE94', '\uFE93', '\uFE94'], // ta_marbuta
    '\u062A': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'], // ta
    '\u062B': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'], // tha
    '\u062C': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'], // jim
    '\u062D': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'], // ha
    '\u062E': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'], // kha
    '\u062F': ['\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA'], // dal
    '\u0630': ['\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC'], // dhal
    '\u0631': ['\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE'], // ra
    '\u0632': ['\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0'], // zai
    '\u0633': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'], // sin
    '\u0634': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'], // shin
    '\u0635': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'], // sad
    '\u0636': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'], // dad
    '\u0637': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'], // tah
    '\u0638': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'], // zah
    '\u0639': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'], // ain
    '\u063A': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'], // ghain
    '\u0641': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'], // fa
    '\u0642': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'], // qaf
    '\u0643': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'], // kaf
    '\u0644': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'], // lam
    '\u0645': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'], // mim
    '\u0646': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'], // nun
    '\u0647': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'], // ha
    '\u0648': ['\uFEED', '\uFEEE', '\uFEED', '\uFEEE'], // waw
    '\u0649': ['\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0'], // alif_maksura
    '\u064A': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'], // ya
    // Extra map for broken/special chars might be needed
};

// Lam-Alif Ligatures (Isolated, Final)
const LAM_ALIF = {
    '\u0622': ['\uFEF5', '\uFEF6'], // Lam-Alif Madda
    '\u0623': ['\uFEF7', '\uFEF8'], // Lam-Alif Hamza
    '\u0625': ['\uFEF9', '\uFEFA'], // Lam-Alif Hamza Below
    '\u0627': ['\uFEFB', '\uFEFC'], // Lam-Alif
};

// Characters that connect to the right (previous) but not left (next)
const NON_CONNECTING_NEXT = new Set(['\u0622', '\u0623', '\u0624', '\u0625', '\u0627', '\u062F', '\u0630', '\u0631', '\u0632', '\u0648', '\u0649', '\uFE8D']);

function isArabic(char) {
    if (!char) return false;
    return ARABIC_REGEX.test(char);
}

function getForm(char, prev, next) {
    if (!FORMS[char]) return char;

    const prevConnects = prev && isArabic(prev) && !NON_CONNECTING_NEXT.has(prev);
    const nextConnects = next && isArabic(next);

    if (prevConnects && nextConnects) {
        return FORMS[char][3]; // Medial
    } else if (prevConnects) {
        return FORMS[char][1]; // Final
    } else if (nextConnects) {
        return FORMS[char][2]; // Initial
    } else {
        return FORMS[char][0]; // Isolated
    }
}

export const reshapeArabic = (str) => {
    if (!str) return '';

    // 1. Strip Tashkeel (Diacritics) and Normalize to NFC
    let cleanStr = str.normalize('NFC').replace(TASHKEEL_REGEX, '');

    // Check if string contains ANY Arabic characters before processing
    let hasArabic = false;
    for (let i = 0; i < cleanStr.length; i++) {
        if (isArabic(cleanStr[i])) {
            hasArabic = true;
            break;
        }
    }

    if (!hasArabic) return str; // Return original (with tashkeel if any, though likely not)

    // 2. Map to Presentation Forms with Ligature Handling
    let reshaped = [];
    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr[i];
        let next = i < cleanStr.length - 1 ? cleanStr[i + 1] : null;
        let prev = i > 0 ? cleanStr[i - 1] : null;

        // Handle Lam-Alif Ligature
        if (char === '\u0644' && next && LAM_ALIF[next]) {
            const ligature = LAM_ALIF[next];
            const prevConnects = prev && isArabic(prev) && !NON_CONNECTING_NEXT.has(prev);

            if (prevConnects) {
                reshaped.push(ligature[1]); // Final
            } else {
                reshaped.push(ligature[0]); // Isolated
            }
            i++; // Skip the Alif
            continue;
        }

        if (isArabic(char)) {
            reshaped.push(getForm(char, prev, next));
        } else {
            reshaped.push(char);
        }
    }

    // 3. Reverse for RTL (Manual handling for jsPDF LTR mode)
    return reshaped.reverse().join('');
};
