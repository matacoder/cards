"""Aggregate counts per lemma. Usage: python -I aggregate.py <freq.txt> <work_dir> <out.json>"""
import sys, json, os
src, work, out = sys.argv[1:4]
auto = json.load(open(os.path.join(work, "auto_map.json")))
ov = json.load(open(os.path.join(work, "overrides.json")))
drops = set(json.load(open(os.path.join(work, "drops.json")))) if os.path.exists(os.path.join(work, "drops.json")) else set()
tot = {}
for line in open(src, encoding="utf-8"):
    p = line.split()
    w, c = p[0], int(p[1])
    if w not in auto:
        continue
    l = ov[w] if w in ov else auto[w]
    if not l or l in drops:
        continue
    tot[l] = tot.get(l, 0) + c
ranked = sorted(tot.items(), key=lambda x: -x[1])
json.dump(ranked, open(out, "w"))
print(len(ranked))
