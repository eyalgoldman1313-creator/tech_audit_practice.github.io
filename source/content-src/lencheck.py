# usage: python lencheck.py file1.json [file2.json ...]  -> lists questions where correct option is >1.15x the longest distractor
import json,sys
sys.stdout.reconfigure(encoding='utf-8')
tot=lng=flag=0
for f in sys.argv[1:]:
    for q in json.load(open(f,encoding='utf-8')):
        L=[len(o) for o in q['options']]; c=L[q['answer']]; o=max(L[i] for i in range(len(L)) if i!=q['answer'])
        tot+=1; lng+= c>=max(L)
        if c>o*1.15: flag+=1; print('FLAG',q['id'],c,o)
print(f'total {tot}  correct-is-longest {lng} ({100*lng//max(tot,1)}%)  flagged {flag}')
