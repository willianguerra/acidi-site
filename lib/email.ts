// Aviso por e-mail das mensagens do site, pela API HTTP do Resend (sem dependência).
// Sem RESEND_API_KEY não envia: a mensagem continua gravada e aparece no admin.
import 'server-only';

export async function avisarPorEmail(assunto: string, texto: string, responderPara: string) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTATO_EMAIL_DE ?? 'Site ACIDI <site@acidi.net>',
      to: (process.env.CONTATO_EMAIL_PARA ?? 'contato@acidi.net').split(',').map(s => s.trim()),
      reply_to: responderPara, subject: assunto, text: texto,
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}
