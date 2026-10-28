"""Capturas comparativas antes/depois nos mesmos tamanhos e posições.

Uso (servidor da versão a capturar já rodando):
    python testes/comparar.py antes  http://127.0.0.1:8766/
    python testes/comparar.py depois http://127.0.0.1:8767/
Saída: docs/comparativo/<rotulo>/*.jpg
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ROT, BASE = sys.argv[1], sys.argv[2]
OUT = RAIZ / 'docs' / 'comparativo' / ROT
OUT.mkdir(parents=True, exist_ok=True)
TAM = {'1440': (1440, 900), '768': (768, 1024), '390': (390, 844), '320': (320, 640)}
# (nome, página, seletor a alinhar no topo ou None, larguras)
CENAS = [
    ('inicio', '/', None, TAM),
    ('servicos', '/', '#h-biz', ('1440', '390')),
    ('atuacao', '/', '#h-rep', ('1440', '390')),
    ('fechamento', '/', '#h-join', ('1440', '390')),
    ('historico', '/historico', None, ('1440', '390')),
    ('auditorio', '/auditorio', None, ('1440', '390')),
    ('noticia', '/noticias/acidi-itinerante', None, ('1440', '390')),
    ('para-seu-negocio', '/para-seu-negocio', None, ('1440', '390')),
]

def carregar_tudo(pg):
    pg.evaluate("Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); }))")

with sync_playwright() as p:
    nav = p.chromium.launch(channel='msedge')
    for nome, pagina, sel, larguras in CENAS:
        for w in larguras:
            vw, vh = TAM[w]
            ctx = nav.new_context(viewport={'width': vw, 'height': vh}, locale='pt-BR', device_scale_factor=1)
            pg = ctx.new_page()
            pg.goto(BASE.rstrip('/') + pagina); pg.wait_for_load_state('networkidle'); carregar_tudo(pg)
            if sel:
                # alinha o título da seção a 90 px do topo; rolagem instantânea
                pg.evaluate(f"(() => {{ const e = document.querySelector('{sel}'); const s = e.closest('section') || e; window.scrollTo({{top: s.getBoundingClientRect().top + scrollY - document.querySelector('header.site').offsetHeight, behavior: 'instant'}}); }})()")
            pg.wait_for_timeout(2200)  # estado de repouso
            pg.screenshot(path=str(OUT / f'{nome}-{w}.jpg'), type='jpeg', quality=78)
            ctx.close()
    # página inteira da home
    for w in ('1440', '390'):
        vw, vh = TAM[w]
        ctx = nav.new_context(viewport={'width': vw, 'height': vh}, locale='pt-BR')
        pg = ctx.new_page(); pg.goto(BASE); pg.wait_for_load_state('networkidle'); carregar_tudo(pg)
        # rola até o fim para disparar o que depende de visibilidade, depois volta
        pg.evaluate("(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); })()")
        pg.wait_for_timeout(1500)
        pg.set_viewport_size({'width': vw, 'height': pg.evaluate('document.documentElement.scrollHeight')})
        pg.wait_for_timeout(800)
        pg.screenshot(path=str(OUT / f'inicio-pagina-inteira-{w}.jpg'), type='jpeg', quality=70)
        ctx.close()
    nav.close()
print('capturas em', OUT)
