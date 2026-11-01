import re,sys
src,out=sys.argv[1],sys.argv[2]
ok=re.compile(r"^[a-záéíóúüñ]+$")
keep1=set("aoyeu")
forms=[]
for l in open(src,encoding="utf8"):
    w,c=l.split()
    if not ok.match(w) or (len(w)==1 and w not in keep1): continue
    forms.append(w)
forms=forms[:8000]
for i in range(10):
    open(f"{out}/in_{i:02d}.txt","w",encoding="utf8").write("\n".join(forms[i*800:(i+1)*800])+"\n")
print(len(forms))
