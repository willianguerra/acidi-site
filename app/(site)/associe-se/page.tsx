import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Ico } from '@/components/Ico';
import { getBeneficios } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Associe-se' + SUF,
  description: "Benefícios de ser associado da ACIDI e formulário demonstrativo de interesse.",
};

export default async function Page() {
  const beneficios = await getBeneficios();
  return (<>
    <Header page="associe-se" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">Associe-se</li></ol></nav><header className="phead photo-head"><div className="wrap grid12">
<div className="t"><span className="kicker">Associe-se</span><h1 className="hl">Sua empresa <b>na rede da ACIDI</b></h1><p className="lead">Aproveite os benefícios de ser associado e as soluções da ACIDI para fazer sua empresa crescer. A rede de relacionamento é o ponto de partida.</p></div>
<figure className="pic" style={{ margin: "0" }}><div className="photo"><img src="/assets/img/feijoada-2024.jpg" alt="Associados reunidos no palco da segunda Feijoada da ACIDI" /></div><figcaption className="cap">Segunda Feijoada da ACIDI, julho de 2024.</figcaption></figure>
</div></header>
<section className="sec" aria-labelledby="h-ben"><div className="wrap grid12">
<div className="col-a" style={{ display: "grid", gap: "18px", alignContent: "start" }}><span className="kicker">Benefícios</span><h2 id="h-ben" className="hl sec-t">O que a associação <b>oferece</b></h2><p className="muted">Benefícios publicados pela ACIDI. Condições e valores são informados pela equipe.</p></div>
<ul className="idx col-b">{beneficios.map(b => <li key={b.titulo}><a href={b.href}><h3>{b.titulo}</h3><p>{b.texto}</p><span className="tag"></span><Ico n="go" cls="ico arr" /></a></li>)}</ul>
</div></section>
<section className="sec alt" aria-labelledby="h-int"><div className="wrap formwrap">
<div style={{ display: "grid", gap: "18px", alignContent: "start" }}>{' '}<span className="kicker">Como começar</span>{' '}<h2 id="h-int" className="hl sec-t">Fale com <b>a equipe</b></h2>
<p>A equipe da ACIDI apresenta as condições de associação e tira dúvidas sobre os serviços. Use o telefone ou o WhatsApp (47) 3333-8786, ou registre seu interesse no formulário.</p>
<div className="ctas"><a className="btn btn-s" href="https://api.whatsapp.com/send?phone=554733338786" target="_blank" rel="noopener">Falar pelo WhatsApp<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a><a className="tlink" href="/contato">Outros contatos</a></div>
</div>
<form className="demo" noValidate aria-labelledby="h-int">
<p className="demo-notice"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg><span><b>Formulário demonstrativo.</b> Os dados não são enviados nem armazenados.</span></p>
<div className="row2"><div className="field"><label htmlFor="as-nome">Nome</label><input type="text" id="as-nome" name="as-nome" data-rules="required" data-label="Nome" aria-describedby="as-nome-erro" autoComplete="name" /><p className="err" id="as-nome-erro"></p></div><div className="field"><label htmlFor="as-empresa">Empresa</label><input type="text" id="as-empresa" name="as-empresa" data-rules="required" data-label="Empresa" aria-describedby="as-empresa-erro" autoComplete="organization" /><p className="err" id="as-empresa-erro"></p></div></div>
<div className="row2"><div className="field"><label htmlFor="as-email">E-mail</label><input type="email" id="as-email" name="as-email" data-rules="required email" data-label="E-mail" aria-describedby="as-email-erro" autoComplete="email" /><p className="err" id="as-email-erro"></p></div><div className="field"><label htmlFor="as-tel">Telefone ou WhatsApp</label><p className="hint" id="as-tel-dica">Com DDD.</p><input type="tel" id="as-tel" name="as-tel" data-rules="required phone" data-label="Telefone ou WhatsApp" aria-describedby="as-tel-erro as-tel-dica" autoComplete="tel" /><p className="err" id="as-tel-erro"></p></div></div>
<div className="field"><label htmlFor="as-setor">Setor da empresa</label><select id="as-setor" name="as-setor" data-rules="required" data-label="Setor da empresa" aria-describedby="as-setor-erro"><option value="">Selecione</option><option>Indústria</option><option>Comércio</option><option>Prestação de serviços</option><option>Agricultura</option><option>Instituição financeira</option><option>Profissional liberal</option><option>Outro</option></select><p className="err" id="as-setor-erro"></p></div>
<fieldset className="field"><legend>Interesses <span className="opt">(opcional)</span></legend><div className="checks">
<label><input type="checkbox" name="as-int" defaultValue="Serviços com parceiros" /> Serviços com parceiros</label><label><input type="checkbox" name="as-int" defaultValue="Treinamentos e palestras" /> Treinamentos e palestras</label><label><input type="checkbox" name="as-int" defaultValue="Auditório e salas" /> Auditório e salas</label><label><input type="checkbox" name="as-int" defaultValue="Certificado de Origem" /> Certificado de Origem</label><label><input type="checkbox" name="as-int" defaultValue="Eventos e networking" /> Eventos e networking</label>
</div></fieldset>
<div className="field"><label htmlFor="as-msg">Mensagem <span className="opt">(opcional)</span></label><textarea id="as-msg" name="as-msg" data-rules="" data-label="Mensagem" aria-describedby="as-msg-erro"></textarea><p className="err" id="as-msg-erro"></p></div>
<div className="err-summary" tabIndex={-1} hidden></div>
<div className="done" tabIndex={-1} role="status" hidden><b>Demonstração concluída. Nenhum dado foi enviado.</b><p>Você pode alterar os campos e repetir a demonstração.</p></div>
<div className="form-actions"><button className="btn btn-p" type="submit">Concluir demonstração</button></div>
</form>
</div></section>
    </main>
    <Footer />
  </>);
}
