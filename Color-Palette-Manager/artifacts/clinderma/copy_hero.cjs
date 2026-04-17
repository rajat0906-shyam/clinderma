const fs = require('fs');

const src = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\a89248df-b3cc-4588-9b10-46d565290c69\\clinderma_hero_image_1776374421378.png';
const dest = 'c:\\Users\\lenovo\\Downloads\\clinderma\\Color-Palette-Manager\\artifacts\\clinderma\\public\\hero.png';

fs.copyFileSync(src, dest);
console.log('Copied hero image successfully!');
