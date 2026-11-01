import json
DROP = set("roger luke gary alice lucy josh rose susan ja phil smith jenny park jackson tim taylor doc joey lady julia chuck morgan karen hank arthur julie maggie jones fred louis carlos jackie méxico jo sara cristo francisco howard helen hmm donna miss elizabeth barry abby guau patrick andrew dean antonio cia lily jamie lucas amanda rick stan km terry juan madame vegas brown king robin hollywood ma johnson greg italia sally mac tyler texas ricky tina city okay lord alemania greg".split())
out = {}
forms = [l.strip() for l in open('/Users/denis/dev/cards/data/sources/es/work/in_03.txt', encoding='utf-8') if l.strip()]
for fn in ('data_03.txt', 'data_03b.txt'):
    try: f = open('/Users/denis/dev/cards/data/scripts/es/' + fn, encoding='utf-8')
    except FileNotFoundError: continue
    for l in f:
        l = l.rstrip('\n')
        if not l: continue
        lemma, pos, word, ru, en, fs = l.split('|')
        for x in fs.split(','):
            out[x] = [lemma, pos, word, ru, en]
miss = []
for f in forms:
    if f in out: continue
    if f in DROP: out[f] = None
    else: miss.append(f)
print('missing', miss)
extra = [k for k in out if k not in forms]
print('extra', extra)
json.dump({f: out.get(f) for f in forms}, open('/Users/denis/dev/cards/data/sources/es/work/out_03.json','w'), ensure_ascii=False, indent=0)
print(sum(1 for v in out.values() if v is None), len(forms))
