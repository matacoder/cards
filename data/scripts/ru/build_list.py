import sys,re,json,collections
src,out=sys.argv[1],sys.argv[2]
M={'s':'noun','v':'verb','a':'adj','adv':'adv','advpro':'adv','apro':'det','spro':'pron','pr':'prep','conj':'conj','num':'num','anum':'num','intj':'interj','part':'other'}
f=collections.defaultdict(float);p=collections.defaultdict(dict)
for l in open(src,encoding='utf8').read().split('\n')[1:]:
    c=l.split('\t')
    if len(c)<3 or c[1] not in M: continue
    w=c[0]
    if not re.fullmatch(r'[а-яё]+',w) : continue
    if len(w)==1 and w not in 'яквсоуаи': continue
    fr=float(c[2]);f[w]+=fr;p[w][M[c[1]]]=p[w].get(M[c[1]],0)+fr
rows=sorted(f,key=lambda w:-f[w])
res=[{'lemma':w,'pos':max(p[w],key=p[w].get),'ipm':f[w]} for w in rows[:3300]]
json.dump(res,open(out,'w'),ensure_ascii=False)
print(' '.join(r['lemma'] for r in res[:3300]))
