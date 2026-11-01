"""Top Japanese lemmas with kana readings. Needs wordfreq, sudachipy, sudachidict_core.

Counts wordfreq's word frequencies by dictionary form, drops names, symbols and fragments,
and writes work/lemma_list.json for translation. Usage: python lemmas.py   (from the repo root)
"""
import json
import re
from pathlib import Path

from sudachipy import dictionary, tokenizer
from wordfreq import get_frequency_dict

OUT = Path('data/sources/ja/work/lemma_list.json')
TOP_WORDS = 15000
KEEP = 4200
JAPANESE = re.compile(r'^[぀-ヿ一-鿿々ー]+$')
ANY_KANJI_OR_KATAKANA = re.compile(r'[゠-ヿ一-鿿々]')
DROP_POS = {'補助記号', '記号', '空白', '接頭辞', '接尾辞'}
DROP_NAMES = '固有名詞'
KATA_TO_HIRA = {code: code - 0x60 for code in range(0x30a1, 0x30f7)}

analyzer = dictionary.Dictionary().create()
MODE = tokenizer.Tokenizer.SplitMode.C


def lemma_of(word):
    tokens = list(analyzer.tokenize(word, MODE))
    head = tokens[0]
    # A single word with its endings: the head is a word, the rest grammar.
    if any(t.part_of_speech()[0] not in ('助動詞', '助詞', '接尾辞') for t in tokens[1:]):
        return None
    pos = head.part_of_speech()
    if pos[0] in DROP_POS or pos[1] == DROP_NAMES:
        return None
    return head.dictionary_form(), pos[0]


def reading_of(lemma):
    kana = ''.join(t.reading_form() for t in analyzer.tokenize(lemma, MODE))
    return kana.translate(KATA_TO_HIRA)


def main():
    totals = {}
    frequencies = get_frequency_dict('ja')
    for word in sorted(frequencies, key=frequencies.get, reverse=True)[:TOP_WORDS]:
        if not JAPANESE.match(word):
            continue
        found = lemma_of(word)
        if not found:
            continue
        lemma, pos = found
        if not JAPANESE.match(lemma):
            continue
        entry = totals.setdefault(lemma, {'lemma': lemma, 'pos': pos, 'freq': 0.0})
        entry['freq'] += frequencies[word]
    ranked = sorted(totals.values(), key=lambda e: -e['freq'])[:KEEP]
    for entry in ranked:
        kana = reading_of(entry['lemma'])
        entry['reading'] = kana if ANY_KANJI_OR_KATAKANA.search(entry['lemma']) else ''
        del entry['freq']
    OUT.write_text(json.dumps(ranked, ensure_ascii=False, indent=0))
    print(len(totals), len(ranked), [e['lemma'] for e in ranked[:60]])
    print({p: sum(e['pos'] == p for e in ranked) for p in {e['pos'] for e in ranked}})


if __name__ == '__main__':
    main()
