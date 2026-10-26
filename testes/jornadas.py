"""Testes de jornada em navegador real (Microsoft Edge via Playwright) e capturas de tela.

Pré-requisitos: Python com o pacote playwright e o Microsoft Edge instalado.
Uso, com o servidor local rodando na pasta do site:
    python -m http.server 8766 --bind 127.0.0.1      (em um terminal)
    python testes/jornadas.py                          (em outro)
"""
import os, sys, datetime, pathlib
from playwright.sync_api import sync_playwright, expect

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BASE = os.environ.get('BASE', 'http://127.0.0.1:8766/')
CAPS = RAIZ / 'docs' / 'capturas'
CAPS.mkdir(parents=True, exist_ok=True)
resultados, erros_console, falhas_rede, envios = [], [], [], []

def ok(nome, cond, detalhe=''):
    resultados.append((nome, bool(cond), detalhe))
    print(('PASSOU ' if cond else 'FALHOU ') + nome + (f' · {detalhe}' if detalhe else ''))

def vigiar(page):
    page.on('console', lambda m: m.type == 'error' and erros_console.append(f'{page.url}: {m.text}'))
    page.on('pageerror', lambda e: erros_console.append(f'{page.url}: {e}'))
    page.on('requestfailed', lambda r: r.url.startswith(BASE) and falhas_rede.append(r.url))
    page.on('response', lambda r: r.url.startswith(BASE) and r.status >= 400 and falhas_rede.append(f'{r.status} {r.url}'))
    page.on('request', lambda r: r.method not in ('GET', 'HEAD') and envios.append(f'{r.method} {r.url}'))

def cap(page, nome, full=False):
    if full:  # captura de página inteira não rola a página: carrega as imagens tardias antes
        page.evaluate("Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); }))")
    page.wait_for_timeout(400)
    if full:  # full_page com emulação móvel repete o topo no fim; janela da altura da página evita isso
        vp = page.viewport_size
        page.set_viewport_size({'width': vp['width'], 'height': page.evaluate('document.documentElement.scrollHeight')})
        page.wait_for_timeout(400)
        page.screenshot(path=str(CAPS / f'{nome}.jpg'), type='jpeg', quality=72)
        page.set_viewport_size(vp)
        return
    page.screenshot(path=str(CAPS / f'{nome}.jpg'), type='jpeg', quality=72)

