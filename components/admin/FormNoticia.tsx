'use client';
import { useActionState, useState } from 'react';
import { agirNoticia } from '@/app/(admin)/admin/(painel)/noticias/acoes';
import type { Bloco } from '@/lib/types';
import { Campo, Aviso } from './Campo';
import { EditorBlocos } from './EditorBlocos';
import { CaixaLateral } from './CaixaLateral';
import { AvisoSaida } from './AvisoSaida';
import { SITUACOES, type Situacao } from '@/lib/admin/fluxo';

export type DadosForm = {
  id: string | null; titulo: string; slug: string; data: string; resumo: string; imagem: string; alt: string; corpo: Bloco[];
  lidaEm: string; slugTravado: boolean;
};
export type Permissoes = { editar: boolean; enviar: boolean; publicar: boolean; devolver: boolean; despublicar: boolean; apagar: boolean };

const confirmar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };

export function FormNoticia({ n, pode, situacao, autor }: { n: DadosForm; pode: Permissoes; situacao?: Situacao; autor?: string | null }) {
  const [estado, acao, enviando] = useActionState(agirNoticia, undefined);
  const [devolvendo, setDevolvendo] = useState(false);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  const val = (k: keyof DadosForm) => v[k] ?? String(n[k] ?? '');
  const imagem = v.imagemAtual || n.imagem;
  const bloq = !pode.editar || enviando;
  return (
    <form action={acao} id="form-noticia" className="duas-colunas">
      <input type="hidden" name="id" value={n.id ?? ''} />
      <input type="hidden" name="lidaEm" value={n.lidaEm} />
      <input type="hidden" name="editavel" value={pode.editar ? '1' : ''} />
      <input type="hidden" name="imagemAtual" value={imagem} />
      <AvisoSaida formId="form-noticia" estado={estado} />
      <div className="principal">
        <fieldset disabled={bloq} className="caixa topo-form">
          <legend className="sr">Título e endereço</legend>
          <Aviso estado={estado} />
          <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={e.titulo} obrigatorio />
          <Campo nome="slug" rotulo="Endereço (slug)" valor={val('slug')} erro={e.slug} somenteLeitura={n.slugTravado}
            ajuda={n.slugTravado ? 'Travado depois da primeira publicação, para não quebrar links.' : 'Fica em /noticias/<endereço>. Em branco, é gerado a partir do título.'} />
        </fieldset>
        <fieldset disabled={bloq} className="caixa">
          <legend className="sr">Texto</legend>
          <EditorBlocos inicial={n.corpo} erro={e.corpo} desabilitado={!pode.editar} />
        </fieldset>
      </div>
      <div className="lateral">
        <CaixaLateral titulo="Publicação">
          <dl>
            <dt>Situação</dt><dd><span className={'selo ' + (situacao ?? 'rascunho')}>{SITUACOES[situacao ?? 'rascunho']}</span></dd>
            {autor && <><dt>Autor</dt><dd>{autor}</dd></>}
          </dl>
          <fieldset disabled={bloq} className="solto"><Campo nome="data" rotulo="Data" tipo="date" valor={val('data')} erro={e.data} obrigatorio /></fieldset>
          {devolvendo && <Campo nome="comentario" rotulo="O que precisa mudar?" tipo="textarea" erro={e.comentario} obrigatorio />}
          <div className="acoes">
            {n.id && <a className="bt sec" href={`/admin/previa/${n.id}`} target="_blank" rel="noopener">Prévia<span className="sr"> (abre em nova aba)</span></a>}
            {pode.editar && <button className="bt sec" name="acao" value="salvar" disabled={enviando}>Salvar</button>}
            {pode.enviar && <button className="bt largo" name="acao" value="enviar" disabled={enviando}>Enviar para revisão</button>}
            {pode.publicar && <button className="bt largo" name="acao" value="publicar" disabled={enviando}>Publicar</button>}
            {pode.devolver && (devolvendo
              ? <button className="bt sec largo" name="acao" value="devolver" disabled={enviando}>Confirmar devolução</button>
              : <button className="bt sec largo" type="button" onClick={() => setDevolvendo(true)}>Devolver com comentário</button>)}
            {pode.despublicar && <button className="bt sec" name="acao" value="despublicar" disabled={enviando} onClick={confirmar('Tirar esta notícia do site?')}>Despublicar</button>}
            {pode.apagar && <button className="bt perigo" name="acao" value="apagar" disabled={enviando} onClick={confirmar('Apagar esta notícia de vez? Não dá para desfazer.')}>Apagar</button>}
          </div>
        </CaixaLateral>
        <CaixaLateral titulo="Imagem de destaque">
          <fieldset disabled={bloq} className="solto">
            <div className="campo" data-erro={e.imagem ? '' : undefined}>
              <label htmlFor="foto">Foto{!imagem && <span aria-hidden="true"> *</span>}</label>
              {imagem && <img className="foto-atual" src={imagem} alt="" />}
              <input type="file" id="foto" name="foto" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" aria-invalid={e.imagem ? true : undefined} />
              <span className="ajuda" id="foto-ajuda">{imagem ? 'Envie outra para trocar. ' : ''}JPG, PNG ou WebP, até 8 MB.</span>
              {e.imagem && <span className="erro-campo">{e.imagem}</span>}
            </div>
            <Campo nome="alt" rotulo="Descrição da foto" valor={val('alt')} erro={e.alt} obrigatorio ajuda="Descreva o que aparece na foto, para quem usa leitor de tela." />
          </fieldset>
        </CaixaLateral>
        <CaixaLateral titulo="Resumo">
          <fieldset disabled={bloq} className="solto">
            <Campo nome="resumo" rotulo="Resumo" tipo="textarea" valor={val('resumo')} erro={e.resumo} ajuda="Aparece na lista de notícias, no topo da página e no Google." obrigatorio />
          </fieldset>
        </CaixaLateral>
      </div>
    </form>
  );
}
