// Reordenação manual: troca o valor de "ordem" do item com o vizinho na lista já ordenada.
export function trocaComVizinho<T extends { id: string; ordem: number }>(lista: T[], id: string, direcao: 'cima' | 'baixo'): { id: string; ordem: number }[] {
  const i = lista.findIndex(x => x.id === id), j = direcao === 'cima' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return [];
  return [{ id: lista[i].id, ordem: lista[j].ordem }, { id: lista[j].id, ordem: lista[i].ordem }];
}