with sync_playwright() as p:
    nav = p.chromium.launch(channel='msedge')

    # ---------------- desktop 1440
    ctx = nav.new_context(viewport={'width': 1440, 'height': 900}, locale='pt-BR')
    pg = ctx.new_page(); vigiar(pg)
    pg.goto(BASE + 'index.html'); pg.wait_for_load_state('networkidle')
    cap(pg, 'desktop-01-inicio'); cap(pg, 'desktop-00-inicio-pagina-inteira', full=True)

    # Jornada 1: Home -> Associe-se -> validação -> conclusão
    pg.locator('.hero .btn-p').click(); pg.wait_for_url('**/associe-se.html')
    ok('Home → Associe-se', pg.url.endswith('associe-se.html'))
    form = pg.locator('form.demo')
    ok('Associe-se: aviso demonstrativo visível antes do envio', form.locator('.demo-notice').is_visible())
    form.locator('button[type=submit]').click()
    ok('Associe-se: envio vazio mostra resumo de erros focado', pg.evaluate("document.activeElement.classList.contains('err-summary')"))
    ok('Associe-se: campos obrigatórios marcados', pg.locator('#as-nome[aria-invalid=true]').count() == 1 and pg.locator('#as-setor[aria-invalid=true]').count() == 1)
    ok('Associe-se: conclusão oculta enquanto há erros', pg.locator('form.demo .done').is_hidden())
    cap(pg, 'desktop-05-associe-se-erros')
    pg.fill('#as-nome', 'Maria Teste'); pg.fill('#as-empresa', 'Empresa Exemplo'); pg.fill('#as-email', 'maria@'); pg.fill('#as-tel', '47 3333')
    form.locator('button[type=submit]').click()
    ok('Associe-se: e-mail inválido explicado', 'e-mail válido' in pg.inner_text('#as-email-erro'))
    ok('Associe-se: telefone sem DDD explicado', 'DDD' in pg.inner_text('#as-tel-erro'))
    pg.fill('#as-email', 'maria@empresa.com.br'); pg.fill('#as-tel', '(47) 3333-8786'); pg.select_option('#as-setor', 'Comércio')
    form.locator('button[type=submit]').click()
    done = form.locator('.done')
    ok('Associe-se: conclusão demonstrativa', done.is_visible() and 'Demonstração concluída. Nenhum dado foi enviado.' in done.inner_text())
    ok('Associe-se: sem "enviada com sucesso"', 'sucesso' not in done.inner_text().lower())
    ok('Associe-se: dados preservados para repetir', pg.input_value('#as-nome') == 'Maria Teste')
    cap(pg, 'desktop-06-associe-se-concluido')

    # Jornada 2: menu A ACIDI -> páginas institucionais -> volta à home (mouse e teclado)
    pg.goto(BASE + 'index.html')
    pg.locator('button[aria-controls=m-acidi]').click()
    ok('Menu A ACIDI abre por clique', pg.locator('#m-acidi').is_visible())
    cap(pg, 'desktop-02-menu-a-acidi')
    pg.locator('#m-acidi a[href="diretoria.html"]').click(); pg.wait_for_url('**/diretoria.html')
    ok('Menu → Diretoria', 'Gestão' in pg.inner_text('h1'))
    cap(pg, 'desktop-03-diretoria')
    btn = pg.locator('button[aria-controls=m-acidi]'); btn.focus(); pg.keyboard.press('Enter')
    ok('Menu abre pelo teclado', pg.locator('#m-acidi').is_visible())
    pg.keyboard.press('Tab')
    ok('Tab entra no painel', pg.evaluate("!!document.activeElement.closest('#m-acidi')"))
    pg.keyboard.press('Escape')
    ok('Escape fecha e devolve o foco ao botão', pg.locator('#m-acidi').is_hidden() and pg.evaluate("document.activeElement.getAttribute('aria-controls')") == 'm-acidi')
    for href in ['historico.html', 'ex-presidentes.html', 'representatividade.html', 'nucleos.html']:
        pg.locator('button[aria-controls=m-acidi]').click(); pg.locator(f'#m-acidi a[href="{href}"]').click(); pg.wait_for_url('**/' + href)
        ok(f'Menu → {href}', pg.locator('h1').is_visible() and pg.locator('[aria-current=page]').count() >= 1)
    pg.locator('a.brand').click(); pg.wait_for_url('**/index.html')
    ok('Logo volta à home', pg.url.endswith('index.html'))

    # Jornada 3: serviços -> detalhe -> contato com assunto preenchido
    pg.goto(BASE + 'index.html')
    svx = pg.locator('[data-svx]')
    ok('Serviços: primeiro serviço selecionado no início', svx.locator('#svx-b-util-card').get_attribute('aria-expanded') == 'true' and pg.locator('#svx-util-card').is_visible())
    alt0 = pg.evaluate("document.querySelector('.biz').offsetHeight")
    svx.locator('#svx-b-uniodonto').click(); pg.wait_for_timeout(400)
    vis = pg.evaluate("[...document.querySelectorAll('.svx-p')].filter(p => getComputedStyle(p).visibility === 'visible').map(p => p.id)")
    ok('Serviços: clique troca o painel (um visível)', vis == ['svx-uniodonto'] and svx.locator('#svx-b-util-card').get_attribute('aria-expanded') == 'false', str(vis))
    ok('Serviços: troca não muda a altura da seção', pg.evaluate("document.querySelector('.biz').offsetHeight") == alt0)
    ok('Serviços: marcador acompanha o item', pg.evaluate("Math.abs(document.querySelector('.svx-mark').getBoundingClientRect().top - document.querySelector('#svx-b-uniodonto').getBoundingClientRect().top) < 2"))
    ok('Serviços: painel inativo fora da ordem de foco', pg.evaluate("document.getElementById('svx-util-card').inert === true"))
    svx.locator('#svx-b-uniodonto').focus(); pg.keyboard.press('ArrowDown'); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    ok('Serviços: teclado (seta + Enter) seleciona', pg.evaluate("document.activeElement.id") == 'svx-b-boa-vista-scpc' and pg.locator('#svx-boa-vista-scpc').is_visible())
    pg.keyboard.press('End'); ok('Serviços: End leva ao último', pg.evaluate("document.activeElement.id") == 'svx-b-xml-empresarial')
    svx.locator('#svx-b-uniodonto').click(); pg.wait_for_timeout(400)
    pg.locator('#svx-uniodonto a[href$="#uniodonto"]').click(); pg.wait_for_url('**/para-seu-negocio.html#uniodonto')
    ok('Serviço na home → detalhe com âncora', pg.locator('#uniodonto').is_visible())
    cap(pg, 'desktop-07-para-seu-negocio')
    pg.locator('#uniodonto a[href*="contato.html"]').click(); pg.wait_for_url('**/contato.html?assunto=uniodonto')
    ok('Detalhe → contato com assunto selecionado', pg.input_value('#ct-assunto') == 'uniodonto')

    # Jornada 7: contato com erros e conclusão
    pg.select_option('#ct-assunto', '')
    pg.locator('form.demo button[type=submit]').click()
    n_err = pg.locator('form.demo [aria-invalid=true]').count()
    ok('Contato: erros nos obrigatórios', n_err == 4, f'{n_err} campos inválidos')
    ok('Contato: conclusão oculta enquanto há erros', pg.locator('form.demo .done').is_hidden())
    pg.fill('#ct-nome', 'João'); pg.fill('#ct-email', 'joao@empresa.com'); pg.fill('#ct-tel', '123'); pg.select_option('#ct-assunto', 'outro'); pg.fill('#ct-msg', 'curta')
    pg.locator('form.demo button[type=submit]').click()
    ok('Contato: telefone opcional inválido e mensagem curta apontados', pg.locator('#ct-tel[aria-invalid=true]').count() == 1 and pg.locator('#ct-msg[aria-invalid=true]').count() == 1)
    cap(pg, 'desktop-08-contato-erros')
    pg.fill('#ct-tel', ''); pg.fill('#ct-msg', 'Gostaria de saber mais sobre a ACIDI.')
    pg.locator('form.demo button[type=submit]').click()
    ok('Contato: conclusão demonstrativa', pg.locator('form.demo .done').is_visible())

    # Jornada 4: notícias -> matéria -> volta
    pg.goto(BASE + 'noticias.html'); cap(pg, 'desktop-09-noticias')
    first = pg.locator('.news-list .story').first; titulo = first.locator('h3').inner_text()
    first.click(); pg.wait_for_url('**/noticia-*.html')
    h1, n_p, data = pg.inner_text('article h1'), pg.locator('.prose p').count(), pg.inner_text('time.date')
    ok('Notícias → matéria completa', h1.strip() == titulo.strip() and n_p >= 3 and 'publicado em' in data.lower(), f'{h1!r} | {titulo!r} | {n_p} parágrafos | {data}')
    cap(pg, 'desktop-10-noticia')
    pg.locator('.article-body .meta a[href="noticias.html"]').click(); pg.wait_for_url('**/noticias.html')
    ok('Matéria → volta à listagem', pg.url.endswith('noticias.html'))

    # Jornada 5: agenda na data real
    pg.goto(BASE + 'agenda.html')
    ok('Agenda: sem eventos vencidos em Próximos', pg.locator('[data-upcoming] .ev:visible').count() == 0 and pg.locator('[data-empty]').is_visible())
    ok('Agenda: arquivo com 6 registros', pg.locator('[data-past] .ev').count() == 6 and pg.inner_text('[data-past-count]') == '6')
    cap(pg, 'desktop-11-agenda')
    pg.goto(BASE + 'nucleos.html'); pg.locator('a[href^="agenda.html#evento-2022-05-18"]').first.click()
    ok('Núcleos → detalhe do evento no arquivo', pg.evaluate("location.hash.startsWith('#evento-2022-05-18') && !!document.querySelector(location.hash)"))

    # Jornada 6: auditório
    pg.goto(BASE + 'auditorio.html'); cap(pg, 'desktop-12-auditorio')
    ontem = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    pg.fill('#aud-nome', 'Ana'); pg.fill('#aud-email', 'ana@empresa.com'); pg.fill('#aud-tel', '(47) 99999-0000')
    pg.select_option('#aud-espaco', 'Auditório'); pg.select_option('#aud-associado', 'Sim'); pg.fill('#aud-data', ontem)
    pg.locator('form.demo button[type=submit]').click()
    ok('Auditório: data passada rejeitada', 'a partir de hoje' in pg.inner_text('#aud-data-erro'))
    pg.fill('#aud-data', (datetime.date.today() + datetime.timedelta(days=20)).isoformat())
    pg.locator('form.demo button[type=submit]').click()
    t = pg.inner_text('form.demo .done')
    ok('Auditório: conclusão sem reserva', 'Nenhum dado foi enviado' in t and 'Nenhuma reserva foi realizada' in t and 'confirmad' not in t.lower())
    cap(pg, 'desktop-13-auditorio-concluido')
    # Galeria: só navegação manual
    pg.goto(BASE + 'auditorio.html'); src0 = pg.get_attribute('.gv-main img', 'src')
    pg.wait_for_timeout(5000)
    ok('Galeria: não troca sozinha', pg.get_attribute('.gv-main img', 'src') == src0)
    pg.locator('.gv-next').click(); pg.wait_for_timeout(400)
    ok('Galeria: próxima foto por botão', pg.get_attribute('.gv-main img', 'src').endswith('auditorio-2.jpg') and pg.inner_text('.gv-c b') == '2' and pg.locator('.gv-th a').nth(1).get_attribute('aria-current') == 'true')
    pg.locator('.gv-th a').nth(4).click(); pg.wait_for_timeout(400)
    ok('Galeria: miniatura escolhe a foto', pg.get_attribute('.gv-main img', 'src').endswith('auditorio-5.jpg'))
    pg.locator('.gv-th a').nth(4).focus(); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
    ok('Galeria: seta do teclado avança', pg.get_attribute('.gv-main img', 'src').endswith('auditorio-6.jpg'))

    # Recarregar páginas internas diretamente
    for f in ['diretoria.html', 'noticia-acidi-itinerante.html', 'contato.html']:
        pg.goto(BASE + f); pg.reload(); pg.wait_for_load_state('networkidle')
        ok(f'Recarga direta de {f}', pg.locator('img.brand, a.brand img').first.evaluate('i => i.naturalWidth > 0'))
    ctx.close()

    # ---------------- agenda com outra data (classificação em tempo de execução)
    ctx = nav.new_context(viewport={'width': 1440, 'height': 900})
    pg = ctx.new_page(); vigiar(pg)
    pg.clock.set_fixed_time(datetime.datetime(2022, 5, 20, 12, 0))
    pg.goto(BASE + 'agenda.html')
    datas = pg.eval_on_selector_all('[data-upcoming] .ev', 'els => els.map(e => e.dataset.date)')
    ok('Agenda recalcula pela data do navegador (simulando 20/05/2022)', datas == ['2022-05-31', '2026-02-25'], str(datas))
    ok('Agenda: aviso "nenhum evento" oculto quando há próximos', pg.locator('[data-empty]').is_hidden() and pg.locator('[data-upcoming]').is_visible())
    pg.goto(BASE + 'index.html')
    ok('Home: próximos eventos aparecem quando existem', pg.locator('.agenda-box [data-upcoming] .ev:visible').count() == 2 and pg.locator('.agenda-box [data-empty]').is_hidden())
    ctx.close()

    # ---------------- tablet 768 e celular 390 / 320
    for w, h, nome in [(768, 1024, 'tablet'), (390, 844, 'celular'), (320, 640, 'celular320')]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, is_mobile=w < 700, has_touch=w < 700, device_scale_factor=2 if w < 700 else 1)
        pg = ctx.new_page(); vigiar(pg)
        pg.goto(BASE + 'index.html'); pg.wait_for_load_state('networkidle')
        ok(f'{w}px: sem rolagem horizontal na home', pg.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        cap(pg, f'{nome}-01-inicio')
        if w < 700:
            ok(f'{w}px: título vem antes das fotos e as fotos antes do botão', pg.evaluate("(() => { const t = document.querySelector('.hero h1').getBoundingClientRect(), s = document.querySelector('.stage').getBoundingClientRect(), b = document.querySelector('.hero .btn-p').getBoundingClientRect(); return t.bottom <= s.top && s.bottom <= b.top; })()"))
            ok(f'{w}px: barra fixa oculta com o botão da abertura visível', pg.evaluate("getComputedStyle(document.querySelector('.mbar')).visibility") == 'hidden')
            pg.evaluate("document.querySelector('#h-about').scrollIntoView()"); pg.wait_for_timeout(500)
            ok(f'{w}px: barra fixa aparece depois da abertura', pg.evaluate("getComputedStyle(document.querySelector('.mbar')).visibility") == 'visible')
            b1 = pg.locator('#svx-b-uniodonto'); b1.scroll_into_view_if_needed()
            ok(f'{w}px: serviços começam recolhidos', pg.locator('.svx-p:visible').count() == 0)
            b1.tap(); pg.wait_for_timeout(300)
            ok(f'{w}px: toque abre o serviço logo abaixo do item', pg.locator('#svx-uniodonto').is_visible() and pg.evaluate("document.getElementById('svx-uniodonto').getBoundingClientRect().top >= document.getElementById('svx-b-uniodonto').getBoundingClientRect().bottom - 1"))
            pg.locator('#svx-b-protesto-expresso').tap(); pg.wait_for_timeout(300)
            ok(f'{w}px: abrir outro fecha o anterior', pg.locator('.svx-p:visible').count() == 1 and pg.locator('#svx-protesto-expresso').is_visible())
            pg.locator('#svx-b-protesto-expresso').tap(); pg.wait_for_timeout(300)
            ok(f'{w}px: tocar no aberto recolhe', pg.locator('.svx-p:visible').count() == 0)
            if nome == 'celular':
                pg.locator('#svx-b-uniodonto').tap(); pg.wait_for_timeout(300); pg.locator('#svx-b-uniodonto').scroll_into_view_if_needed(); cap(pg, 'celular-01b-servicos')
            pg.evaluate('scrollTo(0, 0)')
        burger = pg.locator('header.site .burger')
        burger.tap() if w < 700 else burger.click()
        ok(f'{w}px: menu móvel abre como modal', pg.evaluate("document.getElementById('menu-movel').open && document.activeElement.closest('#menu-movel') !== null"))
        if nome == 'celular': cap(pg, 'celular-02-menu')
        for _ in range(25): pg.keyboard.press('Tab')
        ok(f'{w}px: foco contido no menu', pg.evaluate("document.activeElement.closest('#menu-movel') !== null"))
        ok(f'{w}px: fundo inerte (toque cai no menu)', pg.evaluate("document.elementFromPoint(innerWidth/2, innerHeight-30).closest('#menu-movel') !== null"))
        pg.keyboard.press('Escape')
        ok(f'{w}px: Escape fecha e devolve o foco', pg.evaluate("!document.getElementById('menu-movel').open && document.activeElement.classList.contains('burger')"))
        burger.click(); pg.locator('#menu-movel a[href="noticias.html"]').click(); pg.wait_for_url('**/noticias.html')
        ok(f'{w}px: navegação pelo menu móvel', pg.url.endswith('noticias.html'))
        if nome != 'tablet':
            # barra fixa não pode cobrir o fim do conteúdo
            pg.evaluate('scrollTo(0, document.body.scrollHeight)')
            cover = pg.evaluate("(() => { const b = document.querySelector('.mbar').getBoundingClientRect(); const f = document.querySelector('footer .base').getBoundingClientRect(); return f.bottom <= b.top + 1 || f.top >= b.bottom; })()")
            ok(f'{w}px: barra fixa não cobre o rodapé', cover)
        for f, n in [('diretoria.html', '03-diretoria'), ('noticia-segunda-feijoada-da-acidi.html', '04-noticia'), ('agenda.html', '05-agenda'), ('auditorio.html', '06-auditorio'), ('contato.html', '07-contato')]:
            pg.goto(BASE + f); pg.wait_for_load_state('networkidle')
            ok(f'{w}px: sem rolagem horizontal em {f}', pg.evaluate('document.documentElement.scrollWidth <= innerWidth'))
            if nome == 'celular': cap(pg, f'celular-{n}')
        if nome == 'celular':
            pg.goto(BASE + 'associe-se.html'); pg.locator('form.demo').scroll_into_view_if_needed()
            pg.locator('form.demo button[type=submit]').tap(); cap(pg, 'celular-08-associe-se-erros')
        ctx.close()
    # página inteira do celular em 1x: em 2x a imagem passa de 16.384 px e o Chromium repete blocos
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=1)
    pg = ctx.new_page(); vigiar(pg); pg.goto(BASE + 'index.html'); pg.wait_for_load_state('networkidle')
    cap(pg, 'celular-00-inicio-pagina-inteira', full=True); ctx.close()

    # ---------------- movimento reduzido: composição final imediata, funções iguais
    ctx = nav.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    pg = ctx.new_page(); vigiar(pg); pg.goto(BASE + 'index.html')
    ok('Reduzido: fotos da abertura já no lugar final', pg.evaluate("[...document.querySelectorAll('.ph')].every(f => getComputedStyle(f).opacity === '1' && getComputedStyle(f).transform === 'none')"))
    ok('Reduzido: atuação e fechamento já desenhados', pg.evaluate("[...document.querySelectorAll('[data-anim]')].every(e => e.classList.contains('on'))"))
    pg.locator('#svx-b-xml-empresarial').click()
    ok('Reduzido: serviços continuam selecionáveis', pg.locator('#svx-xml-empresarial').is_visible())
    ctx.close()

    # ---------------- sem JavaScript: conteúdo completo e navegável
    ctx = nav.new_context(viewport={'width': 1440, 'height': 900}, java_script_enabled=False)
    pg = ctx.new_page(); pg.goto(BASE + 'index.html')
    ok('Sem JS: abertura com título, botão e fotos', pg.locator('.hero h1').is_visible() and pg.locator('.hero .btn-p').is_visible() and pg.locator('.ph img').count() == 3)
    ok('Sem JS: os 7 serviços visíveis em cartões', pg.locator('.svx-p:visible').count() == 7 and pg.locator('.svx-b:visible').count() == 0)
    ok('Sem JS: ondas e arco já desenhados', pg.evaluate("getComputedStyle(document.querySelector('.ondas .o3')).strokeDashoffset === '0px'"))
    pg.locator('#h-biz').scroll_into_view_if_needed(); cap(pg, 'desktop-14-sem-js-servicos')
    pg.goto(BASE + 'auditorio.html')
    ok('Sem JS: miniaturas da galeria abrem a imagem', pg.locator('.gv-th a[href$="auditorio-3.jpg"]').count() == 1 and pg.locator('.gv-nav').is_hidden())
    ctx.close()
    nav.close()

ok('Nenhum erro no console', not erros_console, '; '.join(erros_console[:5]))
ok('Nenhum recurso local quebrado', not falhas_rede, '; '.join(falhas_rede[:5]))
ok('Nenhum dado transmitido (só GET)', not envios, '; '.join(envios[:5]))
falhou = [r for r in resultados if not r[1]]
print(f'\n{len(resultados) - len(falhou)}/{len(resultados)} verificações passaram')
sys.exit(1 if falhou else 0)
