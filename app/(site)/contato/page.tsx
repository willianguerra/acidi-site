import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getAssuntosContato, getPaginaFixa } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('contato');
  return pagina('/contato', p.nome, p.descricao);
}

export default async function Page() {
  const c = (await getPaginaFixa('contato')).conteudo;
  const assuntos = await getAssuntosContato();
  return (<>
    <Header page="contato" />
    <main id="conteudo">
      <nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">Contato</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
      <section className="sec"><div className="wrap formwrap">
        <div style={{ display: "grid", gap: "28px", alignContent: "start" }}>
          <dl className="contact-list">
            <div><dt>Telefone e WhatsApp</dt><dd><a href="tel:+554733338786">(47) 3333-8786</a><small><a className="tlink" href="https://api.whatsapp.com/send?phone=554733338786" target="_blank" rel="noopener">Abrir conversa no WhatsApp<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
            <div><dt>E-mail</dt><dd><a href="mailto:contato@acidi.net">contato@acidi.net</a></dd></div>
            <div><dt>Endereço</dt><dd>Rua Ver. Alvin Rauh Júnior, 100<br />Nações, Indaial/SC · CEP 89082-065<small><a className="tlink" href="https://www.google.com/maps/search/?api=1&query=Rua+Vereador+Alvin+Rauh+J%C3%BAnior+100+Indaial+SC" target="_blank" rel="noopener">Abrir no mapa<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
            <div><dt>Redes sociais</dt><dd><small><a className="tlink" href="https://www.instagram.com/acidi.indaial/" target="_blank" rel="noopener">Instagram<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a>{'   '}<a className="tlink" href="https://www.facebook.com/acidinoticias" target="_blank" rel="noopener">Facebook<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
          </dl>
        </div>
        <form className="demo" noValidate aria-labelledby="h-form">
          <h2 id="h-form" className="hl" style={{ fontSize: "2rem" }}>Envie <b>uma mensagem</b></h2>
          <div className="row2"><div className="field"><label htmlFor="ct-nome">Nome</label><input type="text" id="ct-nome" name="ct-nome" data-rules="required" data-label="Nome" aria-describedby="ct-nome-erro" autoComplete="name" /><p className="err" id="ct-nome-erro"></p></div><div className="field"><label htmlFor="ct-email">E-mail</label><input type="email" id="ct-email" name="ct-email" data-rules="required email" data-label="E-mail" aria-describedby="ct-email-erro" autoComplete="email" /><p className="err" id="ct-email-erro"></p></div></div>
          <div className="row2"><div className="field"><label htmlFor="ct-tel">Telefone <span className="opt">(opcional)</span></label><input type="tel" id="ct-tel" name="ct-tel" data-rules="phone" data-label="Telefone" aria-describedby="ct-tel-erro ct-tel-dica" autoComplete="tel" /><p className="hint" id="ct-tel-dica">Com DDD.</p><p className="err" id="ct-tel-erro"></p></div><div className="field"><label htmlFor="ct-assunto">Assunto</label><select id="ct-assunto" name="ct-assunto" data-rules="required" data-label="Assunto" aria-describedby="ct-assunto-erro"><option value="">Selecione</option>{assuntos.map(x => <option key={x.slug} value={x.slug}>{x.rotulo}</option>)}</select><p className="err" id="ct-assunto-erro"></p></div></div>
          <div className="field"><label htmlFor="ct-msg">Mensagem</label><textarea id="ct-msg" name="ct-msg" data-rules="required min10" data-label="Mensagem" aria-describedby="ct-msg-erro"></textarea><p className="err" id="ct-msg-erro"></p></div>
          <input type="hidden" name="formulario" value="contato" /><div hidden><label>Não preencha<input type="text" name="site" tabIndex={-1} autoComplete="off" /></label></div>
<div className="err-summary" tabIndex={-1} hidden></div>
          <div className="done" tabIndex={-1} role="status" hidden><b>Mensagem enviada.</b><p>A equipe da ACIDI vai responder pelo e-mail ou telefone informado.</p></div>
          <div className="form-actions"><button className="btn btn-p" type="submit">Enviar</button></div>
        </form>
      </div></section>{' '}<script dangerouslySetInnerHTML={{ __html: "(function(){var a=new URLSearchParams(location.search).get('assunto'),s=document.getElementById('ct-assunto');if(a&&s&&s.querySelector('option[value=\"'+a.replace(/[^a-z0-9-]/g,'')+'\"]'))s.value=a;})();" }} />
    </main>
    <Footer />
  </>);
}
