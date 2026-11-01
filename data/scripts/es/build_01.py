import json
D='/Users/denis/dev/cards/data/'
forms=[l.strip() for l in open(D+'sources/es/work/in_01.txt',encoding='utf-8') if l.strip()]
rows=[l.rstrip('\n').split('|') for l in open(D+'scripts/es/data_01.txt',encoding='utf-8') if l.strip()]
defs={}
for r in rows:
    if len(r)==5: defs[r[1]]=r
def lem(w):
    for a in ('el ','la ','las ','los '):
        if w.startswith(a): return w[len(a):]
    return w
out={}
for r in rows:
    f=r[0]
    if len(r)==2 and r[1]=='-': out[f]=None
    elif len(r)==2:
        d=defs[r[1][1:]]; out[f]=[lem(d[1]),d[2],d[1],d[3],d[4]]
    else: out[f]=[lem(r[1]),r[2],r[1],r[3],r[4]]
miss=[f for f in forms if f not in out]
extra=[f for f in out if f not in forms]
print(miss,extra,len(forms),len(out))
json.dump(out,open(D+'sources/es/work/out_01.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print(sum(v is None for v in out.values()))
