import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getAssuntosContato } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Contato' + SUF,
  description: "Telefone, WhatsApp, e-mail e endereço da ACIDI, com formulário demonstrativo de contato.",
};

export default async function Page() {
  const assuntos = await getAssuntosContato();
  return (<>
    <Header page="contato" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">Contato</li></ol></nav><header className="phead"><div className="wrap grid12">
<div className="t"><span className="kicker">Contato</span><h1 className="hl">Fale <b>com a ACIDI</b></h1><p className="lead">Atendimento por telefone, WhatsApp e e-mail, e a sede no bairro Nações, em Indaial.</p></div>
</div></header>
<section className="sec"><div className="wrap formwrap">
<div style={{ display: "grid", gap: "28px", alignContent: "start" }}>
<dl className="contact-list">
<div><dt>Telefone e WhatsApp</dt><dd>(47) 3333-8786<small><a className="tlink" href="https://api.whatsapp.com/send?phone=554733338786" target="_blank" rel="noopener">Abrir conversa no WhatsApp<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
<div><dt>E-mail</dt><dd>contato@acidi.net</dd></div>
<div><dt>E-mail de comunicação</dt><dd>contato@acidi.net</dd></div>
<div><dt>Endereço</dt><dd>Rua Ver. Alvin Rauh Júnior, 100<br />Nações, Indaial/SC · CEP 89082-065<small><a className="tlink" href="https://www.google.com/maps/search/?api=1&query=Rua+Vereador+Alvin+Rauh+J%C3%BAnior+100+Indaial+SC" target="_blank" rel="noopener">Abrir no mapa<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
<div><dt>Redes sociais</dt><dd><small><a className="tlink" href="https://www.instagram.com/acidi.indaial/" target="_blank" rel="noopener">Instagram<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a>{'   '}<a className="tlink" href="https://www.facebook.com/acidinoticias" target="_blank" rel="noopener">Facebook<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></small></dd></div>
</dl>
</div>
<form className="demo" noValidate aria-labelledby="h-form">
<h2 id="h-form" className="hl" style={{ fontSize: "2rem" }}>Envie <b>uma mensagem</b></h2>
<p className="demo-notice"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg><span><b>Formulário demonstrativo.</b> Os dados não são enviados nem armazenados.</span></p>
<div className="row2"><div className="field"><label htmlFor="ct-nome">Nome</label><input type="text" id="ct-nome" name="ct-nome" data-rules="required" data-label="Nome" aria-describedby="ct-nome-erro" autoComplete="name" /><p className="err" id="ct-nome-erro"></p></div><div className="field"><label htmlFor="ct-email">E-mail</label><input type="email" id="ct-email" name="ct-email" data-rules="required email" data-label="E-mail" aria-describedby="ct-email-erro" autoComplete="email" /><p className="err" id="ct-email-erro"></p></div></div>
<div className="row2"><div className="field"><label htmlFor="ct-tel">Telefone <span className="opt">(opcional)</span></label><p className="hint" id="ct-tel-dica">Com DDD.</p><input type="tel" id="ct-tel" name="ct-tel" data-rules="phone" data-label="Telefone" aria-describedby="ct-tel-erro ct-tel-dica" autoComplete="tel" /><p className="err" id="ct-tel-erro"></p></div><div className="field"><label htmlFor="ct-assunto">Assunto</label><select id="ct-assunto" name="ct-assunto" data-rules="required" data-label="Assunto" aria-describedby="ct-assunto-erro"><option value="">Selecione</option>{assuntos.map(x => <option key={x.slug} value={x.slug}>{x.rotulo}</option>)}</select><p className="err" id="ct-assunto-erro"></p></div></div>
<div className="field"><label htmlFor="ct-msg">Mensagem</label><textarea id="ct-msg" name="ct-msg" data-rules="required min10" data-label="Mensagem" aria-describedby="ct-msg-erro"></textarea><p className="err" id="ct-msg-erro"></p></div>
<div className="err-summary" tabIndex={-1} hidden></div>
<div className="done" tabIndex={-1} role="status" hidden><b>Demonstração concluída. Nenhum dado foi enviado.</b><p>Você pode alterar os campos e repetir a demonstração.</p></div>
<div className="form-actions"><button className="btn btn-p" type="submit">Concluir demonstração</button></div>
</form>
</div></section>{' '}<script dangerouslySetInnerHTML={{ __html: "(function(){var a=new URLSearchParams(location.search).get('assunto'),s=document.getElementById('ct-assunto');if(a&&s&&s.querySelector('option[value=\"'+a.replace(/[^a-z0-9-]/g,'')+'\"]'))s.value=a;})();" }} />
    </main>
    <Footer />
  </>);
}
