// Fails CI unless the smoke run really put a filled, painted card on screen.
const fs = require('fs');

const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const problems = [];
if (!report.dom.word) problems.push('word is empty');
if (!report.dom.translation) problems.push('translation is empty');
if (!report.dom.className.includes('visible')) problems.push('card is not visible');
if (!report.dom.className.includes('revealed')) problems.push('translation was not revealed');
if (report.stats.active < 1) problems.push('active set is empty');
if (report.distinctColors < 20) problems.push(`card looks blank: ${report.distinctColors} colors`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('smoke ok');
