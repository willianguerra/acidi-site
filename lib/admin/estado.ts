// Retorno padrão das Server Actions do admin para useActionState.
export type Estado = { ok?: string; erro?: string; erros?: Record<string, string>; valores?: Record<string, string> } | undefined;
