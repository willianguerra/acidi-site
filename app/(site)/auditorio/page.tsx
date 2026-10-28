import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Ico } from '@/components/Ico';
import { getGaleriaAuditorio } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Auditório e salas' + SUF,
  description: "Auditório para 170 pessoas e salas climatizadas na sede da ACIDI, em Indaial. Solicitação demonstrativa.",
};

export default async function Page() {
  const fotos = await getGaleriaAuditorio(), g0 = fotos[0];
  return (<>
    <Header page="auditorio" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li><a href="/para-seu-negocio">Para seu negócio</a></li><li aria-current="page">Auditório e salas</li></ol></nav><header className="phead"><div className="wrap grid12">
<div className="t"><span className="kicker">Para seu negócio · Espaços</span><h1 className="hl">Realize seu evento <b>na ACIDI</b></h1><p className="lead">Para atender associados e a comunidade, a ACIDI disponibiliza para locação salas para reuniões e treinamentos e seu auditório.</p></div>
</div></header>
<section className="sec tight"><div className="wrap" style={{ display: "grid", gap: "48px" }}>
<div className="gv" data-gv="">
<figure className="gv-main"><div className="photo"><img src={'/assets/img/' + g0.arquivo} alt={g0.alt} style={{ objectPosition: g0.pos }} width="900" height="601" /></div>
<figcaption><span className="gv-c" aria-live="polite"><b>1</b> / {fotos.length} · <span className="gv-t">{g0.alt}</span></span><span className="gv-nav" hidden><button type="button" className="gv-prev" aria-label="Foto anterior"><Ico n="back" /></button><button type="button" className="gv-next" aria-label="Próxima foto"><Ico n="go" /></button></span></figcaption></figure>
<ul className="gv-th">{fotos.map((f, k) => <li key={f.arquivo}><a href={'/assets/img/' + f.arquivo} data-pos={f.pos} aria-current={k === 0 ? 'true' : undefined}><img src={'/assets/img/' + f.arquivo} alt={f.alt} style={{ objectPosition: f.pos }} loading="lazy" /></a></li>)}</ul>
</div>
<div className="aud-info"><div className="keyfacts"><div><b>170</b><span>pessoas de capacidade no auditório</span></div><div><b>Salas</b><span>para reuniões, treinamentos e outras atividades</span></div><div><b>Climatizados</b><span>todos os espaços, com valor diferenciado para associados</span></div></div>
<p className="aud-contato"><span>Agendamento prévio com a equipe: <b><a href="tel:+554733338786">(47) 3333-8786</a></b> (telefone e WhatsApp)</span><a className="tlink" href="#h-sol">Solicitar pelo formulário</a></p></div>
</div></section>
<section className="sec alt" aria-labelledby="h-sol"><div className="wrap formwrap stack">
<div style={{ display: "grid", gap: "18px", alignContent: "start" }}>{' '}<span className="kicker">Solicitação</span>{' '}<h2 id="h-sol" className="hl sec-t">Solicite o uso <b>do espaço</b></h2>
<p>O uso dos espaços depende de agendamento prévio. Associados têm valor diferenciado.</p>
<p className="muted">Para reservar de fato, fale com a equipe pelo telefone ou WhatsApp (47) 3333-8786.</p>
<div><a className="btn btn-s" href="https://api.whatsapp.com/send?phone=554733338786" target="_blank" rel="noopener">Falar pelo WhatsApp<svg className="ico ext-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M8 7h9v9" /></svg><span className="sr"> (abre em nova aba)</span></a></div>
</div>
<form className="demo" noValidate aria-labelledby="h-sol">
<p className="demo-notice"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg><span><b>Formulário demonstrativo.</b> Os dados não são enviados nem armazenados. Nenhuma reserva é realizada.</span></p>
<div className="row2"><div className="field"><label htmlFor="aud-nome">Nome</label><input type="text" id="aud-nome" name="aud-nome" data-rules="required" data-label="Nome" aria-describedby="aud-nome-erro" autoComplete="name" /><p className="err" id="aud-nome-erro"></p></div><div className="field"><label htmlFor="aud-empresa">Empresa <span className="opt">(opcional)</span></label><input type="text" id="aud-empresa" name="aud-empresa" data-rules="" data-label="Empresa" aria-describedby="aud-empresa-erro" autoComplete="organization" /><p className="err" id="aud-empresa-erro"></p></div></div>
<div className="row2"><div className="field"><label htmlFor="aud-email">E-mail</label><input type="email" id="aud-email" name="aud-email" data-rules="required email" data-label="E-mail" aria-describedby="aud-email-erro" autoComplete="email" /><p className="err" id="aud-email-erro"></p></div><div className="field"><label htmlFor="aud-tel">Telefone</label><input type="tel" id="aud-tel" name="aud-tel" data-rules="required phone" data-label="Telefone" aria-describedby="aud-tel-erro aud-tel-dica" autoComplete="tel" /><p className="hint" id="aud-tel-dica">Com DDD.</p><p className="err" id="aud-tel-erro"></p></div></div>
<div className="row2"><div className="field"><label htmlFor="aud-espaco">Espaço</label><select id="aud-espaco" name="aud-espaco" data-rules="required" data-label="Espaço" aria-describedby="aud-espaco-erro"><option value="">Selecione</option><option>Auditório</option><option>Sala de reunião</option><option>Ainda não sei</option></select><p className="err" id="aud-espaco-erro"></p></div><div className="field"><label htmlFor="aud-associado">Empresa associada?</label><select id="aud-associado" name="aud-associado" data-rules="required" data-label="Empresa associada?" aria-describedby="aud-associado-erro"><option value="">Selecione</option><option>Sim</option><option>Não</option><option>Não sei</option></select><p className="err" id="aud-associado-erro"></p></div></div>
<div className="row2"><div className="field"><label htmlFor="aud-data">Data desejada</label><input type="date" id="aud-data" name="aud-data" data-rules="required date-future" data-label="Data desejada" aria-describedby="aud-data-erro aud-data-dica" /><p className="hint" id="aud-data-dica">A partir de hoje. A disponibilidade não é verificada nesta demonstração.</p><p className="err" id="aud-data-erro"></p></div><div className="field"><label htmlFor="aud-pessoas">Número estimado de pessoas <span className="opt">(opcional)</span></label><input type="number" id="aud-pessoas" name="aud-pessoas" data-rules="" data-label="Número estimado de pessoas" aria-describedby="aud-pessoas-erro aud-pessoas-dica" min="1" max="170" inputMode="numeric" /><p className="hint" id="aud-pessoas-dica">Auditório: até 170 pessoas.</p><p className="err" id="aud-pessoas-erro"></p></div></div>
<div className="field"><label htmlFor="aud-msg">Detalhes do evento <span className="opt">(opcional)</span></label><textarea id="aud-msg" name="aud-msg" data-rules="" data-label="Detalhes do evento" aria-describedby="aud-msg-erro aud-msg-dica"></textarea><p className="hint" id="aud-msg-dica">Horário, tipo de atividade e outras informações.</p><p className="err" id="aud-msg-erro"></p></div>
<div className="err-summary" tabIndex={-1} hidden></div>
<div className="done" tabIndex={-1} role="status" hidden><b>Demonstração concluída. Nenhum dado foi enviado.</b><p>Nenhuma reserva foi realizada.</p><p>Você pode alterar os campos e repetir a demonstração.</p></div>
<div className="form-actions"><button className="btn btn-p" type="submit">Concluir demonstração</button></div>
</form>
</div></section>
    </main>
    <Footer />
  </>);
}
