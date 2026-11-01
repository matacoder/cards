import json
d=json.load(open("/Users/denis/dev/cards/data/dicts/es.json",encoding="utf8"))
P={"noun","verb","adj","adv","pron","prep","conj","det","num","interj","other"}
assert len(d)==3000,len(d)
assert [e["rank"] for e in d]==list(range(1,3001))
assert len({e["lemma"] for e in d})==3000
for e in d:
    assert e["pos"] in P and e["tr"]["ru"].strip() and e["tr"]["en"].strip() and e["word"].strip(),e
    if e["pos"]=="noun": assert " " in e["word"],e
print("OK")
for a,b in((1,30),(800,830),(2970,3000)):
    for e in d[a-1:b]: print(e["rank"],e["word"],e["pos"],e["tr"]["ru"],"|",e["tr"]["en"])
    print()
