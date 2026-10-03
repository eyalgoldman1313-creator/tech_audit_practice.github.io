import json, re, glob, sys
sys.stdout.reconfigure(encoding='utf-8')
A='C:/itaudit/analysis/'
TOPICS={'infra','systems','process','controls','security','bcp','sdlc','models','caat','outsourcing','laws'}
# ---- cases
cases=[]
for f in ['cases_samples.json','cases_council_spring.json','cases_council_winter.json']:
    for c in json.load(open(A+f,encoding='utf-8')):
        m=re.match(r'council-(\d{4})-(summer|winter|special)',c['id'])
        if m: c['year']=int(m.group(1)); c['session']=m.group(2)
        for p in c['parts']:
            assert p['topic'] in TOPICS, (c['id'],p['topic'])
            p['keyPoints']=p.get('keyPoints') or []
        c['topics']=[t for t in dict.fromkeys(c.get('topics') or [p['topic'] for p in c['parts']]) if t in TOPICS] or [c['parts'][0]['topic']]
        cases.append(c)
ids=[c['id'] for c in cases]; assert len(ids)==len(set(ids)), 'dup ids'
# ---- exams
exams=json.load(open(A+'sample_exams_meta.json',encoding='utf-8'))
for e in exams:
    for cid in e['caseIds']: assert cid in ids, cid
# ---- questions
qs=[]
for f in sorted(glob.glob(A+'mcq_*.json')):
    for q in json.load(open(f,encoding='utf-8')):
        if q['topic'] not in TOPICS: print('bad topic',q['id'],q['topic']); continue
        if not (0<=q['answer']<len(q['options'])): print('bad answer',q['id']); continue
        q['question']=re.sub(r'^(לפי השקפים|על פי השקפים|לפי החוברת),\s*','',q['question'])
        q['question']=re.sub(r',?\s*(לפי השקפים|על פי השקפים|לפי החוברת)(?=[?.,:])','',q['question'])
        qs.append(q)
qids=[q['id'] for q in qs]; assert len(qids)==len(set(qids)),'dup qids'
# ---- board map
exec(open('C:/itaudit/build/boardmap_src.py',encoding='utf-8').read())
board=[]
for name,tid,items in M:
    out=[]
    for ses,y,qn,req in items:
        cid=f"council-{y}-{'summer' if ses=='קיץ' else 'winter'}-q{qn}"
        out.append({'label':f"{ses} {y}, שאלה {qn}"+(f", {req}" if req else ''),'caseId':cid if cid in ids else None})
    board.append({'topic':name,'topicId':tid,'items':out})
missing=[i['label'] for b in board for i in b['items'] if not i['caseId']]
P='C:/itaudit/practice/src/data/'
json.dump(cases,open(P+'cases.json','w',encoding='utf-8'),ensure_ascii=False)
json.dump(exams,open(P+'exams.json','w',encoding='utf-8'),ensure_ascii=False)
json.dump(qs,open(P+'questions.json','w',encoding='utf-8'),ensure_ascii=False)
json.dump(board,open(P+'boardmap.json','w',encoding='utf-8'),ensure_ascii=False)
json.dump([{'id':c['id'],'title':c['title'],'source':c['source'],'topics':c['topics'],'parts':[(p['label'],p['topic']) for p in c['parts']]} for c in cases],open('C:/itaudit/guide/content/cases.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
from collections import Counter
print('cases',len(cases),'exams',len(exams),'questions',len(qs))
print('q by topic',Counter(q['topic'] for q in qs))
print('parts by topic',Counter(p['topic'] for c in cases for p in c['parts']))
print('board missing caseIds:',missing)
