// Recebe os formulários públicos (site.js envia por fetch): grava no banco e avisa por e-mail.
import { headers } from 'next/headers';
import { after } from 'next/server';
import { db } from '@/lib/db';
import { registrarContato, FORMULARIOS } from '@/lib/admin/contatos';
import { criarLimitador } from '@/lib/admin/limite';
import { avisarPorEmail } from '@/lib/email';

const limite = criarLimitador({ max: 5, janelaMs: 10 * 60_000 });

export async function POST(req: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  if (limite.bloqueado(ip)) return Response.json({ erro: 'Muitos envios seguidos. Tente de novo em alguns minutos.' }, { status: 429 });
  const f = await req.formData();
  if (f.get('site')) return Response.json({ ok: true }); // armadilha para robôs: campo invisível preenchido
  limite.falhou(ip);
  let r;
  try { r = await registrarContato(db, f); } catch (e) {
    console.error('contato', e);
    return Response.json({ erro: 'Não foi possível enviar agora. Tente de novo ou use o telefone (47) 3333-8786.' }, { status: 500 });
  }
  if (!r.ok) return Response.json({ erro: 'Confira os campos e tente de novo.' }, { status: 400 });
  const c = r.valor;
  // after: o e-mail sai depois da resposta, sem atrasar quem enviou e sem ser cortado na Vercel.
  after(() => avisarPorEmail(`[Site ACIDI] ${FORMULARIOS[c.formulario].titulo}: ${c.nome}`,
    c.campos.map(x => `${x.rotulo}: ${x.valor}`).join('\n') + `\n\nVer no admin: ${process.env.BETTER_AUTH_URL ?? ''}/admin/contatos/${c.id}`, c.email)
    .catch(e => console.error('contato e-mail', e)));
  return Response.json({ ok: true });
}
