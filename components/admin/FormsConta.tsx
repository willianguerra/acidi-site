'use client';
import { useActionState, useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { entrar, trocarSenha } from '@/app/(admin)/admin/acoes';
import { Campo, Aviso } from './Campo';

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, undefined);
  const [visivel, setVisivel] = useState(false);
  return (
    <form action={acao} className="grid gap-4">
      <Aviso estado={estado} />
      <Campo nome="email" rotulo="E-mail" tipo="email" valor={estado?.valores?.email} obrigatorio autoComplete="username" classe="h-11" />
      <div className="campo">
        <Label htmlFor="senha">Senha<span aria-hidden="true" className="text-destructive"> *</span></Label>
        <div className="relative">
          <Input id="senha" name="senha" type={visivel ? 'text' : 'password'} required autoComplete="current-password" className="h-11 pr-11" />
          <button type="button" className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-pressed={visivel} aria-label="Mostrar a senha" title={visivel ? 'Ocultar a senha' : 'Mostrar a senha'} onClick={() => setVisivel(v => !v)}>
            {visivel ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button>
        </div>
      </div>
      <Button type="submit" size="lg" disabled={enviando} className="mt-1">{enviando ? 'Entrando…' : <>Entrar<ArrowRight aria-hidden="true" /></>}</Button>
    </form>
  );
}

export function FormSenha() {
  const [estado, acao, enviando] = useActionState(trocarSenha, undefined);
  const e = estado?.erros ?? {};
  return (
    <form action={acao} className="grid max-w-md gap-4">
      <Aviso estado={estado} />
      <Campo nome="atual" rotulo="Senha atual" tipo="password" erro={e.atual} obrigatorio autoComplete="current-password" />
      <Campo nome="nova" rotulo="Nova senha" tipo="password" erro={e.nova} ajuda="Ao menos 10 caracteres." obrigatorio autoComplete="new-password" />
      <Campo nome="confirma" rotulo="Repita a nova senha" tipo="password" erro={e.confirma} obrigatorio autoComplete="new-password" />
      <Button type="submit" disabled={enviando} className="justify-self-start">{enviando ? 'Salvando…' : 'Salvar nova senha'}</Button>
    </form>
  );
}
