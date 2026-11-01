# Spanish frequency source

- URL: https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt (OpenSubtitles 2018 word-form counts)
- License: FrequencyWords content is CC-BY-SA 4.0 (https://github.com/hermitdave/FrequencyWords).

Method:
1. Take the top 8000 alphabetic word forms (scripts/es/prep.py), split into 10 chunks (work/in_NN.txt).
2. Each form was mapped to a lemma (with pos, article-bearing display word, ru/en translations) or dropped (names, garbage, non-Spanish); results in work/out_NN.json.
3. scripts/es/merge.py sums form counts per lemma, sorts, keeps the top 3000 and writes dicts/es.json; scripts/es/validate.py checks it.

Manual fixes in dicts/es.json: months carry the article like other nouns ("el julio"), to show the gender on the card; "el prometido" corrected. Keep them if the dictionary is ever rebuilt.

Verb forms: scripts/es/verb_forms.py adds present, preterite, imperfect, future and imperative to the verbs in dicts/es.json. Spanish comes from verbecc (conjugation data from Verbiste, GPL), Russian from pymorphy3 (OpenCorpora, CC BY-SA), English from lemminflect. verb_senses.json holds one meaning per verb, picked with an LLM; `null` keeps a verb infinitive only (gustar, haber, llover and others that don't translate form by form).
