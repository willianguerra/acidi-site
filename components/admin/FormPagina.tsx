'use client';
import { useActionState } from 'react';
import { Columns2, Eye, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Selo } from '@/components/admin/Selo';
import { Card, CardTitle, cardClass } from '@/components/ui/card';
import { agirPagina } from '@/app/(admin)/admin/(painel)/paginas/acoes';
import type { Bloco } from '@/lib/types';
import { Campo, Aviso } from './Campo';
import { EditorBlocos } from './EditorBlocos';
import { AvisoSaida } from './AvisoSaida';
import { BarraForm } from './BarraForm';
import { Secao } from './Secao';
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
const GRUPO = 'grid min-w-0 gap-4 border-t pt-4 first-of-type:border-0 first-of-type:pt-0';
const SUB = 'float-left mb-0 w-full font-display text-[0.95rem] font-bold';

// `alterada` é a data real da última gravação; `avisos` são as mensagens da página, mostradas abaixo da barra.
export function FormPagina({ p, campos, alterada, avisos }: { p: DadosPagina; campos: CamposPagina; alterada?: string; avisos?: React.ReactNode }) {
  const [estado, acao, enviando] = useActionState(agirPagina, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  const val = (k: Texto) => v[k] ?? String(p[k] ?? '');
  const foto = v.fotoAtual ?? p.foto;
  const publicada = p.situacao === 'publicada';
  // partes que a página fixa não usa seguem no envio com o valor atual, para não serem apagadas
  const guarda = (nomes: Texto[]) => nomes.map(n => <input key={n} type="hidden" name={n} value={val(n)} />);
  return (
    <form action={acao} id="form-pagina">
      <input type="hidden" name="id" value={p.id ?? ''} />
      <input type="hidden" name="lidaEm" value={p.lidaEm} />
      <input type="hidden" name="fotoAtual" value={foto} />
      <AvisoSaida formId="form-pagina" estado={estado} />
      <BarraForm voltar={{ href: '/admin/paginas', rotulo: 'Voltar para páginas' }} titulo={p.id ? p.nome : 'Nova página'}
        selo={<Selo s={p.situacao}>{SITUACOES[p.situacao]}</Selo>} estado={p.id ? alterada && `Última alteração em ${alterada}` : 'Ainda não salva'}
        verNoSite={p.id && publicada ? '/' + p.slug : undefined}>
        {!campos.fixa && (p.id
          ? <Button asChild variant="outline"><a href={`/admin/previa/pagina/${p.id}`} target="_blank" rel="noopener"><Eye aria-hidden="true" />Prévia<span className="sr-only"> (abre em nova aba)</span></a></Button>
          : <span className="grid justify-items-center gap-0.5"><Button type="button" variant="outline" disabled aria-describedby="previa-nota"><Eye aria-hidden="true" />Prévia</Button><span id="previa-nota" className="text-[0.7rem] text-muted-foreground">Disponível após salvar</span></span>)}
        {campos.fixa ? <Button name="acao" value="salvar" disabled={enviando}>Salvar alterações</Button>
          : publicada ? <Button name="acao" value="salvar" disabled={enviando}>Atualizar página</Button>
          : <>
            <Button variant="outline" name="acao" value="salvar" disabled={enviando}>Salvar rascunho</Button>
            <Button name="acao" value="publicar" disabled={enviando} aria-describedby="publicacao-menu">Publicar página</Button>
          </>}
      </BarraForm>
      {avisos}
      <Aviso estado={estado} />
      <div className="duas-colunas">
        <div className="principal">
          <div className={cardClass}>
            <fieldset disabled={enviando} className="grid min-w-0 gap-4">
              <legend className="sr-only">Cabeçalho da página</legend>
              {campos.fixa && <p className="ajuda">Esta é uma página fixa do site: formulário, galeria e listas ligados a ela continuam fixos por enquanto.</p>}
              <Campo nome="titulo" rotulo="Título da página" valor={val('titulo')} erro={e.titulo} obrigatorio grande placeholder="Digite o título da página" />
              <Campo nome="chamada" rotulo="Texto de apresentação" tipo="textarea" valor={val('chamada')} erro={e.chamada} obrigatorio classe="min-h-20" ajuda={FORMATO} placeholder="Apresente o assunto desta página em poucas palavras." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo nome="etiqueta" rotulo="Texto acima do título" valor={val('etiqueta')} erro={e.etiqueta} ajuda="Linha pequena acima do título." />
                <Campo nome="destaque" rotulo="Trecho em destaque" valor={val('destaque')} erro={e.destaque} ajuda="Parte do título que aparece em negrito." />
              </div>
            </fieldset>
            {campos.corpo
              ? <div className="border-t pt-4"><EditorBlocos inicial={p.corpo} erro={e.corpo} desabilitado={enviando} titulo="Conteúdo da página" obrigatorio={false} /></div>
              : <input type="hidden" name="corpo" value={JSON.stringify(p.corpo)} />}
            {campos.foto ? <Secao icone={<ImageIcon aria-hidden="true" />} titulo="Imagem do cabeçalho" resumo={foto ? 'Foto enviada' : 'Foto, descrição e legenda · Opcional'} aberta={!!foto} erro={!!(e.foto || e.fotoAlt || e.fotoLegenda)}>
              <fieldset disabled={enviando} className="grid min-w-0 gap-4">
                <div className="campo" data-erro={e.foto ? '' : undefined}>
                  <Label htmlFor="fotoArquivo">Foto do cabeçalho</Label>
                  {foto && <img className="foto-atual" src={foto} alt="" />}
                  <Input type="file" id="fotoArquivo" name="fotoArquivo" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" aria-invalid={e.foto ? true : undefined} />
                  <span className="ajuda" id="foto-ajuda">{foto ? 'Envie outra para trocar. ' : ''}JPG, PNG ou WebP, até 8 MB.</span>
                  {foto && <label className="flex items-center gap-2"><input type="checkbox" name="semFoto" /> Remover foto</label>}
                  {e.foto && <span className="erro-campo">{e.foto}</span>}
                </div>
                <Campo nome="fotoAlt" rotulo="Descrição da foto" valor={val('fotoAlt')} erro={e.fotoAlt} ajuda="Obrigatória quando há foto, para quem usa leitor de tela." />
                <Campo nome="fotoLegenda" rotulo="Legenda da foto" valor={val('fotoLegenda')} erro={e.fotoLegenda} ajuda={FORMATO} />
              </fieldset>
            </Secao> : guarda(['fotoAlt', 'fotoLegenda'])}
            {campos.lateral ? <Secao icone={<Columns2 aria-hidden="true" />} titulo="Coluna lateral da página" resumo={val('lateralTexto') || val('botaoTexto') ? 'Preenchida' : 'Texto de apoio e botão · Opcional'}
              aberta={!!(p.lateralTexto || p.botaoTexto)} erro={!!(e.lateralTexto || e.botaoTexto || e.botaoHref)}>
              <fieldset disabled={enviando} className="grid min-w-0 gap-4">
                <Campo nome="lateralTexto" rotulo="Texto" tipo="textarea" valor={val('lateralTexto')} erro={e.lateralTexto} ajuda={FORMATO} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo nome="botaoTexto" rotulo="Texto do botão" valor={val('botaoTexto')} erro={e.botaoTexto} />
                  <Campo nome="botaoHref" rotulo="Endereço do botão" valor={val('botaoHref')} erro={e.botaoHref} ajuda="Aceita /, #, https://, http://, mailto: e tel:." />
                </div>
              </fieldset>
            </Secao> : guarda(['lateralTexto', 'botaoTexto', 'botaoHref'])}
          </div>
        </div>
        <div className="lateral">
          <Card>
            <CardTitle>Configurações da página</CardTitle>
            <fieldset disabled={enviando} className={GRUPO}>
              <legend className={SUB}>Identificação{!campos.fixa && ' e endereço'}</legend>
              <Campo nome="nome" rotulo="Nome da página" valor={val('nome')} erro={e.nome} obrigatorio ajuda="Usado no menu, na navegação e na aba do navegador." />
              {!campos.fixa && <Campo nome="slug" rotulo="Endereço" prefixo="/" valor={p.id ? p.slug : val('slug')} erro={e.slug} somenteLeitura={!!p.id} obrigatorio={!p.id} placeholder="endereco-da-pagina"
                ajuda={p.id ? 'Não muda depois de criada, para não quebrar links.' : 'Só letras minúsculas sem acento, números e hífens. Depois de criada a página, o endereço não pode ser alterado.'} />}
            </fieldset>
            {!campos.fixa && <fieldset disabled={enviando} className={GRUPO}>
              <legend className={SUB}>Menu do site</legend>
              <div className="campo" data-erro={e.menu ? '' : undefined}>
                <Label htmlFor="menu">Aparece em</Label>
                {/* O reset da ação usa a opção inicial. Remonte com a escolha devolvida pelo servidor. */}
                <NativeSelect key={val('menu')} id="menu" name="menu" defaultValue={val('menu')} aria-invalid={e.menu ? true : undefined} aria-describedby={e.menu ? 'publicacao-menu menu-erro' : 'publicacao-menu'}>
                  <option value="">Nenhum</option><option value="acidi">A ACIDI</option><option value="negocio">Para seu negócio</option>
                </NativeSelect>
                <span id="publicacao-menu" className="ajuda">Com “Nenhum”, a página publicada continua acessível pelo endereço, mas não aparece no menu.</span>
                {e.menu && <span className="erro-campo" id="menu-erro">{e.menu}</span>}
              </div>
              <Campo nome="menuTexto" rotulo="Descrição no menu" valor={val('menuTexto')} erro={e.menuTexto} ajuda="Linha pequena abaixo do nome." />
            </fieldset>}
            <fieldset disabled={enviando} className={GRUPO}>
              <legend className={SUB}>Busca e compartilhamento</legend>
              <Campo nome="descricao" rotulo="Descrição para buscadores" tipo="textarea" valor={val('descricao')} erro={e.descricao} obrigatorio limite={300} classe="min-h-24" ajuda="Aparece no Google e ao compartilhar o link." />
            </fieldset>
            {p.id && <div className="flex flex-wrap gap-2 border-t pt-4 *:flex-1">
              {publicada && <Button variant="outline" size="sm" name="acao" value="tirar" disabled={enviando} formNoValidate onClick={confirmar('Tirar esta página do ar?')}>Tirar do ar</Button>}
              {campos.fixa && !publicada && <Button size="sm" name="acao" value="publicar" disabled={enviando}>Colocar no ar</Button>}
              {!campos.fixa && <Button variant="destructive" size="sm" name="acao" value="apagar" disabled={enviando} formNoValidate onClick={confirmar('Apagar esta página de vez? Não dá para desfazer.')}>Apagar página</Button>}
            </div>}
          </Card>
        </div>
      </div>
    </form>
  );
}
