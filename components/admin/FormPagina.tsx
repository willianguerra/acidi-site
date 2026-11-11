'use client';
import { useActionState } from 'react';
import { agirPagina } from '@/app/(admin)/admin/(painel)/paginas/acoes';
import type { Bloco } from '@/lib/types';
import { Campo, Aviso } from './Campo';
import { EditorBlocos } from './EditorBlocos';
import { CaixaLateral } from './CaixaLateral';
import { AvisoSaida } from './AvisoSaida';
import { SITUACOES } from '@/lib/admin/fluxo';

export type DadosPagina = {
  id: string | null; situacao: 'rascunho' | 'publicada'; nome: string; slug: string; descricao: string; menu: '' | 'acidi' | 'negocio'; menuTexto: string;
  etiqueta: string; titulo: string; destaque: string; chamada: string; foto: string; fotoAlt: string; fotoLegenda: string;
  lateralTexto: string; botaoTexto: string; botaoHref: string; corpo: Bloco[]; lidaEm: string;
};
export type CamposPagina = { foto: boolean; lateral: boolean; corpo: boolean; fixa: boolean };
type Texto = Exclude<keyof DadosPagina, 'corpo'>;

const confirmar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };
const FORMATO = 'Use **negrito** e [texto](endereço).';

export function FormPagina({ p, campos }: { p: DadosPagina; campos: CamposPagina }) {
  const [estado, acao, enviando] = useActionState(agirPagina, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  const val = (k: Texto) => v[k] ?? String(p[k] ?? '');
  const foto = v.fotoAtual ?? p.foto;
  const publicada = p.situacao === 'publicada';
  // partes que a página fixa não usa seguem no envio com o valor atual, para não serem apagadas
  const guarda = (nomes: Texto[]) => nomes.map(n => <input key={n} type="hidden" name={n} value={val(n)} />);
  return (
    <form action={acao} id="form-pagina" className="duas-colunas">
      <input type="hidden" name="id" value={p.id ?? ''} />
      <input type="hidden" name="lidaEm" value={p.lidaEm} />
      <input type="hidden" name="fotoAtual" value={foto} />
      <AvisoSaida formId="form-pagina" estado={estado} />
      <div className="principal">
        <fieldset disabled={enviando} className="caixa topo-form">
          <legend className="sr">Cabeçalho da página</legend>
          <Aviso estado={estado} />
          {campos.fixa && <p className="ajuda">Formulário, galeria e listas desta página continuam fixos por enquanto.</p>}
          <Campo nome="etiqueta" rotulo="Etiqueta" valor={val('etiqueta')} erro={e.etiqueta} ajuda="Linha pequena acima do título." />
          <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={e.titulo} obrigatorio />
          <Campo nome="destaque" rotulo="Trecho em negrito do título" valor={val('destaque')} erro={e.destaque} />
          <Campo nome="chamada" rotulo="Chamada" tipo="textarea" valor={val('chamada')} erro={e.chamada} obrigatorio ajuda={FORMATO} />
          {campos.foto ? <>
            <div className="campo" data-erro={e.foto ? '' : undefined}>
              <label htmlFor="fotoArquivo">Foto do cabeçalho</label>
              {foto && <img className="foto-atual" src={foto} alt="" />}
              <input type="file" id="fotoArquivo" name="fotoArquivo" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" aria-invalid={e.foto ? true : undefined} />
              <span className="ajuda" id="foto-ajuda">{foto ? 'Envie outra para trocar. ' : ''}JPG, PNG ou WebP, até 8 MB.</span>
              {e.foto && <span className="erro-campo">{e.foto}</span>}
            </div>
            <Campo nome="fotoAlt" rotulo="Descrição da foto" valor={val('fotoAlt')} erro={e.fotoAlt} ajuda="Obrigatória quando há foto, para quem usa leitor de tela." />
            <Campo nome="fotoLegenda" rotulo="Legenda da foto" valor={val('fotoLegenda')} erro={e.fotoLegenda} ajuda={FORMATO} />
          </> : guarda(['fotoAlt', 'fotoLegenda'])}
        </fieldset>
        {campos.lateral ? (
          <fieldset disabled={enviando} className="caixa">
            <legend>Coluna lateral</legend>
            <Campo nome="lateralTexto" rotulo="Texto" tipo="textarea" valor={val('lateralTexto')} erro={e.lateralTexto} ajuda={FORMATO} />
            <Campo nome="botaoTexto" rotulo="Texto do botão" valor={val('botaoTexto')} erro={e.botaoTexto} />
            <Campo nome="botaoHref" rotulo="Endereço do botão" valor={val('botaoHref')} erro={e.botaoHref} ajuda="Aceita /, #, https://, http://, mailto: e tel:." />
          </fieldset>
        ) : guarda(['lateralTexto', 'botaoTexto', 'botaoHref'])}
        {campos.corpo
          ? <fieldset disabled={enviando} className="caixa"><legend className="sr">Texto</legend><EditorBlocos inicial={p.corpo} erro={e.corpo} desabilitado={enviando} titulo="Texto da página" obrigatorio={false} /></fieldset>
          : <input type="hidden" name="corpo" value={JSON.stringify(p.corpo)} />}
      </div>
      <div className="lateral">
        <CaixaLateral titulo="Publicação">
          <dl><dt>Situação</dt><dd><span className={'selo ' + p.situacao}>{SITUACOES[p.situacao]}</span></dd></dl>
          <div className="acoes">
            {p.id && !campos.fixa && <a className="bt sec" href={`/admin/previa/pagina/${p.id}`} target="_blank" rel="noopener">Prévia<span className="sr"> (abre em nova aba)</span></a>}
            {campos.fixa
              ? <button className="bt largo" name="acao" value="salvar" disabled={enviando}>Salvar</button>
              : <>
                <button className={'bt ' + (publicada ? 'largo' : 'sec')} name="acao" value="salvar" disabled={enviando}>{publicada ? 'Salvar' : 'Salvar rascunho'}</button>
                {!publicada && <button className="bt" name="acao" value="publicar" disabled={enviando}>Publicar</button>}
                {p.id && publicada && <button className="bt sec" name="acao" value="tirar" disabled={enviando} formNoValidate onClick={confirmar('Tirar esta página do ar?')}>Tirar do ar</button>}
                {p.id && <button className="bt perigo" name="acao" value="apagar" disabled={enviando} formNoValidate onClick={confirmar('Apagar esta página de vez? Não dá para desfazer.')}>Apagar</button>}
              </>}
          </div>
        </CaixaLateral>
        {!campos.fixa && <>
          <CaixaLateral titulo="Endereço">
            <fieldset disabled={enviando} className="solto">
              <Campo nome="slug" rotulo="Endereço" valor={val('slug')} erro={e.slug} somenteLeitura={!!p.id} obrigatorio={!p.id}
                ajuda={p.id ? 'Não muda depois de criada, para não quebrar links.' : 'Só letras minúsculas sem acento, números e hífens. A página fica em /<endereço>.'} />
            </fieldset>
          </CaixaLateral>
          <CaixaLateral titulo="Menu">
            <fieldset disabled={enviando} className="solto">
              <div className="campo" data-erro={e.menu ? '' : undefined}>
                <label htmlFor="menu">Aparece no menu</label>
                <select id="menu" name="menu" defaultValue={val('menu')}>
                  <option value="">Nenhum</option><option value="acidi">A ACIDI</option><option value="negocio">Para seu negócio</option>
                </select>
                {e.menu && <span className="erro-campo">{e.menu}</span>}
              </div>
              <Campo nome="menuTexto" rotulo="Frase no menu" valor={val('menuTexto')} erro={e.menuTexto} ajuda="Linha pequena abaixo do nome." />
            </fieldset>
          </CaixaLateral>
        </>}
        <CaixaLateral titulo="Nome e Google">
          <fieldset disabled={enviando} className="solto">
            <Campo nome="nome" rotulo="Nome" valor={val('nome')} erro={e.nome} obrigatorio ajuda="Aparece no menu, no caminho do topo e na aba do navegador." />
            <Campo nome="descricao" rotulo="Descrição para o Google" tipo="textarea" valor={val('descricao')} erro={e.descricao} obrigatorio ajuda="Até 300 caracteres." />
          </fieldset>
        </CaixaLateral>
      </div>
    </form>
  );
}
