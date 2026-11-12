'use client';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { agirEvento } from '@/app/(admin)/admin/(painel)/agenda/acoes';
import { Campo, Aviso } from './Campo';
import { Card, CardTitle } from '@/components/ui/card';
import { BarraForm } from './BarraForm';
import { AvisoSaida } from './AvisoSaida';

export type DadosEvento = { id: string | null; data: string; titulo: string; horario: string; local: string; descricao: string; lidoEm: string };

export function FormEvento({ e }: { e: DadosEvento }) {
  const [estado, acao, enviando] = useActionState(agirEvento, undefined);
  const v = estado?.valores ?? {}, er = estado?.erros ?? {};
  const val = (k: keyof DadosEvento) => v[k] ?? e[k] ?? '';
  return (
    <form action={acao} id="form-evento">
      <input type="hidden" name="id" value={e.id ?? ''} />
      <input type="hidden" name="lidoEm" value={e.lidoEm} />
      <AvisoSaida formId="form-evento" estado={estado} />
      <BarraForm voltar={{ href: '/admin/agenda', rotulo: 'Voltar para a agenda' }} titulo={e.id ? e.titulo : 'Novo evento'} estado={e.id ? undefined : 'Ainda não salvo'}>
        <Button name="acao" value="salvar" disabled={enviando}>{e.id ? 'Salvar alterações' : 'Publicar evento'}</Button>
      </BarraForm>
      <Aviso estado={estado} />
      <div className="duas-colunas">
        <div className="principal">
          <Card>
            <Campo nome="titulo" rotulo="Título" valor={val('titulo')} erro={er.titulo} obrigatorio grande />
            <Campo nome="descricao" rotulo="Descrição" tipo="textarea" valor={val('descricao')} erro={er.descricao} obrigatorio classe="min-h-40" />
          </Card>
        </div>
        <div className="lateral">
          <Card>
            <CardTitle>Quando e onde</CardTitle>
            <Campo nome="data" rotulo="Data" tipo="date" valor={val('data')} erro={er.data} obrigatorio />
            <Campo nome="horario" rotulo="Horário" valor={val('horario')} erro={er.horario} ajuda="Opcional. Ex.: 19h ou 8h às 10h." />
            <Campo nome="local" rotulo="Local" valor={val('local')} erro={er.local} obrigatorio />
            {e.id && <div className="border-t pt-4"><Button variant="destructive" size="sm" name="acao" value="apagar" disabled={enviando} formNoValidate
              onClick={ev => { if (!window.confirm('Apagar este evento da agenda?')) ev.preventDefault(); }}>Apagar evento</Button></div>}
          </Card>
        </div>
      </div>
    </form>
  );
}
