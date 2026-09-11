import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../server/seedQuestionsData.js');

let content = fs.readFileSync(targetPath, 'utf8');

const domainPrefixes = [
  { prefix: 'dsa_', domainNum: 1 },
  { prefix: 'react_', domainNum: 2 },
  { prefix: 'sec_', domainNum: 3 },
  { prefix: 'py_', domainNum: 4 },
  { prefix: 'devops_', domainNum: 5 },
];

for (const { prefix, domainNum } of domainPrefixes) {
  const regex = new RegExp(`id: '${prefix}s\\d+_(\\d+)'`, 'g');
  content = content.replace(regex, (match, slotStr) => {
    const slotNum = parseInt(slotStr, 10);
    const padded = String(slotNum).padStart(12, '0');
    return `id: '0000000${domainNum}-0000-4000-8000-${padded}'`;
  });
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated seedQuestionsData.js with standard RFC4122 UUIDs.');
