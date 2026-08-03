const fs = require('fs');
const path = './node_modules/drizzle-kit/bin.cjs';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/checkValue = \(checkValue \|\| \\\)\.replace/, 'checkValue = checkValue.replace');
code = code.replace(/checkValue = checkValue\.replace/, 'checkValue = (checkValue || "").replace');
fs.writeFileSync(path, code);
console.log('Patched');
