"""Merge translation chunks into dicts/en.json and validate.
Usage: python -I merge.py <work_dir> <out.json>"""
import sys, json, os
work, out = sys.argv[1:3]
POS = {"noun","verb","adj","adv","pron","prep","conj","det","num","interj","other"}
rank_list = json.load(open(os.path.join(work, "lemma_list.json")))
tr = {}
for k in range(1, 8):
    for e in json.load(open(os.path.join(work, f"tr_{k}.json"))):
        tr[e["lemma"]] = e
res, dropped = [], []
for r in rank_list:
    e = tr.get(r["lemma"])
    if e is None or e.get("drop"):
        dropped.append(r["lemma"]); continue
    res.append({"lemma": r["lemma"], "word": r["lemma"], "pos": e["pos"],
                "tr": {"es": e["es"].strip(), "ru": e["ru"].strip()}})
    if len(res) == 3000: break
for i, e in enumerate(res, 1):
    e2 = {"rank": i}; e2.update(e); res[i-1] = e2
errs = []
if len(res) != 3000: errs.append(f"count {len(res)}")
if len({e["lemma"] for e in res}) != len(res): errs.append("dup lemmas")
for e in res:
    if e["pos"] not in POS: errs.append(f"pos {e['lemma']} {e['pos']}")
    if not e["tr"]["es"] or not e["tr"]["ru"]: errs.append(f"empty {e['lemma']}")
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print("entries", len(res), "dropped", len(dropped), dropped)
print("errors", errs or "none")
for a, b in ((1,30),(800,830),(2970,3000)):
    for e in res[a-1:b]:
        print(e["rank"], e["lemma"], e["pos"], e["tr"]["es"], "|", e["tr"]["ru"])
    print("--")
