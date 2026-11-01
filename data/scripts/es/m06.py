import json
D='/Users/denis/dev/cards/data/sources/es/work/'
forms=open(D+'in_06.txt',encoding='utf-8').read().split('\n')
forms=[f for f in forms if f.strip()]
maps={};defs={}
for ln in open('/Users/denis/dev/cards/data/scripts/es/m06.txt',encoding='utf-8'):
    ln=ln.rstrip('\n')
    if not ln: continue
    f,r=ln.split('>',1)
    p=r.split('|')
    maps[f]=p[0]
    if len(p)==4: defs[p[0]]=p[1:]
# explicit def for lemmas referenced only without def handled below
art={'nm':'el','nf':'la','nfe':'el','nmp':'los'}
out={};miss=[];drop=0
for f in forms:
    k=maps.get(f)
    if k is None: miss.append(f);continue
    if k=='-': out[f]=None;drop+=1;continue
    if k not in defs and k in defs.__class__(): pass
    if k not in defs:
        miss.append(f+'->'+k);continue
    pos,ru,en=defs[k];lem=k.split('#')[0]
    if pos in art: word=art[pos]+' '+lem;pos2='noun'
    else: word=lem;pos2=pos
    out[f]=[lem,pos2,word,ru,en]
print('missing',miss)
json.dump(out,open(D+'out_06.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print(len(out),len(forms),drop)
