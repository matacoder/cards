import json
D='/Users/denis/dev/cards/data/'
forms=[l.strip() for l in open(D+'sources/es/work/in_07.txt') if l.strip()]
defs={};m={}
for l in open(D+'scripts/es/d07.txt'):
    l=l.strip()
    if not l: continue
    f,r=l.split(' > ');
    if '|' in r:
        w,pos,ru,en=r.split('|')
        lem=w.split(' ',1)[1] if pos=='noun' and w.split(' ')[0] in('el','la','los','las') else w
        defs[w]=[lem,pos,w,ru,en]; key=w
    else: key=r
    for x in f.split(): m[x]=defs[key]
out={f:m.get(f) for f in forms}
miss=[f for f in forms if f not in m]
json.dump(out,open(D+'sources/es/work/out_07.json','w'),ensure_ascii=False,indent=0)
print(len(forms),len(out),sum(v is None for v in out.values()))
extra=[x for x in m if x not in set(forms)]
print('extra',extra)
