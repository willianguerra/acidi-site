'use client';
import { useActionState, useState } from 'react';
import { agirNoticia } from '@/app/(admin)/admin/(painel)/noticias/acoes';
import type { Bloco } from '@/lib/types';
import { Campo, Aviso } from './Campo';
import { EditorBlocos } from './EditorBlocos';

export type DadosForm = {
  id: string | null; titulo: string; slug: string; data: string; resumo: string; imagem: string; alt: string; corpo: Bloco[];
  lidaEm: string; slugTravado: boolean;
};
export type Permissoes = { editar: boolean; enviar: boolean; publicar: boolean; devolver: boolean; despublicar: boolean; apagar: boolean };

const confirmar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };

export function FormNoticia({ n, pode }: { n: DadosForm; pode: Permissoes }) {
  const [estado, acao, enviando] = useActionState(agirNoticia, undefined);
  const [devolvendo, setDevolvendo] = useState(false);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  const val = (k: keyof DadosForm) => v[k] ?? String(n[k] ?? '');
  const imagem = v.imagemAtual || n.imagem;
  return (
    <form action={acao} className="form" encType="multipart/form-data">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={n.id ?? ''} />
      <input type="hidden" name="lidaEm" value={n.lidaEm} />
      <input type="hidden" name="editavel" value={pode.editar ? '1' : ''} />
      <input type="hidden" name="imagemAtual" value={imagem} />
      <fieldset disabled={!pode.editar || enviando} className="form" style={{ border: 0, padding: 0, margin: 0 }}>
        <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={e.titulo} obrigatorio />
        <Campo nome="slug" rotulo="Endereço (slug)" valor={val('slug')} erro={e.slug} somenteLeitura={n.slugTravado}
          ajuda={n.slugTravado ? 'Travado depois da primeira publicação, para não quebrar links.' : 'Fica em /noticias/<endereço>. Em branco, é gerado a partir do título.'} />
        <Campo nome="data" rotulo="Data" tipo="date" valor={val('data')} erro={e.data} obrigatorio />
        <Campo nome="resumo" rotulo="Resumo" tipo="textarea" valor={val('resumo')} erro={e.resumo} ajuda="Aparece na lista de notícias e no topo da página." obrigatorio />
        <div className="campo" data-erro={e.imagem ? '' : undefined}>
          <label htmlFor="foto">Foto{!imagem && <span aria-hidden="true"> *</span>}</label>
          {imagem && <img className="foto-atual" src={imagem} alt="" />}
          <input type="file" id="foto" name="foto" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" aria-invalid={e.imagem ? true : undefined} />
          <span className="ajuda" id="foto-ajuda">{imagem ? 'Envie outra para trocar. ' : ''}JPG, PNG ou WebP, até 8 MB.</span>
          {e.imagem && <span className="erro-campo">{e.imagem}</span>}
        </div>
        <Campo nome="alt" rotulo="Descrição da foto" valor={val('alt')} erro={e.alt} obrigatorio ajuda="Descreva o que aparece na foto, para quem usa leitor de tela." />
        <EditorBlocos inicial={n.corpo} erro={e.corpo} desabilitado={!pode.editar} />
      </fieldset>
      {devolvendo && <Campo nome="comentario" rotulo="O que precisa mudar?" tipo="textarea" erro={e.comentario} obrigatorio />}
      <div className="acoes">
        {pode.editar && <button className="bt sec" name="acao" value="salvar" disabled={enviando}>Salvar</button>}
        {pode.enviar && <button className="bt" name="acao" value="enviar" disabled={enviando}>Enviar para revisão</button>}
        {pode.publicar && <button className="bt" name="acao" value="publicar" disabled={enviando}>Publicar</button>}
        {pode.devolver && (devolvendo
          ? <button className="bt sec" name="acao" value="devolver" disabled={enviando}>Confirmar devolução</button>
          : <button className="bt sec" type="button" onClick={() => setDevolvendo(true)}>Devolver ao autor</button>)}
        {pode.despublicar && <button className="bt sec" name="acao" value="despublicar" disabled={enviando} onClick={confirmar('Tirar esta notícia do site?')}>Despublicar</button>}
        {pode.apagar && <button className="bt perigo" name="acao" value="apagar" disabled={enviando} onClick={confirmar('Apagar esta notícia de vez? Não dá para desfazer.')}>Apagar</button>}
        {n.id && <a className="bt sec" href={`/admin/previa/${n.id}`} target="_blank" rel="noopener">Ver prévia<span className="sr"> (abre em nova aba)</span></a>}
      </div>
    </form>
  );
}
