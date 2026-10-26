"""Confere links, âncoras e arquivos locais de todas as páginas.  Uso: python testes/verificar_links.py"""
import os, re, sys
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.ids = set(); s.refs = []; s.ext_sem_aviso = []; s.btn_sem_tipo = 0; s._a = None
    def handle_starttag(s, tag, a):
        a = dict(a)
        if 'id' in a: s.ids.add(a['id'])
        for k in ('href', 'src'):
            if k in a and tag not in ('link',) or (tag == 'link' and k == 'href' and k in a):
                if k in a: s.refs.append((tag, a[k]))
        if tag == 'a' and a.get('href', '').startswith('http') and a.get('target') != '_blank':
            s.ext_sem_aviso.append(a['href'])
        if tag == 'button' and 'type' not in a: s.btn_sem_tipo += 1

erros, paginas = [], sorted(f for f in os.listdir(RAIZ) if f.endswith('.html'))
ids = {}
parsed = {}
for f in paginas:
    p = P(); html = open(os.path.join(RAIZ, f), encoding='utf-8').read(); p.feed(html); parsed[f] = (p, html); ids[f] = p.ids
for f, (p, html) in parsed.items():
    for chk, msg in ((r'<!doctype html>', 'sem doctype'), (r'<html lang="pt-BR">', 'sem lang'), (r'<meta charset="utf-8">', 'sem charset'),
                     (r'name="viewport"', 'sem viewport'), (r'name="description"', 'sem descrição'), (r'<title>[^<]{8,}</title>', 'título curto')):
        if not re.search(chk, html, re.I): erros.append(f'{f}: {msg}')
    if re.search(r'href="#"', html): erros.append(f'{f}: href="#"')
    if p.btn_sem_tipo: erros.append(f'{f}: {p.btn_sem_tipo} botão(ões) sem type')
    for h in p.ext_sem_aviso:
        if 'fonts.googleapis' not in h: erros.append(f'{f}: link externo sem nova aba: {h}')
    for tag, r in p.refs:
        if r.startswith(('http://', 'https://', 'mailto:', 'tel:')): continue
        alvo, _, ancora = r.partition('#')
        alvo = alvo.split('?')[0]
        destino = f if not alvo else alvo
        if alvo and not os.path.exists(os.path.join(RAIZ, alvo)):
            erros.append(f'{f}: arquivo inexistente {r}'); continue
        if ancora and destino.endswith('.html') and ancora not in ids.get(destino, set()):
            erros.append(f'{f}: âncora inexistente {r}')
print(f'{len(paginas)} páginas verificadas')
if erros:
    print('\n'.join(erros)); sys.exit(1)
print('verificar_links.py: nenhum problema encontrado')
