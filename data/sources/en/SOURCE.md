# English frequency source

- File: `en_50k.txt`, downloaded from https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
  (FrequencyWords by hermitdave, word forms counted from OpenSubtitles 2018).
- License: CC-BY-SA 4.0 (FrequencyWords content). Derived data in `data/dicts/en.json` must keep attribution and the same license.

Method:
1. Top 7000 word forms were mapped to lemmas: `scripts/en/lemmatize.py` proposes lemmas with the lemminflect dictionary, then manual overrides (`work/overrides.json`: contraction fragments, modals, pronouns, comparatives) and drops (`work/drops.json`: proper names, subtitle noise, vulgar slurs) were applied.
2. `scripts/en/aggregate.py` sums form counts per lemma and sorts by frequency (`work/lemma_list.json`).
3. Spanish and Russian translations plus part of speech were written in chunks (`work/tr_*.json`); entries flagged as names/junk were dropped and replaced by the next-ranked lemmas.
4. `scripts/en/merge.py` merges chunks, takes the top 3000, assigns contiguous ranks and validates the result.
