'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useActionState } from 'react';
import { agirMembro, agirExPresidente } from '@/app/(admin)/admin/(painel)/diretoria/acoes';
import { Campo, Aviso } from './Campo';

const apagar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };

export type DadosMembro = { id: string | null; grupo: string; rotulo: string; nome: string; suplente: boolean };

export function FormMembro({ m, grupos }: { m: DadosMembro; grupos: Record<string, string> }) {
  const [estado, acao, enviando] = useActionState(agirMembro, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} className="grid max-w-2xl gap-4">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={m.id ?? ''} />
      <div className="campo" data-erro={e.grupo ? '' : undefined}>
        <Label htmlFor="grupo">Grupo</Label>
        <NativeSelect id="grupo" name="grupo" defaultValue={v.grupo ?? m.grupo} required>
          {Object.entries(grupos).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </NativeSelect>
        {e.grupo && <span className="erro-campo">{e.grupo}</span>}
      </div>
      <Campo nome="rotulo" rotulo="Cargo ou área" valor={v.rotulo ?? m.rotulo} erro={e.rotulo} ajuda="Usado na diretoria executiva (cargo) e nas vice-presidências (área). Nos conselhos, deixe em branco." />
      <Campo nome="nome" rotulo="Nome" valor={v.nome ?? m.nome} erro={e.nome} obrigatorio />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="suplente" defaultChecked={m.suplente} /> Suplente (conselho fiscal)</label>
      <div className="flex flex-wrap gap-2">
        <Button name="acao" value="salvar" disabled={enviando}>{m.id ? 'Salvar' : 'Adicionar'}</Button>
        {m.id && <Button variant="destructive" name="acao" value="apagar" formNoValidate disabled={enviando} onClick={apagar(`Remover ${m.nome} da diretoria?`)}>Remover</Button>}
      </div>
    </form>
  );
}

export type DadosPresidente = { id: string | null; nome: string; gestao: string; foto: string };

export function FormExPresidente({ p }: { p: DadosPresidente }) {
  const [estado, acao, enviando] = useActionState(agirExPresidente, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} className="grid max-w-2xl gap-4">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={p.id ?? ''} />
      <input type="hidden" name="fotoAtual" value={p.foto} />
      <Campo nome="nome" rotulo="Nome" valor={v.nome ?? p.nome} erro={e.nome} obrigatorio />
      <Campo nome="gestao" rotulo="Gestão" valor={v.gestao ?? p.gestao} erro={e.gestao} ajuda="Ex.: Maio de 1989 a maio de 1991. Opcional." />
      <div className="campo" data-erro={e.foto ? '' : undefined}>
        <Label htmlFor="foto">Retrato (opcional)</Label>
        {p.foto && <img className="foto-atual" src={p.foto} alt="" />}
        <Input type="file" id="foto" name="foto" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" />
        <span className="ajuda" id="foto-ajuda">JPG, PNG ou WebP, até 8 MB. Sem foto, o site mostra as iniciais.</span>
        {e.foto && <span className="erro-campo">{e.foto}</span>}
        {p.foto && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="semFoto" /> Remover o retrato atual</label>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button name="acao" value="salvar" disabled={enviando}>{p.id ? 'Salvar' : 'Adicionar'}</Button>
        {p.id && <Button variant="destructive" name="acao" value="apagar" formNoValidate disabled={enviando} onClick={apagar(`Remover ${p.nome} da lista?`)}>Remover</Button>}
      </div>
    </form>
  );
}
