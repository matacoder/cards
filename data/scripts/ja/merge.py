"""Writes dicts/ja.json and adds Japanese translations to the other dictionaries.

Reads the translation results in sources/ja/work/. Usage: python merge.py   (from the repo root)
"""
import json
from pathlib import Path

WORK = Path('data/sources/ja/work')
DICTS = Path('data/dicts')
SIZE = 3000
# How each dictionary file is formatted, to keep the diffs small.
INDENT = {'es': 0, 'en': 1, 'ru': 0}


def jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def build_japanese():
    ranks = {e['lemma']: i for i, e in enumerate(json.loads((WORK / 'lemma_list.json').read_text()))}
    results = [row for n in (1, 2, 3) for row in jsonl(WORK / f'out_ja_{n}.jsonl')]
    kept = sorted((r for r in results if not r.get('drop')), key=lambda r: ranks[r['lemma']])
    entries = []
    for rank, row in enumerate(kept[:SIZE], 1):
        lemma = row['lemma']
        word = f"{lemma}（{row['reading']}）" if row.get('reading') else lemma
        entries.append({'rank': rank, 'lemma': lemma, 'word': word, 'say': lemma, 'pos': row['pos'], 'tr': row['tr']})
    print('kept', len(kept), 'dropped', len(results) - len(kept), 'written', len(entries))
    (DICTS / 'ja.json').write_text(json.dumps(entries, ensure_ascii=False, indent=1))


def add_japanese(lang):
    path = DICTS / f'{lang}.json'
    raw = path.read_text()
    data = json.loads(raw)
    translations = {row['lemma']: row['ja'] for n in (1, 2) for row in jsonl(WORK / f'out_{lang}_{n}.jsonl')}
    missing = [e['lemma'] for e in data if not translations.get(e['lemma'])]
    if missing:
        raise SystemExit(f'{lang}: no translation for {missing[:20]}')
    for entry in data:
        entry['tr']['ja'] = translations[entry['lemma']]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=INDENT[lang]) + ('\n' if raw.endswith('\n') else ''))


def main():
    build_japanese()
    for lang in INDENT:
        add_japanese(lang)


if __name__ == '__main__':
    main()
