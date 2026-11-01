# Data attribution

## Spanish and English dictionaries

`data/dicts/es.json` and `data/dicts/en.json` are derived from [FrequencyWords](https://github.com/hermitdave/FrequencyWords) by Hermit Dave, built on OpenSubtitles data, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The word forms were lemmatized, filtered, re-ranked and translated, and these two files are distributed under the same license.

## Russian dictionary

`data/dicts/ru.json` uses the frequency ranking from the Frequency Dictionary of Modern Russian, based on the Russian National Corpus. Original citation: О. Н. Ляшевская, С. А. Шаров, Частотный словарь современного русского языка (на материалах Национального корпуса русского языка). М.: Азбуковник, 2009. http://dict.ruslang.ru/freq.php

© O. N. Lyashevskaya, S. A. Sharov, 2009–2011. © Russian National Corpus, 2009–2011. The source states no open license. The original file is not redistributed here.

## Translations

Lemmatization and translations were produced with an LLM and validated by script.

## Japanese dictionary

`data/dicts/ja.json` is derived from [wordfreq](https://github.com/rspeer/wordfreq) word lists by Robyn Speer, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), and uses [SudachiDict](https://github.com/WorksApplications/SudachiDict) (Apache 2.0). Derived data keeps the same license. Details: `data/sources/ja/SOURCE.md`.

## Spanish verb forms

Conjugations in `data/dicts/es.json` were generated with [verbecc](https://github.com/bretttolbert/verbecc), whose data comes from Verbiste (GPL); Russian forms with [pymorphy3](https://github.com/no-plagiarism/pymorphy3) and OpenCorpora data (CC BY-SA); English forms with [lemminflect](https://github.com/bjascob/LemmInflect).
