// Script to generate logo base64
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const logoBuffer = fs.readFileSync(logoPath);
const base64 = logoBuffer.toString('base64');

const output = `export const ENAKO_LOGO_BASE64 = 'data:image/png;base64,${base64}';\n`;

const outPath = path.join(__dirname, '..', 'src', 'lib', 'logo-base64.ts');
fs.writeFileSync(outPath, output);
console.log('Generated logo-base64.ts successfully');
