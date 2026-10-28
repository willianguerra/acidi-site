// Única porta de entrada do conteúdo para as páginas. Na Fase 2 o corpo destas funções passa a ler o banco.
import type { Servico, Evento, Noticia, Diretoria, ExPresidente, Foto, Beneficio, Assunto } from './types.ts';
import { SERVICOS } from '../content/servicos.ts';
import { EVENTOS } from '../content/eventos.ts';
import { NOTICIAS } from '../content/noticias.ts';
import { DIRETORIA } from '../content/diretoria.ts';
import { EX_PRESIDENTES } from '../content/ex-presidentes.ts';
import { GALERIA } from '../content/auditorio.ts';
import { BENEFICIOS } from '../content/associacao.ts';
import { ASSUNTOS } from '../content/contato.ts';

export async function getServicos(): Promise<Servico[]> { return SERVICOS; }
export async function getEventos(): Promise<Evento[]> { return EVENTOS; }
export async function getNoticias(): Promise<Noticia[]> { return NOTICIAS; }
export async function getNoticia(slug: string): Promise<Noticia | undefined> { return NOTICIAS.find(n => n.slug === slug); }
export async function getDiretoria(): Promise<Diretoria> { return DIRETORIA; }
export async function getExPresidentes(): Promise<ExPresidente[]> { return EX_PRESIDENTES; }
export async function getGaleriaAuditorio(): Promise<Foto[]> { return GALERIA; }
export async function getBeneficios(): Promise<Beneficio[]> { return BENEFICIOS; }
export async function getAssuntosContato(): Promise<Assunto[]> { return ASSUNTOS; }
