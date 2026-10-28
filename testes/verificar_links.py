"""Rastreia o site servido e confere links, âncoras, recursos locais e os redirects das URLs .html antigas.
Uso (com o site rodando):  python testes/verificar_links.py [BASE]      BASE padrão: http://127.0.0.1:3000/
"""
import re, sys, urllib.request, urllib.error
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from paridade import ROTAS

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3000/').rstrip('/') + '/'

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.ids = set(); s.refs = []; s.ext_sem_aviso = []; s.btn_sem_tipo = 0
    def handle_starttag(s, tag, a):
        a = dict(a)
        if 'id' in a: s.ids.add(a['id'])
        for k in ('href', 'src', 'poster'):
            if a.get(k): s.refs.append((tag, a[k]))
        if tag == 'a' and a.get('href', '').startswith('http') and a.get('target') != '_blank':
            s.ext_sem_aviso.append(a['href'])
        if tag == 'button' and 'type' not in a: s.btn_sem_tipo += 1

class SemRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(s, *a, **k): return None
sem_redirect = urllib.request.build_opener(SemRedirect)

def get(url, opener=urllib.request.build_opener()):
    try:
        with opener.open(url) as r: return r.status, r.headers.get('Content-Type', ''), r.read().decode('utf-8', 'replace'), r.headers
    except urllib.error.HTTPError as e: return e.code, '', '', e.headers

erros, paginas, recursos = [], {}, {}
fila = [BASE]
while fila:
    url = fila.pop()
    if url in paginas: continue
    st, ct, html, _ = get(url)
    if st != 200: erros.append(f'{url}: status {st}'); paginas[url] = None; continue
    p = P(); p.feed(html); paginas[url] = (p, html)
    for tag, r in p.refs:
        if r.startswith(('http://', 'https://', 'mailto:', 'tel:', 'data:')): continue
        alvo = urljoin(url, r); sem = alvo.split('#')[0].split('?')[0]
        if tag == 'a' and not sem.startswith(BASE + 'assets/') and not urlsplit(sem).path.startswith('/_next/'):
            if sem not in paginas and sem not in fila: fila.append(sem)
        elif sem not in recursos:
            recursos[sem] = get(sem)[0]

for url, v in paginas.items():
    if not v: continue
    p, html = v
    for chk, msg in ((r'<!doctype html>', 'sem doctype'), (r'<html lang="pt-BR"[ >]', 'sem lang'), (r'<meta charset="utf-8"\s*/?>', 'sem charset'),
                     (r'name="viewport"', 'sem viewport'), (r'name="description"', 'sem descrição'), (r'<title>[^<]{8,}</title>', 'título curto')):
        if not re.search(chk, html, re.I): erros.append(f'{url}: {msg}')
    if re.search(r'href="#"', html): erros.append(f'{url}: href="#"')
    if p.btn_sem_tipo: erros.append(f'{url}: {p.btn_sem_tipo} botão(ões) sem type')
    for h in p.ext_sem_aviso:
        if 'fonts.googleapis' not in h: erros.append(f'{url}: link externo sem nova aba: {h}')
    for tag, r in p.refs:
        if '#' not in r or r.startswith(('http://', 'https://')): continue
        destino, _, ancora = urljoin(url, r).partition('#')
        destino = destino.split('?')[0]
        alvo = paginas.get(destino)
        if ancora and alvo and ancora not in alvo[0].ids: erros.append(f'{url}: âncora inexistente {r}')
for sem, st in recursos.items():
    if st != 200: erros.append(f'recurso {sem}: status {st}')

for arq, rota in ROTAS.items():
    st, _, _, h = get(BASE + arq, sem_redirect)
    if st != 301 or urlsplit(h.get('Location', '')).path != rota: erros.append(f'{arq}: esperado 301 -> {rota}, veio {st} {h.get("Location")}')

print(f'{sum(1 for v in paginas.values() if v)} páginas e {len(recursos)} recursos verificados, {len(ROTAS)} redirects')
if erros:
    print('\n'.join(erros)); sys.exit(1)
print('verificar_links.py: nenhum problema encontrado')
