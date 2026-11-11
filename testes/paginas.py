"""Jornada de páginas em uma instância local com banco de teste e carga inicial.

Execute com python testes/paginas.py, usando BASE, ADMIN_EMAIL e ADMIN_SENHA
como em testes/admin.py. Para verificar a recuperação após erro de banco,
defina DESCRICAO_ERRO_BANCO com o valor que o banco de teste deve rejeitar no INSERT.
"""
import os
from pathlib import Path
from uuid import uuid4

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:3000').rstrip('/')
FOTO = Path(__file__).resolve().parents[1] / 'public/assets/img/sede.jpg'
SLUG = 'teste-paginas-' + uuid4().hex[:10]
DESCRICAO_ERRO = os.environ.get('DESCRICAO_ERRO_BANCO')


with sync_playwright() as p:
    navegador = p.chromium.launch(channel='msedge')
    contexto = navegador.new_context()
    tela = contexto.new_page()
    erros = []
    tela.on('pageerror', lambda erro: erros.append(str(erro)))
    tela.on('dialog', lambda dialogo: dialogo.accept())
    tela.goto(BASE + '/admin/entrar')
    tela.fill('#email', os.environ.get('ADMIN_EMAIL', 'admin@acidi.test'))
    tela.fill('#senha', os.environ.get('ADMIN_SENHA', 'admin-local-123'))
    tela.click('button[type=submit]')
    tela.wait_for_url(BASE + '/admin')
    tela.goto(BASE + '/admin/paginas/nova')
    tela.wait_for_load_state('networkidle')

    expect(tela.get_by_role('group', name='Texto da página', exact=True)).to_have_count(1)
    expect(tela.get_by_role('group', name='Texto', exact=True)).to_have_count(0)
    for campo, texto in {
        'nome': 'Página de teste', 'slug': 'admin', 'titulo': 'Página de teste',
        'chamada': 'Chamada da página', 'descricao': 'Descrição da página',
    }.items():
        tela.fill('#' + campo, texto)
    tela.click('button:has-text("+ Parágrafo")')
    tela.locator('.bloco textarea').fill('Corpo da página.')
    tela.select_option('#menu', 'negocio')
    tela.click('button[value=salvar]')
    expect(tela.locator('#slug-erro')).to_have_text('Este endereço é reservado')
    expect(tela.locator('#menu')).to_have_value('negocio')

    tela.fill('#slug', SLUG)
    tela.fill('#fotoAlt', 'Sede da ACIDI')
    tela.set_input_files('#fotoArquivo', FOTO)
    foto = None
    if DESCRICAO_ERRO:
        tela.fill('#descricao', DESCRICAO_ERRO)
        tela.click('button[value=salvar]')
        expect(tela.locator('#form-pagina').get_by_role('alert')).to_contain_text('Não foi possível salvar agora')
        expect(tela.locator('#menu')).to_have_value('negocio')
        expect(tela.locator('#fotoArquivo')).to_have_value('')
        expect(tela.locator('.foto-atual')).to_be_visible()
        foto = tela.locator('.foto-atual').get_attribute('src')
        assert tela.request.get(BASE + foto).ok
        tela.fill('#descricao', 'Descrição da página')

    tela.click('button[value=salvar]')
    tela.wait_for_url('**/admin/paginas/*?ok=criada')
    tela.wait_for_load_state('networkidle')
    edicao = tela.url.split('?')[0]
    try:
        expect(tela.locator('#slug')).to_have_value(SLUG)
        assert not tela.locator('#slug').is_editable()
        if foto:
            expect(tela.locator('.foto-atual')).to_have_attribute('src', foto)
        publica = contexto.new_page()
        assert publica.goto(BASE + '/' + SLUG).status == 404

        aviso = tela.locator('#publicacao-menu')
        expect(aviso).to_contain_text('fica acessível pelo link')
        tela.select_option('#menu', value='')
        tela.click('button[value=salvar]')
        tela.wait_for_url('**?ok=salva')

        with tela.expect_popup() as popup:
            tela.get_by_role('link', name='Prévia').click()
        previa = popup.value
        expect(previa.locator('main h1')).to_have_text('Página de teste')
        expect(previa.locator('meta[name=robots]')).to_have_attribute('content', 'noindex, nofollow')

        expect(tela.get_by_role('button', name='Publicar')).to_have_accessible_description(
            'Se escolher “Nenhum” no menu, a página publicada fica acessível pelo link e não aparece no menu do site.'
        )
        tela.click('button[value=publicar]')
        tela.wait_for_url('**?ok=publicada')
        assert publica.goto(BASE + '/' + SLUG).ok
        assert publica.locator('main').inner_html() == previa.locator('main').inner_html()
        expect(publica.locator(f'header a[href="/{SLUG}"]')).to_have_count(0)

        tela.get_by_role('checkbox', name='Remover foto').check()
        tela.click('button[value=salvar]')
        tela.wait_for_url('**?ok=salva')
        expect(tela.locator('.foto-atual')).to_have_count(0)
        publica.reload()
        expect(publica.locator('main .phead img')).to_have_count(0)
        assert not erros, erros
    finally:
        tela.goto(edicao)
        tela.wait_for_load_state('networkidle')
        tela.click('button[value=apagar]')
        tela.wait_for_url('**/admin/paginas?ok=apagada')

    navegador.close()
    print('Jornada de páginas passou.')
