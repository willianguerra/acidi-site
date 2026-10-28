"""Compara, rota a rota, o HTML do site estático antigo com o do app Next (JavaScript desligado).

Uso:  python testes/paridade.py ANTIGO NOVO [arquivo.html ...]
      python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/ historico.html
Sem arquivos, compara todas as rotas. Sai com código 1 se alguma divergir.
"""
import re, sys, difflib
from playwright.sync_api import sync_playwright

# Espelho de lib/rotas.ts (arquivo antigo -> rota nova)
PAGINAS = ['historico', 'diretoria', 'ex-presidentes', 'representatividade', 'nucleos', 'para-seu-negocio',
           'noticias', 'agenda', 'auditorio', 'associe-se', 'contato']
NOTICIAS = ['contabilidade-e-impacto-social', 'comitiva-visita-tecnica-maringa', 'acidi-itinerante', 'networkaffee',
            'encontro-de-liderancas-regionais', 'documento-voz-unica-municipal', 'segunda-feijoada-da-acidi',
            'encerramento-12-jogos-entre-empresas', 'acidi-35-anos-posse-da-diretoria', 'imposto-de-renda-impacto-social']
ROTAS = {'index.html': '/', **{p + '.html': '/' + p for p in PAGINAS}, **{f'noticia-{s}.html': f'/noticias/{s}' for s in NOTICIAS}}

EXTRAIR = """() => {
  document.querySelectorAll('script, next-route-announcer, template, [id^="__next"]').forEach(n => n.remove());
  // comentários de Suspense e a <div hidden> vazia que o Next põe no início do body
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT), cs = [];
  while (w.nextNode()) cs.push(w.currentNode);
  cs.forEach(c => c.remove());
  document.querySelectorAll('body > div[hidden]').forEach(d => { if (!d.innerHTML.trim()) d.remove(); });
  // a ordem dos atributos não muda nada; o React 19 põe name= por último nos campos
  document.body.querySelectorAll('*').forEach(el => {
    const at = [...el.attributes].map(a => [a.name, a.value]).sort((x, y) => x[0] < y[0] ? -1 : 1);
    at.forEach(([n]) => el.removeAttribute(n)); at.forEach(([n, v]) => el.setAttribute(n, v));
  });
  const d = document.querySelector('meta[name=description]');
  return { title: document.title, desc: d ? d.content : null, lang: document.documentElement.lang,
           bodyAttrs: [...document.body.attributes].map(a => a.name + '=' + a.value).join(' '), body: document.body.innerHTML };
}"""

def antigo_para_novo(html):
    def troca(m):
        attr, q, url = m.group(1), m.group(2), m.group(3)
        if url.startswith('assets/'): return f'{attr}={q}/{url}{q}'
        m2 = re.match(r'([^?#]*)(.*)', url)
        if m2.group(1) in ROTAS: return f'{attr}={q}{ROTAS[m2.group(1)]}{m2.group(2)}{q}'
        return m.group(0)
    html = re.sub(r'\b(href|src|poster)=(["\'])([^"\']*)\2', troca, html)
    return re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + re.sub(r'(^|,\s*)assets/', r'\1/assets/', m.group(1)) + '"', html)

def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'>\s+<', '><', s)).strip()

def linhas(s):
    return s.replace('><', '>\n<').split('\n')

def main():
    antigo, novo, arqs = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/'), sys.argv[3:] or list(ROTAS)
    falhas = 0
    with sync_playwright() as p:
        nav = p.chromium.launch(channel='msedge')
        ctx = nav.new_context(java_script_enabled=False)
        pg = ctx.new_page()
        for arq in arqs:
            r = pg.goto(antigo + arq)
            if not r or r.status != 200: print(f'FALHOU {arq} · antigo respondeu {r and r.status}'); falhas += 1; continue
            a = pg.evaluate(EXTRAIR)
            r = pg.goto(novo + ROTAS[arq])
            if not r or r.status != 200: print(f'FALHOU {arq} · novo respondeu {r and r.status}'); falhas += 1; continue
            b = pg.evaluate(EXTRAIR)
            a['body'] = norm(antigo_para_novo(a['body'])); b['body'] = norm(b['body'])
            dif = [k for k in a if a[k] != b[k]]
            if not dif: print('PASSOU ' + arq); continue
            falhas += 1
            print(f'FALHOU {arq} · difere em {", ".join(dif)}')
            for k in dif:
                if k == 'body':
                    d = list(difflib.unified_diff(linhas(a[k]), linhas(b[k]), 'antigo', 'novo', n=2, lineterm=''))
                    print('\n'.join(d[:60]) + ('\n  ...' if len(d) > 60 else ''))
                else:
                    print(f'  {k}: antigo={a[k]!r}\n  {" " * len(k)}  novo={b[k]!r}')
        nav.close()
    sys.exit(1 if falhas else 0)

if __name__ == '__main__':
    main()
