// Limite de tentativas de login: conta falhas por chave dentro de uma janela de tempo.
// shortcut: guarda em memória do processo; com várias instâncias (Vercel), passar para o banco ou um Redis.
export function criarLimitador({ max, janelaMs, agora = Date.now }: { max: number; janelaMs: number; agora?: () => number }) {
  const falhas = new Map<string, number[]>();
  const recentes = (chave: string) => (falhas.get(chave) ?? []).filter(t => agora() - t < janelaMs);
  return {
    bloqueado: (chave: string) => recentes(chave).length >= max,
    falhou: (chave: string) => { falhas.set(chave, [...recentes(chave), agora()]); },
    limpar: (chave: string) => { falhas.delete(chave); },
  };
}
