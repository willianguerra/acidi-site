'use client';
// Campo de formulário do admin: rótulo, ajuda e erro ligados ao controle por id/aria.
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Aviso as AvisoBase } from './Aviso';

type Props = {
  nome: string; rotulo: string; tipo?: 'text' | 'email' | 'password' | 'date' | 'textarea';
  valor?: string | null; erro?: string; ajuda?: string; obrigatorio?: boolean; autoComplete?: string; somenteLeitura?: boolean;
  /** texto fixo antes do campo (ex.: "/noticias/") */ prefixo?: string;
  /** campo de título: letra maior */ grande?: boolean;
  /** mostra "n / limite" enquanto a pessoa digita; quem valida o limite é o servidor */ limite?: number;
  placeholder?: string; classe?: string;
};

export const Obrigatorio = () => <span aria-hidden="true" className="text-destructive"> *</span>;

export function Campo({ nome, rotulo, tipo = 'text', valor, erro, ajuda, obrigatorio, autoComplete, somenteLeitura, prefixo, grande, limite, placeholder, classe }: Props) {
  const [n, setN] = useState((valor ?? '').length);
  const desc = [ajuda && nome + '-ajuda', erro && nome + '-erro'].filter(Boolean).join(' ') || undefined;
  const comum = {
    id: nome, name: nome, defaultValue: valor ?? '', required: obrigatorio, readOnly: somenteLeitura, placeholder, 'aria-invalid': erro ? true : undefined, 'aria-describedby': desc,
    onInput: limite ? (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => setN(e.currentTarget.value.length) : undefined,
  };
  const controle = tipo === 'textarea' ? <Textarea {...comum} className={classe} />
    : <Input type={tipo} autoComplete={autoComplete} {...comum} className={cn(grande && 'h-12 font-display text-xl! font-bold', prefixo && 'rounded-l-none', classe)} />;
  return (
    <div className="campo" data-erro={erro ? '' : undefined}>
      <Label htmlFor={nome}>{rotulo}{obrigatorio && <Obrigatorio />}</Label>
      {prefixo ? <div className="flex"><span className="grid flex-none place-items-center rounded-l-lg border border-r-0 border-input bg-secondary px-3 text-muted-foreground">{prefixo}</span>{controle}</div> : controle}
      {(ajuda || limite) && <span className="flex justify-between gap-3">
        {ajuda && <span className="ajuda" id={nome + '-ajuda'}>{ajuda}</span>}
        {limite && <span className={cn('ajuda ml-auto flex-none tabular-nums', n > limite && 'font-semibold text-destructive!')} aria-hidden="true">{n} / {limite}</span>}
      </span>}
      {erro && <span className="erro-campo" id={nome + '-erro'}>{erro}</span>}
    </div>
  );
}

export function Aviso({ estado }: { estado?: { ok?: string; erro?: string } }) {
  if (estado?.erro) return <AvisoBase tipo="erro">{estado.erro}</AvisoBase>;
  if (estado?.ok) return <AvisoBase tipo="ok">{estado.ok}</AvisoBase>;
  return null;
}
