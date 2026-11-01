// Fails CI unless the smoke run put a filled card on screen and its timer fired while hidden.
const fs = require('fs');

const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { dom = {}, stats = {} } = report;
const problems = [];
if (!dom.word) problems.push('word is empty');
if (!dom.translation) problems.push('translation is empty');
if (!(dom.className || '').includes('visible')) problems.push('card is not visible');
if (!(dom.className || '').includes('revealed')) problems.push('translation was not revealed');
if (dom.version !== `v${report.version}`) problems.push(`version under the tick: ${dom.version}`);
if (!(stats.active >= 1)) problems.push('active set is empty');
if (report.cardsShown < 2) problems.push(`second card never came: ${report.cardsShown}`);
const minLearned = Number(process.argv[3] || 0);
if (!(stats.learned >= minLearned)) problems.push(`progress lost: learned ${stats.learned}, expected ${minLearned}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('smoke ok');
