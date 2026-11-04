"""Jornada completa do admin em navegador real (Microsoft Edge via Playwright).

Pré-requisitos: Postgres no ar com `npm run db:carga` feito, uma conta admin criada com
`npm run criar-admin` e o site rodando em produção (`npm run build && npm start`).
Uso:  python testes/admin.py
      BASE=http://localhost:3000/ ADMIN_EMAIL=... ADMIN_SENHA=... python testes/admin.py
Cada execução cria um editor e um revisor com e-mails novos; a notícia e o evento de teste
são apagados no fim, e o editor fica desativado.
"""
import os, sys, time, struct, zlib, tempfile, urllib.request, urllib.error
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:3000/').rstrip('/')
ADMIN = (os.environ.get('ADMIN_EMAIL', 'admin@acidi.test'), os.environ.get('ADMIN_SENHA', 'admin-local-123'))

def foto_grande():
    # PNG de ruído 1200x1000 (~3,6 MB, incompressível): do tamanho de uma foto de celular
    w, h = 1200, 1000
    bruto = b''.join(bytes(1) + os.urandom(w * 3) for _ in range(h))
    bloco = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    png = bytes([137, 80, 78, 71, 13, 10, 26, 10]) + bloco(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + bloco(b'IDAT', zlib.compress(bruto, 0)) + bloco(b'IEND', b'')
    caminho = os.path.join(tempfile.gettempdir(), 'acidi-foto-grande.png')
    with open(caminho, 'wb') as f: f.write(png)
    return caminho

FOTO = foto_grande()
SUFIXO = str(int(time.time()))
SENHA_PROV, SENHA_NOVA = 'provisoria-' + SUFIXO, 'definitiva-' + SUFIXO
TITULO, EVENTO = f'Notícia de teste {SUFIXO}', f'Evento de teste {SUFIXO}'
resultados, erros_console = [], []

def ok(nome, cond, detalhe=''):
    resultados.append(bool(cond))
    print(('PASSOU ' if cond else 'FALHOU ') + nome + (f' · {detalhe}' if detalhe else ''))

def get(caminho):
    try:
        with urllib.request.urlopen(BASE + caminho) as r: return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e: return e.code, ''

def chega(pg, padrao):
    try: pg.wait_for_url(padrao, timeout=10000); return True
    except Exception: return False

def pagina(nav):
    pg = nav.new_context(viewport={'width': 1280, 'height': 900}).new_page()
    pg.on('console', lambda m: m.type == 'error' and erros_console.append(f'{pg.url}: {m.text}'))
    pg.on('pageerror', lambda e: erros_console.append(f'{pg.url}: {e}'))
    pg.on('dialog', lambda d: d.accept())
    return pg

def entrar(pg, email, senha):
    pg.goto(BASE + '/admin/entrar'); pg.fill('#email', email); pg.fill('#senha', senha); pg.click('button[type=submit]')
    pg.wait_for_url(lambda u: '/admin/entrar' not in u)

def trocar_senha(pg):
    pg.fill('#atual', SENHA_PROV); pg.fill('#nova', SENHA_NOVA); pg.fill('#confirma', SENHA_NOVA); pg.click('button[type=submit]')
    pg.wait_for_url(BASE + '/admin')

def criar_conta(pg, nome, email, papel):
    pg.goto(BASE + '/admin/usuarios'); pg.click('summary')
    pg.fill('#nome', nome); pg.fill('#email', email); pg.select_option('#papel', papel); pg.fill('#senha', SENHA_PROV)
    pg.click('button:has-text("Criar conta")'); pg.wait_for_url('**/admin/usuarios/*?ok=criado')
    return pg.url.split('/admin/usuarios/')[1].split('?')[0]

def abrir_noticia(pg):
    pg.goto(BASE + '/admin/noticias?busca=' + SUFIXO); pg.click(f'text={TITULO}'); pg.wait_for_selector('main form'); pg.wait_for_load_state('networkidle')

with sync_playwright() as p:
    nav = p.chromium.launch(channel='msedge')
    adm, ed, rev = pagina(nav), pagina(nav), pagina(nav)

    # 1. admin cria as contas
    entrar(adm, *ADMIN)
    ok('Admin entra no painel', adm.url == BASE + '/admin')
    id_ed = criar_conta(adm, 'Edna Teste', f'editor{SUFIXO}@acidi.test', 'editor')
    criar_conta(adm, 'Rui Teste', f'revisor{SUFIXO}@acidi.test', 'revisor')
    ok('Admin cria editor e revisor', bool(id_ed))

    # 2. editor troca a senha provisória e escreve a notícia
    entrar(ed, f'editor{SUFIXO}@acidi.test', SENHA_PROV)
    ok('Senha provisória leva à troca obrigatória', chega(ed, '**/admin/trocar-senha'), ed.url)
    trocar_senha(ed)
    ok('Editor não vê Diretoria nem Usuários no menu', 'Diretoria' not in ed.inner_text('.barra nav') and 'Usuários' not in ed.inner_text('.barra nav'))
    ed.goto(BASE + '/admin/noticias/nova')
    ok('Editor não tem botão de publicar', ed.locator('button[value=publicar]').count() == 0)
    ed.fill('#titulo', TITULO); ed.fill('#resumo', 'Resumo de teste.'); ed.fill('#alt', 'Fachada da sede da ACIDI')
    ed.set_input_files('#foto', FOTO); ed.locator('.bloco textarea').first.fill('Primeiro parágrafo.')
    ed.click('button[value=enviar]'); ed.wait_for_url('**ok=enviada')
    ok('Editor envia a notícia para revisão', 'Em revisão' in ed.inner_text('.selo'))
    ok('Notícia em revisão não aparece no site', TITULO not in get('/noticias')[1])

    # 3. revisor devolve com comentário
    entrar(rev, f'revisor{SUFIXO}@acidi.test', SENHA_PROV); rev.wait_for_url('**/admin/trocar-senha'); trocar_senha(rev)
    ok('Revisor vê a notícia aguardando revisão no início', TITULO in rev.inner_text('#h-rev + ul, #h-rev ~ *'))
    abrir_noticia(rev)
    rev.click('text=Devolver ao autor'); rev.fill('#comentario', 'Inclua o horário do evento.'); rev.click('button[value=devolver]'); rev.wait_for_url('**ok=devolvida')
    ok('Revisor devolve com comentário', 'Devolvida' in rev.inner_text('.selo'))

    # 4. editor vê o comentário, corrige e reenvia
    ed.goto(BASE + '/admin')
    ok('Editor vê a devolução e o comentário no início', 'Inclua o horário do evento.' in ed.inner_text('main'))
    abrir_noticia(ed)
    ed.fill('#resumo', 'Resumo corrigido, com horário.'); ed.click('button[value=enviar]'); ed.wait_for_url('**ok=enviada')
    ok('Editor reenvia depois de corrigir', 'Em revisão' in ed.inner_text('.selo'))

    # 5. revisor publica e a notícia entra no site
    abrir_noticia(rev); rev.click('button[value=publicar]'); rev.wait_for_url('**ok=publicada')
    slug = rev.inner_text('main .meta a').split('/noticias/')[1]
    st, html = get('/noticias/' + slug)
    ok('Notícia publicada abre no site', st == 200 and 'Resumo corrigido, com horário.' in html, f'/noticias/{slug} {st}')
    ok('Notícia publicada aparece na home e na lista', TITULO in get('/')[1] and TITULO in get('/noticias')[1])
    img = rev.locator('.foto-atual').get_attribute('src')
    ok('Foto enviada é servida', get(img)[0] == 200, img)

    # 6. revisor despublica: some do site
    abrir_noticia(rev); rev.click('button[value=despublicar]'); rev.wait_for_url('**ok=despublicada')
    ok('Notícia despublicada responde 404', get('/noticias/' + slug)[0] == 404)
    ok('Notícia despublicada some da home e da lista', TITULO not in get('/')[1] and TITULO not in get('/noticias')[1])

    # 7. editor publica evento direto na agenda
    ed.goto(BASE + '/admin/agenda/novo')
    ed.fill('#titulo', EVENTO); ed.fill('#data', '2099-01-15'); ed.fill('#local', 'Auditório da ACIDI'); ed.fill('#descricao', 'Evento de teste.')
    ed.click('button[value=salvar]'); ed.wait_for_url('**ok=salvo')
    ok('Evento do editor aparece na agenda do site', EVENTO in get('/agenda')[1])

    # 8. editor é barrado nas áreas do admin
    for area in ('/admin/usuarios', '/admin/diretoria', '/admin/ex-presidentes'):
        ed.goto(BASE + area)
        ok(f'Editor é barrado em {area}', ed.url == BASE + '/admin', ed.url)

    # limpeza: apagar evento e notícia de teste
    ed.goto(BASE + '/admin/agenda'); ed.click(f'text={EVENTO}'); ed.click('button[value=apagar]'); ed.wait_for_url('**ok=apagado')
    ok('Evento apagado some da agenda', EVENTO not in get('/agenda')[1])
    abrir_noticia(rev); rev.click('button[value=apagar]'); rev.wait_for_url('**ok=apagada')

    # 9. admin desativa o editor: a próxima ação dele cai na tela de entrar
    adm.goto(BASE + f'/admin/usuarios/{id_ed}'); adm.click('button[value=desativar]'); adm.wait_for_url('**ok=desativar')
    ed.goto(BASE + '/admin/noticias')
    ok('Editor desativado perde a sessão', ed.url == BASE + '/admin/entrar', ed.url)
    ed.fill('#email', f'editor{SUFIXO}@acidi.test'); ed.fill('#senha', SENHA_NOVA); ed.click('button[type=submit]')
    ed.wait_for_selector('.aviso')
    ok('Editor desativado não entra de novo', ed.url.endswith('/admin/entrar'), ed.inner_text('.aviso'))

    # 10. tentativas repetidas de senha são barradas (e-mail próprio do teste, para não travar contas reais)
    alvo = f'ninguem{SUFIXO}@acidi.test'
    for _ in range(6):
        ed.goto(BASE + '/admin/entrar'); ed.fill('#email', alvo); ed.fill('#senha', 'senha-errada-123'); ed.click('button[type=submit]'); ed.wait_for_selector('.aviso')
    ok('Senha errada repetida é barrada', 'Muitas tentativas' in ed.inner_text('.aviso'), ed.inner_text('.aviso'))

    ok('Nenhum erro de console', not erros_console, '; '.join(erros_console[:3]))
    nav.close()

print(f'\n{sum(resultados)}/{len(resultados)} verificações passaram')
sys.exit(0 if all(resultados) else 1)
