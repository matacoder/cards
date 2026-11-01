import json,re,glob,sys
base="/Users/denis/dev/cards/data/"
cnt={}
for l in open(base+"sources/es/es_50k.txt",encoding="utf8"):
    w,c=l.split(); cnt[w]=int(c)
POS={"noun","verb","adj","adv","pron","prep","conj","det","num","interj","other"}
ent={}; freq={}; seen=set()
for f in sorted(glob.glob(base+"sources/es/work/out_*.json")):
    for form,v in json.load(open(f,encoding="utf8")).items():
        if not v or form in seen: continue
        seen.add(form)
        lem,pos,word,ru,en=[str(x).strip() for x in v]
        if pos not in POS or not ru or not en or not lem: continue
        ent.setdefault(lem,(pos,word,ru,en))
        freq[lem]=freq.get(lem,0)+cnt[form]
top=sorted(freq,key=lambda l:-freq[l])[:3000]
out=[]
for i,l in enumerate(top,1):
    pos,word,ru,en=ent[l]
    out.append({"rank":i,"lemma":l,"word":word,"pos":pos,"tr":{"ru":ru,"en":en}})
print("lemmas total",len(freq))
json.dump(out,open(base+"dicts/es.json","w",encoding="utf8"),ensure_ascii=False,indent=0)
