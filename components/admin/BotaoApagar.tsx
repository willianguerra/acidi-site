'use client';
import { Ico } from '@/components/Ico';

// Ícone de apagar de uma linha: pede confirmação e envia o form da linha (mesma ação da massa, com um id).
export function BotaoApagar({ nome }: { nome: string }) {
  return (<button type="submit" name="acao" value="apagar" className="icone perigo" title={`Apagar ${nome}`} aria-label={`Apagar ${nome}`}
    onClick={e => { if (!confirm(`Apagar "${nome}"? Isso não pode ser desfeito.`)) e.preventDefault(); }}><Ico n="trash" /></button>);
}
