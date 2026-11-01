import json
B='/Users/denis/dev/cards/data/'
defs={}
for l in open(B+'scripts/es/o02_defs.txt',encoding='utf8'):
    l=l.rstrip('\n')
    if not l: continue
    w,pos,ru,en=l.split('|')
    lem=w.split(' ',1)[1] if pos=='noun' and w.split(' ',1)[0] in('el','la') else w
    defs[lem]=[lem,pos,w,ru,en]
inp=[x.strip() for x in open(B+'sources/es/work/in_02.txt',encoding='utf8') if x.strip()]
out={}
for tok in open(B+'scripts/es/o02_map.txt',encoding='utf8').read().split():
    f,_,l=tok.partition('>')
    if not l: l=f
    out[f]=None if l=='-' else defs[l]
miss=[w for w in inp if w not in out]
print('missing',miss,'extra',[w for w in out if w not in inp])
json.dump({w:out[w] for w in inp if w in out},open(B+'sources/es/work/out_02.json','w',encoding='utf8'),ensure_ascii=False,indent=0)
print(len(inp),sum(v is None for v in out.values()))
