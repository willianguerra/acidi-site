"""Capturas de página inteira de todas as rotas públicas, para comparar antes e depois.

Uso, com o servidor rodando em 127.0.0.1:3000:
    python testes/capturar.py antes        (ou depois)
Gera docs/comparativo/evolucao/<pasta>/<rota>-<largura>.jpg e informa rolagem horizontal e imagens quebradas.
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:3000')
PASTA = pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'comparativo' / 'evolucao' / (sys.argv[1] if len(sys.argv) > 1 else 'depois')
PASTA.mkdir(parents=True, exist_ok=True)
ROTAS = ['/', '/historico', '/diretoria', '/ex-presidentes', '/representatividade', '/nucleos', '/para-seu-negocio',
         '/noticias', '/noticias/contabilidade-e-impacto-social', '/agenda', '/auditorio', '/associe-se', '/contato']
if os.environ.get('ROTAS'):
    ROTAS = ['/' + r.strip('/').replace('inicio', '') for r in os.environ['ROTAS'].split(',')]
LARGURAS = [int(x) for x in os.environ.get('LARGURAS', '1440,390').split(',')]

with sync_playwright() as p:
    nav = p.chromium.launch(channel='msedge')
    for w in LARGURAS:
        ctx = nav.new_context(viewport={'width': w, 'height': 900}, is_mobile=w < 768, has_touch=w < 768)
        page = ctx.new_page()
        erros = []
        page.on('console', lambda m: m.type == 'error' and '/_next/hmr' not in m.text and erros.append(m.text))
        for r in ROTAS:
            page.goto(BASE + r, wait_until='networkidle')
            page.evaluate("Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); }))")
            # revela tudo que o JS esconde até rolar
            page.evaluate("document.querySelectorAll('.rv').forEach(e => e.classList.add('vis')); document.querySelectorAll('[data-anim]').forEach(e => e.classList.add('on'))")
            h = page.evaluate('document.documentElement.scrollHeight')
            page.set_viewport_size({'width': w, 'height': h})
            page.wait_for_timeout(900)
            nome = (r.strip('/').replace('/', '_') or 'inicio') + f'-{w}.jpg'
            page.screenshot(path=str(PASTA / nome), type='jpeg', quality=70)
            page.set_viewport_size({'width': w, 'height': 900})
            sx = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            quebradas = page.evaluate("[...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src)")
            if sx > 0 or quebradas:
                print(f'AVISO {r} @{w}: rolagem horizontal {sx}px, imagens quebradas {quebradas}')
        if erros:
            print(f'Erros de console @{w}:', erros)
        ctx.close()
    nav.close()
print('Capturas em', PASTA)
