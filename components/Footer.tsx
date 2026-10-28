import { Ext } from './Ico';
import { INSTA, FACE, WHATS } from '@/content/links';

export function Footer() {
  return (<>
    <footer className="site on-dark">
      <div className="wrap cols">
        <div className="fbrand"><span className="logo-w"><img src="/assets/img/logo.png" width="151" height="40" alt="ACIDI" /></span><p>Conectando empresas, pessoas e oportunidades desde 1989.</p><p className="soc"><a href={INSTA} target="_blank" rel="noopener" aria-label="Instagram da ACIDI (abre em nova aba)"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></svg></a><a href={FACE} target="_blank" rel="noopener" aria-label="Facebook da ACIDI (abre em nova aba)"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M13.5 21v-7h2.5l.4-3h-2.9V9.3c0-.9.3-1.4 1.5-1.4h1.5V5.3a19 19 0 00-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7" /></svg></a></p></div>
        <div><h2>A ACIDI</h2><ul><li><a href="/historico">Histórico</a></li><li><a href="/diretoria">Diretoria</a></li><li><a href="/ex-presidentes">Ex-Presidentes</a></li><li><a href="/representatividade">Representatividade</a></li><li><a href="/nucleos">Núcleos</a></li></ul></div>
        <div><h2>Para sua empresa</h2><ul><li><a href="/para-seu-negocio">Serviços e benefícios</a></li><li><a href="/auditorio">Auditório e salas</a></li><li><a href="/associe-se">Associe-se</a></li></ul></div>
        <div><h2>Acompanhe</h2><ul><li><a href="/noticias">Notícias</a></li><li><a href="/agenda">Agenda</a></li><li><a href="/contato">Contato</a></li><li><Ext href={INSTA}>Instagram</Ext></li><li><Ext href={FACE}>Facebook</Ext></li></ul></div>
      </div>
      <div className="wrap"><p className="big" aria-hidden="true">Juntos somos <b>mais fortes.</b></p></div>
      <div className="wrap base"><span>© 2026 ACIDI · Associação Empresarial de Indaial · Versão demonstrativa</span><a href="#topo" className="top">Voltar ao topo <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M6 11l6-6 6 6" /></svg></a></div>
    </footer>
    <div className="mbar"><a className="btn btn-p" href="/associe-se">Associe sua empresa</a><Ext href={WHATS} cls="btn btn-s">WhatsApp</Ext></div>
  </>);
}
