// Campo de formulário do admin: rótulo, ajuda e erro ligados ao controle por id/aria.
type Props = {
  nome: string; rotulo: string; tipo?: 'text' | 'email' | 'password' | 'date' | 'textarea';
  valor?: string | null; erro?: string; ajuda?: string; obrigatorio?: boolean; autoComplete?: string; somenteLeitura?: boolean;
};

export function Campo({ nome, rotulo, tipo = 'text', valor, erro, ajuda, obrigatorio, autoComplete, somenteLeitura }: Props) {
  const desc = [ajuda && nome + '-ajuda', erro && nome + '-erro'].filter(Boolean).join(' ') || undefined;
  const comum = { id: nome, name: nome, defaultValue: valor ?? '', required: obrigatorio, readOnly: somenteLeitura, 'aria-invalid': erro ? true : undefined, 'aria-describedby': desc };
  return (
    <div className="campo" data-erro={erro ? '' : undefined}>
      <label htmlFor={nome}>{rotulo}{obrigatorio && <span aria-hidden="true"> *</span>}</label>
      {tipo === 'textarea' ? <textarea {...comum} /> : <input type={tipo} autoComplete={autoComplete} {...comum} />}
      {ajuda && <span className="ajuda" id={nome + '-ajuda'}>{ajuda}</span>}
      {erro && <span className="erro-campo" id={nome + '-erro'}>{erro}</span>}
    </div>
  );
}

export function Aviso({ estado }: { estado?: { ok?: string; erro?: string } }) {
  if (estado?.erro) return <p className="aviso" role="alert">{estado.erro}</p>;
  if (estado?.ok) return <p className="aviso ok" role="status">{estado.ok}</p>;
  return null;
}
