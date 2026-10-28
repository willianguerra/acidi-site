"""Quadros de movimento (repouso, intermediários, final) e gravações reais das interações.

Uso, com o servidor desta versão rodando:  python testes/movimento.py http://127.0.0.1:8767/
Saída: docs/comparativo/quadros/*.jpg e docs/gravacoes/*.mp4 (precisa de ffmpeg no PATH para o MP4).
"""
import sys, pathlib, shutil, subprocess
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8767/'
QD = RAIZ / 'docs' / 'comparativo' / 'quadros'; QD.mkdir(parents=True, exist_ok=True)
GR = RAIZ / 'docs' / 'gravacoes'; GR.mkdir(parents=True, exist_ok=True)

def congelar(pg, t):
    """Pausa todas as animações e transições da página no instante t (ms desde o início de cada uma)."""
    pg.evaluate(f"document.getAnimations().forEach(a => {{ a.pause(); a.currentTime = {t}; }})")

def ir_secao(pg, sel):
    pg.evaluate(f"(() => {{ const s = document.querySelector('{sel}').closest('section'); scrollTo({{top: s.getBoundingClientRect().top + scrollY - document.querySelector('header.site').offsetHeight, behavior: 'instant'}}); }})()")

with sync_playwright() as p:
    nav = p.chromium.launch(channel='msedge')
    for w, h in [(1440, 900), (390, 844)]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, locale='pt-BR')
        pg = ctx.new_page()
        # abertura: quadros a partir do carregamento
        for t in (0, 250, 500, 800, 1300):
            pg.goto(BASE + 'index.html', wait_until='domcontentloaded')
            pg.evaluate("Promise.all([...document.querySelectorAll('.stage img')].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r)))")
            congelar(pg, t)
            pg.screenshot(path=str(QD / f'abertura-{t:04d}ms-{w}.jpg'), type='jpeg', quality=78)
        # atuação e fechamento: disparados ao entrar na tela
        for sel, nome in (('#h-rep', 'atuacao'), ('#h-join', 'fechamento')):
            for t in (0, 350, 700, 1400):
                pg.goto(BASE + 'index.html'); pg.wait_for_load_state('networkidle')
                ir_secao(pg, sel)
                if nome == 'atuacao' and w < 700: break  # no celular as ondas dão lugar aos marcadores em coluna
                pg.wait_for_function(f"document.querySelector('{sel}').closest('section').querySelector('[data-anim]').classList.contains('on')")
                congelar(pg, t)
                pg.screenshot(path=str(QD / f'{nome}-{t:04d}ms-{w}.jpg'), type='jpeg', quality=78)
        ctx.close()

    # serviços: duas seleções e um quadro no meio da troca (desktop)
    ctx = nav.new_context(viewport={'width': 1440, 'height': 900}, locale='pt-BR')
    pg = ctx.new_page(); pg.goto(BASE + 'index.html'); pg.wait_for_load_state('networkidle'); ir_secao(pg, '#h-biz'); pg.wait_for_timeout(300)
    for sid, nome in (('boa-vista-scpc', 'a'), ('treinamentos-e-palestras', 'b')):
        pg.locator(f'#svx-b-{sid}').click(); pg.wait_for_timeout(60); congelar(pg, 120)
        pg.screenshot(path=str(QD / f'servicos-{nome}-meio-1440.jpg'), type='jpeg', quality=78)
        pg.evaluate("document.getAnimations().forEach(a => a.finish())"); pg.wait_for_timeout(100)
        pg.screenshot(path=str(QD / f'servicos-{nome}-{sid}-1440.jpg'), type='jpeg', quality=78)
    ctx.close()

    # gravações reais (vídeo do navegador, sem congelar nada)
    def gravar(nome, w, h, roteiro):
        tmp = GR / ('tmp-' + nome); shutil.rmtree(tmp, ignore_errors=True)
        ctx = nav.new_context(viewport={'width': w, 'height': h}, locale='pt-BR', record_video_dir=str(tmp), record_video_size={'width': w, 'height': h}, has_touch=w < 700, is_mobile=w < 700)
        pg = ctx.new_page(); roteiro(pg); ctx.close()
        webm = next(tmp.glob('*.webm'))
        destino = GR / f'{nome}.mp4'
        if shutil.which('ffmpeg'):
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(webm), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', str(destino)], check=True)
            shutil.rmtree(tmp)
        else:
            webm.rename(GR / f'{nome}.webm'); shutil.rmtree(tmp)

    def rolar_ate(pg, sel, passos=14):
        alvo = pg.evaluate(f"document.querySelector('{sel}').closest('section').getBoundingClientRect().top + scrollY - document.querySelector('header.site').offsetHeight")
        ini = pg.evaluate('scrollY')
        for k in range(1, passos + 1):
            pg.evaluate(f'scrollTo(0, {ini + (alvo - ini) * k / passos})'); pg.wait_for_timeout(40)

    def desktop(pg):
        pg.goto(BASE + 'index.html'); pg.wait_for_timeout(2200)
        rolar_ate(pg, '#h-biz'); pg.wait_for_timeout(700)
        for sid in ('uniodonto', 'certificado-de-origem', 'protesto-expresso'):
            pg.locator(f'#svx-b-{sid}').click(); pg.wait_for_timeout(1100)
        pg.locator('#svx-b-protesto-expresso').focus(); pg.wait_for_timeout(300)
        for _ in range(2): pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(250)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(1100)
        rolar_ate(pg, '#h-rep', 18); pg.wait_for_timeout(2000)
        rolar_ate(pg, '#h-join', 18); pg.wait_for_timeout(2000)

    def celular(pg):
        pg.goto(BASE + 'index.html'); pg.wait_for_timeout(2200)
        rolar_ate(pg, '#h-about', 10); pg.wait_for_timeout(800)
        rolar_ate(pg, '#h-biz', 10); pg.wait_for_timeout(600)
        pg.locator('#svx-b-uniodonto').tap(); pg.wait_for_timeout(1200)
        pg.locator('#svx-b-boa-vista-scpc').tap(); pg.wait_for_timeout(1200)
        rolar_ate(pg, '#h-rep', 14); pg.wait_for_timeout(1400)
        rolar_ate(pg, '#h-join', 14); pg.wait_for_timeout(2000)

    def galeria(pg):
        pg.goto(BASE + 'auditorio.html'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelector('.gv').scrollIntoView({block: 'center'})"); pg.wait_for_timeout(600)
        for _ in range(3): pg.locator('.gv-next').click(); pg.wait_for_timeout(900)
        pg.locator('.gv-th a').nth(0).click(); pg.wait_for_timeout(1000)

    gravar('home-desktop-1440', 1440, 900, desktop)
    gravar('home-celular-390', 390, 844, celular)
    gravar('galeria-auditorio-1440', 1440, 900, galeria)
    nav.close()
print('quadros em', QD, '· gravações em', GR)
