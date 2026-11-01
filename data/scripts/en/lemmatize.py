"""Auto-propose lemmas for top word forms using lemminflect; manual overrides in work/overrides.json.
Usage: python -I lemmatize.py <freq.txt> <out_auto.json> [N]"""
import sys, json
from lemminflect import getAllLemmas as g

src, out = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 7000
KEEP = set("""building meeting feeling feelings morning evening wedding painting beginning interesting amazing exciting
boring training warning opening tired married worried interested excited scared bored surprised shocked pleased ashamed
confused supposed prepared concerned disappointed lightning darling""".split())
rows = []
for line in open(src, encoding="utf-8"):
    p = line.split()
    if len(p) == 2 and p[1].isdigit():
        rows.append((p[0], int(p[1])))
rows = rows[:N]
freq = dict(rows)
auto = {}
for w, c in rows:
    if not w.isalpha() or not w.isascii():
        auto[w] = None
        continue
    d = g(w)
    cands = {l for v in d.values() for l in v if l.isalpha()}
    own = any(w in v for v in d.values())
    own_adj = w in d.get("ADJ", ())
    own_noun = w in d.get("NOUN", ())
    others = [l for l in cands if l != w and l in freq]
    if not d:
        auto[w] = w  # unknown to lexicon: review (names, garbage)
    elif not others:
        auto[w] = w
    else:
        best = max(others, key=lambda l: freq[l])
        if w in KEEP:
            auto[w] = w
        elif own and c > 2 * freq[best]:
            auto[w] = w
        else:
            auto[w] = best
json.dump(auto, open(out, "w"), indent=0)
