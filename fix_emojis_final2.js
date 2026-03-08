const fs = require('fs');
const path = require('path');

function replaceLinePart(filename, replacements) {
  const filePath = path.join(__dirname, 'public', filename);
  let lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  
  for (const r of replacements) {
    const idx = r.line - 1;
    if (lines[idx]) {
       lines[idx] = lines[idx].replace(r.search, r.replace);
    }
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log('Fixed natively', filename);
}

replaceLinePart('login.html', [
  {line: 70, search: /âš™ï¸ /, replace: '⚙️'},
  {line: 116, search: /âš ï¸ /, replace: '⚠️'}
]);

replaceLinePart('admin.html', [
  {line: 13, search: /âš™ï¸ /, replace: '⚙️'}
]);

replaceLinePart('index.html', [
  {line: 210, search: /âš ï¸ /, replace: '⚠️'}
]);

replaceLinePart('company.html', [
  {line: 66, search: /âš ï¸ /, replace: '⚠️'}
]);
