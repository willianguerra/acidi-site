'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { cardClass } from '@/components/ui/card';
import { useActionState } from 'react';
import { criarUsuarioAcao, agirUsuario } from '@/app/(admin)/admin/(painel)/usuarios/acoes';
import { Campo, Aviso } from './Campo';

const PAPEIS = [['editor', 'Editor: escreve notícias (passam por revisão) e cuida da agenda'], ['revisor', 'Revisor: revisa e publica notícias, cuida da agenda'], ['admin', 'Admin: tudo, inclusive diretoria e usuários']] as const;

function Papel({ valor, erro }: { valor: string; erro?: string }) {
  return (
    <div className="campo" data-erro={erro ? '' : undefined}>
      <Label htmlFor="papel">Perfil</Label>
      <NativeSelect id="papel" name="papel" defaultValue={valor} aria-describedby={erro ? 'papel-erro' : undefined}>
        {PAPEIS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
      </NativeSelect>
      {erro && <span className="erro-campo" id="papel-erro">{erro}</span>}
    </div>
  );
}

export function FormNovoUsuario() {
  const [estado, acao, enviando] = useActionState(criarUsuarioAcao, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} className="grid max-w-2xl gap-4">
      <Aviso estado={estado} />
      <Campo nome="nome" rotulo="Nome" valor={v.nome} erro={e.nome} obrigatorio />
      <Campo nome="email" rotulo="E-mail" tipo="email" valor={v.email} erro={e.email} obrigatorio autoComplete="off" />
      <Papel valor={v.papel ?? 'editor'} erro={e.papel} />
      <Campo nome="senha" rotulo="Senha provisória" tipo="text" erro={e.senha} obrigatorio autoComplete="off"
        ajuda="Ao menos 10 caracteres. Passe para a pessoa por um canal seguro; ela troca no primeiro acesso." />
      <Button type="submit" disabled={enviando} className="justify-self-start">Criar conta</Button>
    </form>
  );
}

export function FormsUsuario({ id, papel, ativo, eu }: { id: string; papel: string; ativo: boolean; eu: boolean }) {
  const [estado, acao, enviando] = useActionState(agirUsuario, undefined);
  const e = estado?.erros ?? {};
  return (<>
    <Aviso estado={estado} />
    {e.ativo && <Aviso estado={{ erro: e.ativo }} />}
    <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
    <form action={acao} className={cardClass}>
      <input type="hidden" name="id" value={id} />
      <h2 className="font-display text-[1.0625rem] font-bold">Perfil</h2>
      <Papel valor={papel} erro={e.papel} />
      <div><Button name="acao" value="papel" disabled={enviando}>Salvar perfil</Button></div>
    </form>
    <form action={acao} className={cardClass}>
      <input type="hidden" name="id" value={id} />
      <h2 className="font-display text-[1.0625rem] font-bold">Redefinir senha</h2>
      <Campo nome="senha" rotulo="Nova senha provisória" tipo="text" erro={e.senha} obrigatorio autoComplete="off" ajuda="A pessoa sai de todas as sessões e troca a senha no próximo acesso." />
      <div><Button variant="outline" name="acao" value="senha" disabled={enviando}>Redefinir senha</Button></div>
    </form>
    <form action={acao} className={cardClass}>
      <input type="hidden" name="id" value={id} />
      <h2 className="font-display text-[1.0625rem] font-bold">Acesso</h2>
      {ativo
        ? <><p className="ajuda">Desativar encerra as sessões na hora e impede novos acessos. As notícias da pessoa continuam no site.</p>
          <div><Button variant="destructive" name="acao" value="desativar" disabled={enviando}
            onClick={ev => { if (!window.confirm(eu ? 'Desativar a sua própria conta? Você sairá agora.' : 'Desativar esta conta?')) ev.preventDefault(); }}>Desativar conta</Button></div></>
        : <div><Button name="acao" value="reativar" disabled={enviando}>Reativar conta</Button></div>}
    </form>
    </div>
  </>);
}
