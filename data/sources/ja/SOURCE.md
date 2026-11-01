# Japanese frequency source

- Frequencies: [wordfreq](https://github.com/rspeer/wordfreq) 3.1.1 (`get_frequency_dict('ja')`), which combines subtitles, web, news, Wikipedia and social media. Word list data: CC BY-SA 4.0.
- Dictionary forms and first readings: [SudachiPy](https://github.com/WorksApplications/sudachi.rs) with SudachiDict core (Apache 2.0).

Method:

1. `scripts/ja/lemmas.py` reduces the top 15000 forms to dictionary forms, drops names and symbols, sums frequencies and keeps the top 4200 (`work/lemma_list.json`).
2. Readings, parts of speech and ru/en/es translations were written with an LLM in chunks (`work/out_ja_*.jsonl`), which also dropped 612 fragments, slang and non-standard spellings.
3. `scripts/ja/merge.py` keeps the first 3000 and writes `dicts/ja.json`. It also adds `tr.ja`, LLM-translated, to the es, en and ru dictionaries.

The level coverage figures (≈50/75/90%) are carried over from the other languages and haven't been measured for Japanese.
