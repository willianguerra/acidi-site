'use client';
import { useActionState, useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Selo } from '@/components/admin/Selo';
import { Card, CardTitle, cardClass } from '@/components/ui/card';
import { agirNoticia } from '@/app/(admin)/admin/(painel)/noticias/acoes';
import type { Bloco } from '@/lib/types';
import { Campo, Aviso, Obrigatorio } from './Campo';
import { EditorBlocos } from './EditorBlocos';
import { AvisoSaida } from './AvisoSaida';
import { BarraForm } from './BarraForm';
import { SITUACOES, type Situacao } from '@/lib/admin/fluxo';

export type DadosForm = {
  id: string | null; titulo: string; slug: string; data: string; resumo: string; imagem: string; alt: string; corpo: Bloco[];
  lidaEm: string; slugTravado: boolean;
};
export type Permissoes = { editar: boolean; enviar: boolean; publicar: boolean; devolver: boolean; despublicar: boolean; apagar: boolean };

const confirmar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };

// `alterada` é a data real da última gravação (vem do banco); `avisos` são as mensagens da página, mostradas abaixo da barra.
export function FormNoticia({ n, pode, situacao = 'rascunho', autor, alterada, avisos }: { n: DadosForm; pode: Permissoes; situacao?: Situacao; autor?: string | null; alterada?: string; avisos?: React.ReactNode }) {
  const [estado, acao, enviando] = useActionState(agirNoticia, undefined);
  const [devolvendo, setDevolvendo] = useState(false);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  const val = (k: keyof DadosForm) => v[k] ?? String(n[k] ?? '');
  const imagem = v.imagemAtual || n.imagem;
  const bloq = !pode.editar || enviando;
  const publicada = situacao === 'publicada';
  return (
    <form action={acao} id="form-noticia">
      <input type="hidden" name="id" value={n.id ?? ''} />
      <input type="hidden" name="lidaEm" value={n.lidaEm} />
      <input type="hidden" name="editavel" value={pode.editar ? '1' : ''} />
      <input type="hidden" name="imagemAtual" value={imagem} />
      <AvisoSaida formId="form-noticia" estado={estado} />
      <BarraForm voltar={{ href: '/admin/noticias', rotulo: 'Voltar para notícias' }} titulo={n.id ? n.titulo : 'Nova notícia'}
        selo={<Selo s={situacao}>{SITUACOES[situacao]}</Selo>} estado={n.id ? alterada && `Última alteração em ${alterada}` : 'Ainda não salva'}
        verNoSite={publicada ? `/noticias/${n.slug}` : undefined}>
        {n.id && <Button asChild variant="outline"><a href={`/admin/previa/${n.id}`} target="_blank" rel="noopener"><Eye aria-hidden="true" />Prévia<span className="sr-only"> (abre em nova aba)</span></a></Button>}
        {/* salvar um rascunho, salvar em revisão e atualizar o que já está no site são coisas diferentes para quem lê */}
        {pode.editar && <Button variant={publicada ? 'default' : 'outline'} name="acao" value="salvar" disabled={enviando}>{publicada ? 'Atualizar publicação' : situacao === 'rascunho' ? 'Salvar rascunho' : 'Salvar alterações'}</Button>}
        {pode.enviar && <Button name="acao" value="enviar" disabled={enviando}>Enviar para revisão</Button>}
        {pode.publicar && <Button name="acao" value="publicar" disabled={enviando}>Publicar notícia</Button>}
      </BarraForm>
      {avisos}
      <Aviso estado={estado} />
      <div className="duas-colunas">
        <div className="principal">
          <fieldset disabled={bloq} className={cardClass}>
            <legend className="sr-only">Título, endereço e resumo</legend>
            <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={e.titulo} obrigatorio grande placeholder="Digite o título da notícia" />
            <Campo nome="slug" rotulo="Endereço da notícia" prefixo="/noticias/" valor={val('slug')} erro={e.slug} somenteLeitura={n.slugTravado} placeholder="gerado-a-partir-do-titulo"
              ajuda={n.slugTravado ? 'Travado depois da primeira publicação, para não quebrar links.' : 'Em branco, é gerado a partir do título.'} />
            <Campo nome="resumo" rotulo="Resumo" tipo="textarea" valor={val('resumo')} erro={e.resumo} classe="min-h-20" ajuda="Aparece na lista de notícias, no topo da página e no Google." obrigatorio />
          </fieldset>
          <fieldset disabled={bloq} className={cardClass}>
            <legend className="sr-only">Texto</legend>
            <EditorBlocos inicial={n.corpo} erro={e.corpo} desabilitado={!pode.editar} titulo="Conteúdo da notícia" />
          </fieldset>
        </div>
        <div className="lateral">
          <Card>
            <CardTitle>Publicação</CardTitle>
            <dl className="dados">
              <dt>Situação</dt><dd><Selo s={situacao}>{SITUACOES[situacao]}</Selo></dd>
              {autor && <><dt>Autor</dt><dd>{autor}</dd></>}
            </dl>
            <fieldset disabled={bloq} className="grid min-w-0 gap-4"><Campo nome="data" rotulo="Data" tipo="date" valor={val('data')} erro={e.data} obrigatorio /></fieldset>
            {pode.devolver && <div className="grid gap-3 border-t pt-4">
              {devolvendo && <Campo nome="comentario" rotulo="O que precisa mudar?" tipo="textarea" erro={e.comentario} obrigatorio />}
              {devolvendo
                ? <><Button variant="outline" name="acao" value="devolver" disabled={enviando}>Confirmar devolução</Button>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setDevolvendo(false)}>Cancelar devolução</Button></>
                : <Button variant="outline" type="button" onClick={() => setDevolvendo(true)}>Devolver com comentário</Button>}
            </div>}
            {(pode.despublicar || pode.apagar) && <div className="flex flex-wrap gap-2 border-t pt-4 *:flex-1">
              {pode.despublicar && <Button variant="outline" size="sm" name="acao" value="despublicar" disabled={enviando} formNoValidate onClick={confirmar('Tirar esta notícia do site?')}>Despublicar</Button>}
              {pode.apagar && <Button variant="destructive" size="sm" name="acao" value="apagar" disabled={enviando} formNoValidate onClick={confirmar('Apagar esta notícia de vez? Não dá para desfazer.')}>Apagar notícia</Button>}
            </div>}
          </Card>
          <Card>
            <CardTitle>Imagem de destaque{!imagem && <Obrigatorio />}</CardTitle>
            <fieldset disabled={bloq} className="grid min-w-0 gap-4">
              <div className="campo" data-erro={e.imagem ? '' : undefined}>
                <Label htmlFor="foto" className="sr-only">Foto</Label>
                <div className="grid justify-items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-secondary p-4">
                  {imagem && <img className="foto-atual" src={imagem} alt="" />}
                  <Input type="file" id="foto" name="foto" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" aria-invalid={e.imagem ? true : undefined} />
                </div>
                <span className="ajuda" id="foto-ajuda">{imagem ? 'Envie outra para trocar. ' : 'Selecione ou arraste a foto para o campo. '}JPG, PNG ou WebP, até 8 MB.</span>
                {e.imagem && <span className="erro-campo">{e.imagem}</span>}
              </div>
              <Campo nome="alt" rotulo="Descrição da imagem" valor={val('alt')} erro={e.alt} obrigatorio ajuda="Descreva o que aparece na foto, para quem usa leitor de tela." />
            </fieldset>
          </Card>
        </div>
      </div>
    </form>
  );
}
