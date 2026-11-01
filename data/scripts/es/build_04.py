import json
d='/Users/denis/dev/cards/data/'
forms=[l.strip() for l in open(d+'sources/es/work/in_04.txt') if l.strip()]
out={}
for l in open(d+'scripts/es/data_04.txt'):
    p=l.rstrip('\n').split('|')
    if len(p)!=5: print('bad',l); continue
    fs,lem,pos,ru,en=p
    if pos=='noun': lemma=lem.split(' ',1)[1]; word=lem
    else: lemma=word=lem
    for f in fs.split(): out[f]=[lemma,pos,word,ru,en]
miss=[f for f in forms if f not in out]
print('missing',len(miss)); print(' '.join(miss))
extra=[f for f in out if f not in set(forms)]
print('extra',extra)
for f in miss: out[f]=None
res={f:out[f] for f in forms}
json.dump(res,open(d+'sources/es/work/out_04.json','w'),ensure_ascii=False,indent=0)
r=json.load(open(d+'sources/es/work/out_04.json'))
assert set(r)==set(forms)
print(len(r),sum(v is None for v in r.values()))
