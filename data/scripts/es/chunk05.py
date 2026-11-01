import json
D='/Users/denis/dev/cards/data/'
forms=[l.strip() for l in open(D+'sources/es/work/in_05.txt',encoding='utf8') if l.strip()]
defs={};m={}
for line in open(D+'scripts/es/chunk05.txt',encoding='utf8'):
    line=line.rstrip('\n')
    if not line: continue
    head,fs=line.rsplit(': ',1)
    p=head.split('|')
    lem,pos,ru,en=p[0],p[1],p[2],p[3]
    art=p[4] if len(p)>4 else None
    word=art+' '+lem if art else lem
    defs[lem]=[lem,pos,word,ru,en]
    for f in fs.split():
        if f in m and m[f]!=lem: print('dup',f,m[f],lem)
        m[f]=lem
out={f:(defs[m[f]] if f in m else None) for f in forms}
extra=[f for f in m if f not in set(forms)]
print('extra',extra)
json.dump(out,open(D+'sources/es/work/out_05.json','w',encoding='utf8'),ensure_ascii=False,indent=0)
print(len(forms),sum(v is None for v in out.values()))
