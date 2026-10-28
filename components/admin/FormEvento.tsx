'use client';
import { useActionState } from 'react';
import { agirEvento } from '@/app/(admin)/admin/(painel)/agenda/acoes';
import { Campo, Aviso } from './Campo';

export type DadosEvento = { id: string | null; data: string; titulo: string; horario: string; local: string; descricao: string; lidoEm: string };

export function FormEvento({ e }: { e: DadosEvento }) {
  const [estado, acao, enviando] = useActionState(agirEvento, undefined);
  const v = estado?.valores ?? {}, er = estado?.erros ?? {};
  const val = (k: keyof DadosEvento) => v[k] ?? e[k] ?? '';
  return (
    <form action={acao} className="form">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={e.id ?? ''} />
      <input type="hidden" name="lidoEm" value={e.lidoEm} />
      <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={er.titulo} obrigatorio />
      <Campo nome="data" rotulo="Data" tipo="date" valor={val('data')} erro={er.data} obrigatorio />
      <Campo nome="horario" rotulo="Horário" valor={val('horario')} erro={er.horario} ajuda="Opcional. Ex.: 19h ou 8h às 10h." />
      <Campo nome="local" rotulo="Local" valor={val('local')} erro={er.local} obrigatorio />
      <Campo nome="descricao" rotulo="Descrição" tipo="textarea" valor={val('descricao')} erro={er.descricao} obrigatorio />
      <div className="acoes">
        <button className="bt" name="acao" value="salvar" disabled={enviando}>{e.id ? 'Salvar' : 'Publicar evento'}</button>
        {e.id && <button className="bt perigo" name="acao" value="apagar" disabled={enviando} formNoValidate
          onClick={ev => { if (!window.confirm('Apagar este evento da agenda?')) ev.preventDefault(); }}>Apagar</button>}
      </div>
    </form>
  );
}
