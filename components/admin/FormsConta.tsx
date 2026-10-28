'use client';
import { useActionState } from 'react';
import { entrar, trocarSenha } from '@/app/(admin)/admin/acoes';
import { Campo, Aviso } from './Campo';

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, undefined);
  return (
    <form action={acao} className="form">
      <Aviso estado={estado} />
      <Campo nome="email" rotulo="E-mail" tipo="email" valor={estado?.valores?.email} obrigatorio autoComplete="username" />
      <Campo nome="senha" rotulo="Senha" tipo="password" obrigatorio autoComplete="current-password" />
      <button className="bt" type="submit" disabled={enviando}>Entrar</button>
    </form>
  );
}

export function FormSenha() {
  const [estado, acao, enviando] = useActionState(trocarSenha, undefined);
  const e = estado?.erros ?? {};
  return (
    <form action={acao} className="form">
      <Aviso estado={estado} />
      <Campo nome="atual" rotulo="Senha atual" tipo="password" erro={e.atual} obrigatorio autoComplete="current-password" />
      <Campo nome="nova" rotulo="Nova senha" tipo="password" erro={e.nova} ajuda="Ao menos 10 caracteres." obrigatorio autoComplete="new-password" />
      <Campo nome="confirma" rotulo="Repita a nova senha" tipo="password" erro={e.confirma} obrigatorio autoComplete="new-password" />
      <button className="bt" type="submit" disabled={enviando}>Salvar nova senha</button>
    </form>
  );
}
