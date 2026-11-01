import json,sys,os
W='/Users/denis/dev/cards/data/sources/ru/work/'
POS={'noun','verb','adj','adv','pron','prep','conj','det','num','interj','other'}
out=[];bad=[]
for i in range(1,7):
    ch=json.load(open(W+f'chunk_{i}.json',encoding='utf8'))
    tr=json.load(open(W+f'tr_{i}.json',encoding='utf8'))
    for r in ch:
        t=tr.get(r['lemma'])
        if not t or not str(t.get('es','')).strip() or not str(t.get('en','')).strip(): bad.append(r['lemma']);continue
        out.append({'rank':r['rank'],'lemma':r['lemma'],'word':r['lemma'],'pos':r['pos'],'tr':{'es':t['es'].strip(),'en':t['en'].strip()}})
assert not bad,bad
assert len(out)==3000
assert [o['rank'] for o in out]==list(range(1,3001))
assert len({o['lemma'] for o in out})==3000
assert all(o['pos'] in POS for o in out)
json.dump(out,open('/Users/denis/dev/cards/data/dicts/ru.json','w',encoding='utf8'),ensure_ascii=False,indent=1)
print('OK',len(out))
for a,b in((1,30),(800,830),(2970,3000)):
    for o in out[a-1:b]: print(o['rank'],o['lemma'],o['pos'],o['tr']['es'],'|',o['tr']['en'])
