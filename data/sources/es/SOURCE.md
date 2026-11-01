# Spanish frequency source

- URL: https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt (OpenSubtitles 2018 word-form counts)
- License: FrequencyWords content is CC-BY-SA 4.0 (https://github.com/hermitdave/FrequencyWords).

Method:
1. Take the top 8000 alphabetic word forms (scripts/es/prep.py), split into 10 chunks (work/in_NN.txt).
2. Each form was mapped to a lemma (with pos, article-bearing display word, ru/en translations) or dropped (names, garbage, non-Spanish); results in work/out_NN.json.
3. scripts/es/merge.py sums form counts per lemma, sorts, keeps the top 3000 and writes dicts/es.json; scripts/es/validate.py checks it.
